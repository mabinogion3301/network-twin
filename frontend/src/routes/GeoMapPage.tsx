import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { topologyApi } from '../services/api/auth.api';
import { stationsApi } from '../services/api/stations.api';
import { api } from '../services/api/client';
import { simulationsApi } from '../services/api/dashboard.api';
import { useWebSocket, SimulationResult } from '../hooks/useWebSocket';

interface GeoStation {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  trechos: string[];
  equipmentIds: string[];
  isCore: boolean;
}

interface GeoLink {
  id: string;
  name: string;
  sourceStationId: string;
  targetStationId: string;
  sourceEquipmentName: string;
  targetEquipmentName: string;
  status: string;
  type: string;
  isBackup: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  ONLINE: '#22c55e',
  OFFLINE: '#ef4444',
  ALERT: '#eab308',
  DISABLED: '#6b7280',
  MAINTENANCE: '#3b82f6',
};

// Estilo visual (cor + tracejado) de cada TIPO de conexão/operadora.
// Capacidades = mesma cor da fibra do mesmo provedor, mas tracejadas.
export const CONNECTION_TYPE_STYLES: Record<string, { label: string; color: string; dashed: boolean }> = {
  // Eletronorte — roxo
  ELETRONORTE_CAPACITY: { label: 'Capacidade Eletronorte', color: '#8b5cf6', dashed: true  },
  ELETRONORTE_FIBER:    { label: 'Fibra Eletronorte',       color: '#8b5cf6', dashed: false },
  // TIM — rosa choque
  TIM_CAPACITY:         { label: 'Capacidade TIM',          color: '#ec4899', dashed: true  },
  TIM_FIBER:            { label: 'Fibra TIM',               color: '#ec4899', dashed: false },
  // Eletrosul — azul claro
  ELETROSUL_CAPACITY:   { label: 'Capacidade Eletrosul',    color: '#38bdf8', dashed: true  },
  ELETROSUL_FIBER:      { label: 'Fibra Eletrosul',         color: '#38bdf8', dashed: false },
  // GVT — marrom âmbar
  GVT_FIBER:            { label: 'Fibra GVT',               color: '#d97706', dashed: false },
  // Chesf — amarelo
  CHESF_FIBER:          { label: 'Fibra Chesf',             color: '#facc15', dashed: false },
  // Furnas — laranja
  FURNAS_FIBER:         { label: 'Fibra Furnas',            color: '#f97316', dashed: false },
  // Petrobras — verde escuro
  PETROBRAS_FIBER:      { label: 'Fibra Petrobras',         color: '#16a34a', dashed: false },
  // Cemig — verde lima
  CEMIG_FIBER:          { label: 'Fibra Cemig',             color: '#84cc16', dashed: false },
  // Telebras — branco
  TELEBRAS_FIBER:       { label: 'Fibra Telebras',          color: '#f8fafc', dashed: false },
  // RNP — ciano
  RNP_FIBER:            { label: 'Fibra RNP',               color: '#06b6d4', dashed: false },
  // Prodepa — vermelho coral
  PRODEPA_FIBER:        { label: 'Fibra Prodepa',           color: '#f43f5e', dashed: false },
  // Genérico
  OTHER:                { label: 'Outro',                   color: '#94a3b8', dashed: false },
};

// Cores do RESULTADO de uma simulação de falha (têm prioridade sobre a cor
// do tipo de conexão enquanto o resultado estiver ativo):
// ─── Estados visuais conforme spec ────────────────────────────────────────────
// NORMAL   → verde (sem animação)
// DEGRADING → amarelo âmbar (perdeu redundância mas ainda gerenciada)
// IMPACTED  → roxo pulsante lento (na zona de impacto, redundância preservada)
// ISOLATED  → vermelho pulsante forte (sem caminho para nenhum CORE)
const ISOLATED_COLOR  = '#ef4444'; // vermelho
const DEGRADING_COLOR = '#f59e0b'; // âmbar
const IMPACTED_COLOR  = '#7c3aed'; // roxo

type StationVisualState = 'ISOLATED' | 'DEGRADING' | 'IMPACTED' | 'NORMAL';

function towerIcon(color: string, pulse: 'none' | 'fast' | 'slow' | 'fire') {
  const isfire = pulse === 'fire';
  const animation =
    pulse === 'fast' ? 'animation: ntw-pulse-fast 0.9s infinite;' :
    pulse === 'slow' ? 'animation: ntw-pulse-slow 2s infinite;' :
    pulse === 'fire' ? 'animation: ntw-fire 0.4s infinite;' : '';

  const borderColor = isfire ? '#f97316' : color;
  const html = `
    <div style="position:relative;width:34px;height:34px;">
      <div style="
        width: 34px; height: 34px; border-radius: 8px;
        background: #0f172a; border: 2px solid ${borderColor};
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 0 8px ${borderColor}80;
        ${animation}
        cursor: grab;
      ">
        <svg width="20" height="20" viewBox="0 0 64 64">
          <g stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M32 6 L14 58 M32 6 L50 58" />
            <path d="M20 30 L44 30 M17 42 L47 42" />
            <circle cx="32" cy="6" r="5" fill="${color}" stroke="none" />
            <path d="M24 14 A12 12 0 0 1 40 14" />
          </g>
        </svg>
      </div>
      ${isfire ? '<div style="position:absolute;top:-8px;right:-4px;font-size:14px;line-height:1;">🔥</div>' : ''}
    </div>
    <style>
      @keyframes ntw-pulse-fast {
        0%   { box-shadow: 0 0 4px ${color}80; }
        50%  { box-shadow: 0 0 20px 6px ${color}; }
        100% { box-shadow: 0 0 4px ${color}80; }
      }
      @keyframes ntw-pulse-slow {
        0%   { box-shadow: 0 0 4px ${color}60; }
        50%  { box-shadow: 0 0 12px 3px ${color}; }
        100% { box-shadow: 0 0 4px ${color}60; }
      }
      @keyframes ntw-fire {
        0%   { box-shadow: 0 0 8px #f97316, 0 0 16px #ef4444; border-color: #f97316; }
        25%  { box-shadow: 0 0 14px #ef4444, 0 0 24px #f97316; border-color: #ef4444; }
        50%  { box-shadow: 0 0 10px #f59e0b, 0 0 20px #ef4444; border-color: #f59e0b; }
        75%  { box-shadow: 0 0 16px #f97316, 0 0 28px #ef4444; border-color: #f97316; }
        100% { box-shadow: 0 0 8px #f97316, 0 0 16px #ef4444; border-color: #f97316; }
      }
    </style>`;
  return L.divIcon({ html, className: '', iconSize: [34, 34], iconAnchor: [17, 17] });
}

const BRAZIL_CENTER: [number, number] = [-14.235, -51.9253];
const INITIAL_ZOOM = 4;
// Zoom a partir do qual o nome da estação aparece fixo no mapa — abaixo
// disso (visão geral do Brasil), os nomes ficam escondidos para não poluir.
const LABEL_VISIBLE_ZOOM = 7;

/**
 * Desloca lateralmente um segmento de linha em `offsetMeters` metros
 * perpendicular à direção (lat1,lng1)→(lat2,lng2).
 * Usado para separar visualmente conexões paralelas entre o mesmo par
 * de estações que ficariam empilhadas no mapa.
 */
function applyOffset(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  offsetMeters: number,
): [[number, number], [number, number]] {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLng = toRad(lng2 - lng1);
  const lat1r = toRad(lat1);
  const lat2r = toRad(lat2);
  const y = Math.sin(dLng) * Math.cos(lat2r);
  const x = Math.cos(lat1r) * Math.sin(lat2r) - Math.sin(lat1r) * Math.cos(lat2r) * Math.cos(dLng);
  const bearing = Math.atan2(y, x);
  const perp = bearing + Math.PI / 2;
  const midLat = (lat1 + lat2) / 2;
  const dLatDeg = (offsetMeters / 111320) * Math.cos(perp);
  const dLngDeg = (offsetMeters / (111320 * Math.cos(toRad(midLat)))) * Math.sin(perp);
  return [
    [lat1 + dLatDeg, lng1 + dLngDeg],
    [lat2 + dLatDeg, lng2 + dLngDeg],
  ];
}

// Componente "invisível" que só observa o zoom atual do mapa e avisa o
// componente pai — é assim que decidimos quando mostrar/escoder os nomes.
function ZoomTracker({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  useMapEvents({
    zoomend: (e) => onZoomChange(e.target.getZoom()),
  });
  return null;
}

export function GeoMapPage() {
  const [stations, setStations] = useState<GeoStation[]>([]);
  const [links, setLinks] = useState<GeoLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  // Superaquecimento: estado puramente local/visual — não afeta BFS nem vizinhas
  const [localOverheatIds, setLocalOverheatIds] = useState<Set<string>>(new Set());

  function load() {
    setLoading(true);
    topologyApi
      .geo()
      .then((data) => {
        setStations(data.stations);
        setLinks(data.links);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  // Restaura o estado de falha ATIVO ao entrar/voltar para esta tela — sem
  // isso, navegar para "Estações" e voltar faria a simulação "desaparecer"
  // mesmo que ela ainda esteja ativa no banco para todos os outros usuários.
  useEffect(() => {
    simulationsApi.current().then((result) => {
      if (result) setSimulationResult(result as SimulationResult);
    });
  }, []);

  // Sempre que QUALQUER usuário conectado dispara OU normaliza uma
  // simulação, todos recebem o resultado aqui via WebSocket — sem F5.
  const handleSimulationResult = useCallback((result: SimulationResult) => {
    setSimulationResult(result);
  }, []);

  // Quando qualquer usuário cria/edita/remove estação, equipamento ou
  // conexão, o backend emite 'topology:changed' e recarregamos o mapa aqui
  // — garante que todos os PCs vejam a topologia sempre atualizada.
  const handleTopologyChanged = useCallback(() => { load(); }, []);

  useWebSocket(handleSimulationResult, handleTopologyChanged);

  // "Normalizar" — seja de uma estação específica ou tudo — funciona
  // EXATAMENTE como "Romper": chama o mesmo endpoint, que persiste o novo
  // estado e transmite via WebSocket para todos os usuários conectados.
  // A diferença é só que a lista de conexões removidas fica MENOR (ou vazia).
  async function normalizeIds(remainingConnectionIds: string[]) {
    try {
      const res = await api.post('/simulations', { connectionIds: remainingConnectionIds });
      if (res?.data) setSimulationResult(res.data);
      load();
    } catch {
      // falha ao normalizar
    }
  }

  function normalizeStation(stationId: string) {
    const activeConns = simulationResult?.removedConnectionIds ?? [];
    const stationLinkIds = new Set(
      links.filter((l) => l.sourceStationId === stationId || l.targetStationId === stationId).map((l) => l.id),
    );
    normalizeIds(activeConns.filter((id) => !stationLinkIds.has(id)));
  }

  function normalizeAll() {
    normalizeIds([]);
  }

  // Arrastar a torre no Mapa do Brasil move a posição GEOGRÁFICA real da estação.
  function handleStationDragEnd(stationId: string, lat: number, lng: number) {
    setStations((prev) => prev.map((s) => (s.id === stationId ? { ...s, latitude: lat, longitude: lng } : s)));
    stationsApi.update(stationId, { latitude: lat, longitude: lng }).catch(() => {});
  }

  const stationsWithCoords = stations.filter((s) => s.latitude != null && s.longitude != null);
  const stationsWithoutCoords = stations.filter((s) => s.latitude == null || s.longitude == null);
  const stationById = Object.fromEntries(stations.map((s) => [s.id, s]));

  // Conexões marcadas como rompidas na simulação
  const removedConnectionIds = new Set(simulationResult?.removedConnectionIds ?? []);

  // Estações em superaquecimento — estado local, não afeta BFS nem impacto
  const overheatStationIds = localOverheatIds;

  // COREs: prioridade para os retornados pelo backend (mais confiável),
  // fallback para os marcados localmente nas estações
  const localCoreIds = stations.filter((s) => s.isCore).map((s) => s.id);
  const backendCoreIds = simulationResult?.coreStationIds ?? [];
  const coreStationIds = localCoreIds.length > 0 ? localCoreIds : backendCoreIds;

  // Calcula o estado de cada estação via BFS a partir dos COREs.
  // Roda no frontend usando os dados já carregados (links + stations),
  // garantindo resultado correto independente do que o backend retornar.
  const computedStationStates = (() => {
    const result: Record<string, StationVisualState> = {};
    if (!simulationResult || removedConnectionIds.size === 0) return result;

    // Grafo completo e grafo operacional (sem falhas)
    const fullAdj = new Map<string, Set<string>>();
    const opAdj   = new Map<string, Set<string>>();

    for (const link of links) {
      if (!fullAdj.has(link.sourceStationId)) fullAdj.set(link.sourceStationId, new Set());
      if (!fullAdj.has(link.targetStationId)) fullAdj.set(link.targetStationId, new Set());
      fullAdj.get(link.sourceStationId)!.add(link.targetStationId);
      fullAdj.get(link.targetStationId)!.add(link.sourceStationId);

      if (removedConnectionIds.has(link.id)) continue;
      if (!opAdj.has(link.sourceStationId)) opAdj.set(link.sourceStationId, new Set());
      if (!opAdj.has(link.targetStationId)) opAdj.set(link.targetStationId, new Set());
      opAdj.get(link.sourceStationId)!.add(link.targetStationId);
      opAdj.get(link.targetStationId)!.add(link.sourceStationId);
    }

    function bfs(adj: Map<string, Set<string>>, sources: string[]): Set<string> {
      const visited = new Set<string>(sources);
      const queue = [...sources];
      while (queue.length > 0) {
        const curr = queue.shift()!;
        for (const nb of (adj.get(curr) ?? new Set<string>())) {
          if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
        }
      }
      return visited;
    }

    // Estações alcançáveis a partir de qualquer CORE no grafo operacional.
    // Quando COREs existem: BFS a partir deles.
    // Se o CORE perdeu TODAS as conexões (ex: perda de gerência simulada),
    // o BFS só alcança o próprio CORE → todas as outras estações ficam ISOLADAS.
    // Sem CORE: maior componente conectado = gerenciado.
    let managedStations: Set<string>;

    if (coreStationIds.length > 0) {
      managedStations = bfs(opAdj, coreStationIds);
    } else {
      const visited = new Set<string>();
      const components: Array<Set<string>> = [];
      for (const st of stations) {
        if (!visited.has(st.id)) {
          const comp = bfs(opAdj, [st.id]);
          comp.forEach((id) => visited.add(id));
          components.push(comp);
        }
      }
      managedStations = components.sort((a, b) => b.size - a.size)[0] ?? new Set<string>();
    }

    // Zona de impacto: tudo conectado às pontas das falhas
    const failureEndpoints = new Set<string>();
    for (const link of links) {
      if (removedConnectionIds.has(link.id)) {
        failureEndpoints.add(link.sourceStationId);
        failureEndpoints.add(link.targetStationId);
      }
    }
    const failureZone = bfs(opAdj, [...failureEndpoints]);

    for (const station of stations) {
      const origDeg = (fullAdj.get(station.id) ?? new Set()).size;
      const currDeg = (opAdj.get(station.id)  ?? new Set()).size;

      if (!managedStations.has(station.id)) {
        result[station.id] = 'ISOLATED';
      } else if (currDeg < origDeg) {
        result[station.id] = 'DEGRADING';
      } else if (failureZone.has(station.id)) {
        result[station.id] = 'IMPACTED';
      } else {
        result[station.id] = 'NORMAL';
      }
    }

    return result;
  })();

  // Usa o resultado do backend se vier completo, senão usa o calculado localmente
  const backendStates  = simulationResult?.stationStates ?? {};
  const hasBackend     = Object.keys(backendStates).length > 0;
  const stationStates  = hasBackend ? backendStates : computedStationStates;

  function stationVisualState(station: GeoStation): StationVisualState {
    if (!simulationResult) return 'NORMAL';
    return (stationStates[station.id] ?? 'NORMAL') as StationVisualState;
  }

  function colorForState(state: StationVisualState, fallback: string): string {
    if (state === 'ISOLATED')  return ISOLATED_COLOR;
    if (state === 'DEGRADING') return DEGRADING_COLOR;
    if (state === 'IMPACTED')  return IMPACTED_COLOR;
    return fallback;
  }

  function pulseForState(state: StationVisualState, overheating: boolean): 'none' | 'fast' | 'slow' | 'fire' {
    if (overheating) return 'fire';
    if (state === 'ISOLATED') return 'fast';
    if (state === 'IMPACTED') return 'slow';
    return 'none';
  }

  function colorForLink(link: GeoLink): { color: string; dashed: boolean; broken: boolean } {
    if (removedConnectionIds.has(link.id)) {
      return { color: ISOLATED_COLOR, dashed: true, broken: true };
    }
    // Link que toca uma estação isolada ou degradada fica com a cor de alerta
    if (simulationResult) {
      const srcState = stationVisualState(stationById[link.sourceStationId]);
      const tgtState = stationVisualState(stationById[link.targetStationId]);
      if (srcState === 'ISOLATED' || tgtState === 'ISOLATED') {
        return { color: ISOLATED_COLOR, dashed: true, broken: true };
      }
      if (srcState === 'DEGRADING' || tgtState === 'DEGRADING') {
        return { color: DEGRADING_COLOR, dashed: false, broken: false };
      }
    }
    const typeStyle = CONNECTION_TYPE_STYLES[link.type];
    if (typeStyle) return { color: typeStyle.color, dashed: typeStyle.dashed, broken: false };
    return { color: STATUS_COLORS[link.status] ?? '#94a3b8', dashed: link.isBackup, broken: false };
  }

  // Tipos de conexão distintos que tocam uma estação — exibido no popup dela.
  function typesTouchingStation(stationId: string) {
    const touching = links.filter((l) => l.sourceStationId === stationId || l.targetStationId === stationId);
    const distinctTypes = Array.from(new Set(touching.map((l) => l.type)));
    return distinctTypes.map((t) => CONNECTION_TYPE_STYLES[t] ?? { label: t, color: '#94a3b8', dashed: false });
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>

      {/* Barra de status — só aparece quando há simulação ativa */}
      {simulationResult && (simulationResult.removedConnectionIds?.length ?? 0) > 0 && (
        <div style={{
          padding: '8px 20px', background: 'rgba(239,68,68,0.1)',
          borderBottom: '1px solid rgba(239,68,68,0.25)',
          display: 'flex', alignItems: 'center', gap: 12, fontSize: 12,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', boxShadow: '0 0 6px #ef4444', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            SIMULAÇÃO ATIVA · {simulationResult.removedConnectionIds.length} falha(s)
            {simulationResult.stats?.isolated ? ` · ${simulationResult.stats.isolated} isolada(s)` : ''}
            {simulationResult.stats?.degrading ? ` · ${simulationResult.stats.degrading} degradando` : ''}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Legend color={ISOLATED_COLOR}  label="Isolada" />
            <Legend color={IMPACTED_COLOR}  label="Impactada" />
            <Legend color={DEGRADING_COLOR} label="Degradando" />
          </div>
          <button
            onClick={normalizeAll}
            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-hi)', borderRadius: 'var(--radius)', padding: '4px 10px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)', flexShrink: 0 }}
          >
            ✓ Normalizar tudo
          </button>
        </div>
      )}

      {stationsWithoutCoords.length > 0 && (
        <div style={{ padding: '7px 20px', background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: 12 }}>
          {stationsWithoutCoords.length} estação(ões) sem coordenadas: {stationsWithoutCoords.map((s) => s.name).join(', ')} — edite em "Estações" para aparecer no mapa.
        </div>
      )}

      <div style={{ flex: 1 }}>
        <MapContainer center={BRAZIL_CENTER} zoom={INITIAL_ZOOM} style={{ height: '100%', width: '100%', background: 'var(--bg-base)' }}>
            <ZoomTracker onZoomChange={setZoom} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              className="map-tiles-dark"
            />

            {(() => {
              // Agrupa links pelo par de estações (ordem canônica A<B para
              // tratar A→B e B→A como o mesmo par) e calcula o índice de
              // cada link dentro do grupo, para aplicar o offset lateral.
              const pairCount: Record<string, number> = {};
              const pairIndex: Record<string, number> = {};
              for (const link of links) {
                const key = [link.sourceStationId, link.targetStationId].sort().join('|');
                pairIndex[link.id] = pairCount[key] ?? 0;
                pairCount[key] = (pairCount[key] ?? 0) + 1;
              }

              return links.map((link) => {
                const source = stationById[link.sourceStationId];
                const target = stationById[link.targetStationId];
                if (!source?.latitude || !target?.latitude) return null;

                const { color, dashed, broken } = colorForLink(link);
                const typeStyle = CONNECTION_TYPE_STYLES[link.type];

                const pairKey = [link.sourceStationId, link.targetStationId].sort().join('|');
                const total = pairCount[pairKey] ?? 1;
                const idx = pairIndex[link.id] ?? 0;

                // Distribui os links simetricamente ao redor do centro:
                // ex: 2 links → offsets [-3000, +3000]m
                //     3 links → [-4000, 0, +4000]m
                const SPACING = 3000; // metros entre cada linha paralela
                const offsetMeters = total > 1
                  ? (idx - (total - 1) / 2) * SPACING
                  : 0;

                const positions = offsetMeters !== 0
                  ? applyOffset(source.latitude, source.longitude!, target.latitude, target.longitude!, offsetMeters)
                  : [[source.latitude, source.longitude!], [target.latitude, target.longitude!]] as [[number, number], [number, number]];

                return (
                  <Polyline
                    key={link.id}
                    positions={positions}
                    pathOptions={{ color, weight: broken ? 4 : 3, dashArray: dashed ? '8 6' : undefined }}
                  >
                    <Popup>
                      <div style={{ minWidth: 200 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, borderBottom: '1px solid #1e293b', paddingBottom: 6 }}>
                          {link.name}
                        </div>

                        {/* Ponta A */}
                        <div style={{ fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: '#64748b', fontSize: 10, display: 'block', marginBottom: 1 }}>ORIGEM</span>
                          <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{link.sourceEquipmentName}</span>
                          <span style={{ color: '#64748b' }}> · {source.name}</span>
                        </div>

                        <div style={{ textAlign: 'center', color: '#334155', fontSize: 11, margin: '4px 0' }}>⟷</div>

                        {/* Ponta B */}
                        <div style={{ fontSize: 12, marginBottom: 8 }}>
                          <span style={{ color: '#64748b', fontSize: 10, display: 'block', marginBottom: 1 }}>DESTINO</span>
                          <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{link.targetEquipmentName}</span>
                          <span style={{ color: '#64748b' }}> · {target.name}</span>
                        </div>

                        {/* Tipo e status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: 6, fontSize: 11 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: typeStyle?.color ?? '#94a3b8', display: 'inline-block' }} />
                            {typeStyle?.label ?? link.type}
                          </span>
                          <span style={{ color: broken ? '#ef4444' : '#94a3b8' }}>
                            {broken ? '⚠ ROMPIDO' : link.status}
                          </span>
                        </div>
                        {/* Ações e nota — só para conexões rompidas */}
                        {broken ? (
                          <ConnectionNotePanel
                            link={link}
                            simulationResult={simulationResult}
                            onNormalize={async () => {
                              const remaining = (simulationResult?.removedConnectionIds ?? []).filter(id => id !== link.id);
                              await normalizeIds(remaining);
                            }}
                            onSaveNote={async (note: string) => {
                              if (!simulationResult?.simulationId) return;
                              await api.patch(`/simulations/${simulationResult.simulationId}/connection-note`, { connectionId: link.id, note });
                            }}
                          />
                        ) : (
                          <div style={{ marginTop: 8 }}>
                            <button
                              onClick={async () => {
                                const currentState = await simulationsApi.current().catch(() => null);
                                const active = [...new Set([
                                  ...(currentState?.removedConnectionIds ?? []),
                                  ...(simulationResult?.removedConnectionIds ?? []),
                                ])];
                                const res = await api.post('/simulations', { connectionIds: [...new Set([...active, link.id])] });
                                if (res?.data) setSimulationResult(res.data);
                                load();
                              }}
                              style={{ width: '100%', padding: '7px', background: '#ef4444', border: 'none', borderRadius: 6, color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                            >
                              ⚡ Simular Rompimento
                            </button>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Polyline>
                );
              });
            })()}

            {stationsWithCoords.map((station) => {
              const state = stationVisualState(station);
              const color = colorForState(state, STATUS_COLORS[station.status] ?? '#94a3b8');
              const overheating = overheatStationIds.has(station.id);
              const pulse = pulseForState(state, overheating);
              const touchingTypes = typesTouchingStation(station.id);
              const icon = towerIcon(color, pulse);

              return (
                <DynamicMarker
                  key={station.id}
                  position={[station.latitude!, station.longitude!]}
                  icon={icon}
                  draggable
                  onDragEnd={(lat: number, lng: number) => handleStationDragEnd(station.id, lat, lng)}
                  zoom={zoom}
                  stationName={station.name}
                  touchingTypes={touchingTypes}
                  state={state}
                  overheating={overheating}
                  station={station}
                  simulationResult={simulationResult}
                  onNormalizeStation={() => normalizeStation(station.id)}
                  onSimulateFailure={async () => {
                    const currentState = await simulationsApi.current().catch(() => null);
                    const activeConns = [...new Set([
                      ...(currentState?.removedConnectionIds ?? []),
                      ...(simulationResult?.removedConnectionIds ?? []),
                    ])];
                    const activeOverheat = [...new Set([
                      ...(currentState?.overheatStationIds ?? []),
                      ...(simulationResult?.overheatStationIds ?? []),
                    ])];
                    const stationLinkIds = links
                      .filter(l => l.sourceStationId === station.id || l.targetStationId === station.id)
                      .map(l => l.id);
                    const res = await api.post('/simulations', {
                      connectionIds: [...new Set([...activeConns, ...stationLinkIds])],
                      overheatStationIds: activeOverheat,
                    });
                    if (res?.data) setSimulationResult(res.data);
                    load();
                  }}
                  onSimulateOverheat={() => {
                    setLocalOverheatIds(prev => new Set([...prev, station.id]));
                  }}
                  onNormalizeOverheat={() => {
                    setLocalOverheatIds(prev => { const s = new Set(prev); s.delete(station.id); return s; });
                  }}
                />
              );
            })}
          </MapContainer>
      </div>
    </div>
  );
}

// DynamicMarker atualiza o ícone imperativamente via ref — assim o Leaflet
// chama setIcon() diretamente no marker sem desmontar o componente nem fechar
// o Popup que estiver aberto.
function DynamicMarker({ position, icon, draggable, onDragEnd, zoom, stationName,
  touchingTypes, state, overheating, station, simulationResult,
  onNormalizeStation, onSimulateFailure, onSimulateOverheat, onNormalizeOverheat }: any) {  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(icon);
    }
  }, [icon]);

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={icon}
      draggable={draggable}
      eventHandlers={{
        dragend: (e: any) => {
          const { lat, lng } = e.target.getLatLng();
          onDragEnd(lat, lng);
        },
      }}
    >
      {zoom >= LABEL_VISIBLE_ZOOM && (
        <Tooltip permanent direction="top" offset={[0, -20]} opacity={0.95} className="station-name-tooltip">
          {stationName}
        </Tooltip>
      )}
      <Popup>
        <strong>{station.name}</strong>
        <br />
        {station.city} - {station.state}
        <br />
        Status:{' '}
        {state === 'ISOLATED'
          ? 'ISOLADA — sem caminho para nenhum CORE'
          : state === 'DEGRADING'
            ? 'DEGRADANDO — perdeu redundância'
            : state === 'IMPACTED'
              ? 'IMPACTADA — na zona de falha, mas gerenciada'
              : station.status}

        {station.trechos && station.trechos.length > 0 && (
          <>
            <br />
            <strong style={{ fontSize: 12 }}>Trechos:</strong>{' '}
            <span style={{ fontSize: 12, color: '#a78bfa' }}>{station.trechos.join(', ')}</span>
          </>
        )}

        {touchingTypes.length > 0 && (
          <>
            <br />
            <strong style={{ fontSize: 12 }}>Conexões desta estação:</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
              {touchingTypes.map((t: any) => (
                <span key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ width: 16, height: 0, borderTop: `2px ${t.dashed ? 'dashed' : 'solid'} ${t.color}`, display: 'inline-block' }} />
                  {t.label}
                </span>
              ))}
            </div>
          </>
        )}

        <br />
        <StationActionPanel
          station={station}
          state={state}
          overheating={overheating}
          simulationResult={simulationResult}
          onNormalizeStation={onNormalizeStation}
          onSimulateFailure={onSimulateFailure}
          onSimulateOverheat={onSimulateOverheat}
          onNormalizeOverheat={onNormalizeOverheat}
        />
      </Popup>
    </Marker>
  );
}

// Painel de ações no popup da estação: simular falha ou normalizar + nota
function StationActionPanel({ station, state, overheating, simulationResult, onNormalizeStation, onSimulateFailure, onSimulateOverheat, onNormalizeOverheat }: {
  station: GeoStation;
  state: StationVisualState;
  overheating: boolean;
  simulationResult: SimulationResult | null;
  onNormalizeStation: () => void;
  onSimulateFailure: () => Promise<void>;
  onSimulateOverheat: () => Promise<void>;
  onNormalizeOverheat: () => Promise<void>;
}) {
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState('');

  async function handleSimulate() {
    setSimulating(true); setError('');
    try { await onSimulateFailure(); }
    catch (e: any) { setError(e?.response?.data?.message ?? 'Erro ao simular'); }
    finally { setSimulating(false); }
  }

  function handleOverheat() { onSimulateOverheat(); }

  if (state === 'NORMAL' && !overheating) {
    return (
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button onClick={handleSimulate} disabled={simulating}
          style={{ width: '100%', padding: '7px', background: '#ef4444', border: 'none', borderRadius: 6, color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer', opacity: simulating ? 0.7 : 1 }}>
          {simulating ? 'Simulando...' : '⚡ Simular Perda de Gerência'}
        </button>
        <button onClick={handleOverheat}
          style={{ width: '100%', padding: '7px', background: '#f97316', border: 'none', borderRadius: 6, color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
          🔥 Simular Superaquecimento
        </button>
        {station.isCore && <div style={{ fontSize: 10, color: '#3b82f6', textAlign: 'center' }}>★ Ponto de Gerência (CORE)</div>}
        {error && <div style={{ color: '#ef4444', fontSize: 11 }}>{error}</div>}
        <em style={{ display: 'block', fontSize: 10, color: '#64748b', textAlign: 'center' }}>Arraste para reposicionar.</em>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {overheating && (
        <button onClick={onNormalizeOverheat}
          style={{ width: '100%', padding: '7px', background: '#f97316', border: 'none', borderRadius: 6, color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
          🧊 Normalizar Superaquecimento
        </button>
      )}
      {!overheating && (
        <button onClick={handleOverheat}
          style={{ width: '100%', padding: '7px', background: '#f97316', border: 'none', borderRadius: 6, color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
          🔥 Simular Superaquecimento
        </button>
      )}
      {state !== 'NORMAL' && (
        <button onClick={onNormalizeStation}
          style={{ width: '100%', padding: '7px', background: '#10b981', border: 'none', borderRadius: 6, color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
          ✓ Normalizar Estação
        </button>
      )}
    </div>
  );
}

// Painel de nota + normalizar dentro do popup de uma conexão rompida.
// Usa estado local para evitar re-renders do mapa inteiro ao digitar.
function ConnectionNotePanel({ link, simulationResult, onNormalize, onSaveNote }: {
  link: any;
  simulationResult: SimulationResult | null;
  onNormalize: () => Promise<void>;
  onSaveNote: (note: string) => Promise<void>;
}) {
  const savedNote = simulationResult?.connectionNotes?.[link.id] ?? '';
  const [note, setNote] = useState(savedNote);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sincroniza a nota local sempre que o simulationResult atualizar
  // (WebSocket de outro usuário, ou carregamento inicial da página)
  useEffect(() => {
    setNote(simulationResult?.connectionNotes?.[link.id] ?? '');
  }, [simulationResult?.connectionNotes, link.id]);

  async function handleSave() {
    setSaving(true);
    await onSaveNote(note);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ marginTop: 10, borderTop: '1px solid #1e293b', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <textarea
        value={note}
        onChange={(e) => { setNote(e.target.value); setSaved(false); }}
        placeholder="Anotação: equipe acionada, previsão de retorno..."
        rows={2}
        style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 11, padding: '5px 8px', resize: 'vertical', fontFamily: 'sans-serif' }}
      />
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ flex: 1, padding: '6px', background: saved ? '#10b981' : '#3b82f6', border: 'none', borderRadius: 6, color: 'white', fontWeight: 600, fontSize: 11, cursor: 'pointer' }}
        >
          {saving ? 'Salvando...' : saved ? '✓ Salvo' : '📝 Salvar nota'}
        </button>
        <button
          onClick={onNormalize}
          style={{ flex: 1, padding: '6px', background: '#10b981', border: 'none', borderRadius: 6, color: 'white', fontWeight: 600, fontSize: 11, cursor: 'pointer' }}
        >
          ✓ Normalizar
        </button>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </span>
  );
}
