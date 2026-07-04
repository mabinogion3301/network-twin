import { useCallback, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { topologyApi } from '../services/api/auth.api';
import { stationsApi } from '../services/api/stations.api';
import { api } from '../services/api/client';
import { simulationsApi } from '../services/api/dashboard.api';
import { EventsPanel } from '../components/topology/EventsPanel';
import { ImpactPanel } from '../components/topology/ImpactPanel';
import { useWebSocket, SimulationResult } from '../hooks/useWebSocket';

interface GeoStation {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
}

interface GeoLink {
  id: string;
  name: string;
  sourceStationId: string;
  targetStationId: string;
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
const BROKEN_COLOR = '#ef4444'; // rompido / sem comunicação
const DEGRADED_COLOR = '#eab308'; // atenuado (perdeu redundância, mas ainda tem >1 caminho)
const SATURATING_COLOR = '#3b82f6'; // saturando (tinha 3+ links, ficou com só 1)

type StationVisualState = 'broken' | 'saturating' | 'degraded' | 'normal';

function towerIcon(color: string, pulsing: boolean) {
  const html = `
    <div style="
      width: 34px; height: 34px; border-radius: 8px;
      background: #0f172a; border: 2px solid ${color};
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 8px ${color}80;
      ${pulsing ? 'animation: ntw-pulse 1.2s infinite;' : ''}
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
    <style>
      @keyframes ntw-pulse {
        0% { box-shadow: 0 0 4px ${color}80; }
        50% { box-shadow: 0 0 16px 4px ${color}; }
        100% { box-shadow: 0 0 4px ${color}80; }
      }
    </style>`;
  return L.divIcon({ html, className: '', iconSize: [34, 34], iconAnchor: [17, 17] });
}

const BRAZIL_CENTER: [number, number] = [-14.235, -51.9253];
const INITIAL_ZOOM = 4;
// Zoom a partir do qual o nome da estação aparece fixo no mapa — abaixo
// disso (visão geral do Brasil), os nomes ficam escondidos para não poluir.
const LABEL_VISIBLE_ZOOM = 7;

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
  useWebSocket(handleSimulationResult);

  // "Normalizar" — seja de uma estação específica ou tudo — funciona
  // EXATAMENTE como "Romper": chama o mesmo endpoint, que persiste o novo
  // estado e transmite via WebSocket para todos os usuários conectados.
  // A diferença é só que a lista de conexões removidas fica MENOR (ou vazia).
  async function normalizeIds(remainingIds: string[]) {
    try {
      await api.post('/simulations', { connectionIds: remainingIds });
      // o resultado atualizado chega para todo mundo via WebSocket
    } catch {
      // falha ao normalizar — estado visual permanece como estava até tentar de novo
    }
  }

  function normalizeStation(stationId: string) {
    const activeIds = simulationResult?.removedConnectionIds ?? [];
    const idsTouchingStation = new Set(
      links.filter((l) => l.sourceStationId === stationId || l.targetStationId === stationId).map((l) => l.id),
    );
    normalizeIds(activeIds.filter((id) => !idsTouchingStation.has(id)));
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

  const removedConnectionIds = new Set(simulationResult?.removedConnectionIds ?? []);
  const unavailableStationIds = new Set(
    (simulationResult?.unavailableStationPairs ?? []).flatMap((p) => [p.stationAId, p.stationBId]),
  );

  function computeDegrees(stationId: string) {
    const touching = links.filter((l) => l.sourceStationId === stationId || l.targetStationId === stationId);
    const original = touching.length;
    const remaining = simulationResult ? touching.filter((l) => !removedConnectionIds.has(l.id)).length : original;
    return { original, remaining };
  }

  function stationVisualState(station: GeoStation): StationVisualState {
    if (!simulationResult) return 'normal';
    if (unavailableStationIds.has(station.id)) return 'broken';

    const { original, remaining } = computeDegrees(station.id);
    if (original >= 3 && remaining === 1) return 'saturating';
    if (remaining < original) return 'degraded';
    return 'normal';
  }

  function colorForState(state: StationVisualState, fallback: string): string {
    if (state === 'broken') return BROKEN_COLOR;
    if (state === 'saturating') return SATURATING_COLOR;
    if (state === 'degraded') return DEGRADED_COLOR;
    return fallback;
  }

  // Cor/estilo da linha: prioridade para o resultado da simulação ativa;
  // sem simulação (ou link não afetado), usa a cor do TIPO de conexão/operadora.
  function colorForLink(link: GeoLink): { color: string; dashed: boolean; broken: boolean } {
    if (removedConnectionIds.has(link.id)) {
      return { color: BROKEN_COLOR, dashed: true, broken: true };
    }
    if (simulationResult) {
      const sourceState = stationVisualState(stationById[link.sourceStationId]);
      const targetState = stationVisualState(stationById[link.targetStationId]);
      if (sourceState === 'saturating' || targetState === 'saturating') {
        return { color: SATURATING_COLOR, dashed: false, broken: false };
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
      <div style={{ padding: '12px 20px', background: '#1e293b', color: '#e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Mapa da Rede — Cobertura Nacional</h3>
        {loading && <span style={{ fontSize: 12, color: '#94a3b8' }}>Carregando...</span>}
      </div>

      <EventsPanel activeConnectionIds={simulationResult?.removedConnectionIds ?? []} />

      {simulationResult && (simulationResult.removedConnectionIds?.length ?? 0) > 0 && (
        <div style={{ padding: '6px 20px', background: '#1e293b', display: 'flex', gap: 16, fontSize: 12, color: '#94a3b8', alignItems: 'center', flexWrap: 'wrap' }}>
          <Legend color={BROKEN_COLOR} label="Rompido / sem comunicação" />
          <Legend color={DEGRADED_COLOR} label="Atenuado (perdeu redundância)" />
          <Legend color={SATURATING_COLOR} label="Saturando (restou só 1 link)" />
          <button
            onClick={normalizeAll}
            style={{ marginLeft: 'auto', background: '#334155', border: 'none', borderRadius: 6, padding: '4px 10px', color: '#e2e8f0', cursor: 'pointer', fontSize: 12 }}
          >
            ✓ Normalizar tudo
          </button>
        </div>
      )}

      {stationsWithoutCoords.length > 0 && (
        <div style={{ padding: '8px 20px', background: '#422006', color: '#fbbf24', fontSize: 13 }}>
          {stationsWithoutCoords.length} estação(ões) sem coordenadas cadastradas e por isso não aparecem no mapa:{' '}
          {stationsWithoutCoords.map((s) => s.name).join(', ')}. Edite-as em "Estações" para informar Latitude/Longitude.
        </div>
      )}

      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <MapContainer center={BRAZIL_CENTER} zoom={INITIAL_ZOOM} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
            <ZoomTracker onZoomChange={setZoom} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {links.map((link) => {
              const source = stationById[link.sourceStationId];
              const target = stationById[link.targetStationId];
              if (!source?.latitude || !target?.latitude) return null;

              const { color, dashed, broken } = colorForLink(link);
              const typeStyle = CONNECTION_TYPE_STYLES[link.type];

              return (
                <Polyline
                  key={link.id}
                  positions={[
                    [source.latitude, source.longitude!],
                    [target.latitude, target.longitude!],
                  ]}
                  pathOptions={{ color, weight: broken ? 4 : 3, dashArray: dashed ? '8 6' : undefined }}
                >
                  <Popup>
                    <strong>{link.name}</strong>
                    <br />
                    {source.name} ⟷ {target.name}
                    <br />
                    Tipo:{' '}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: typeStyle?.color ?? '#94a3b8', display: 'inline-block' }} />
                      {typeStyle?.label ?? link.type}
                    </span>
                    <br />
                    Status: {broken ? 'ROMPIDO (simulação ativa)' : link.status}
                  </Popup>
                </Polyline>
              );
            })}

            {stationsWithCoords.map((station) => {
              const state = stationVisualState(station);
              const color = colorForState(state, STATUS_COLORS[station.status] ?? '#94a3b8');
              const pulsing = state === 'broken';
              const touchingTypes = typesTouchingStation(station.id);

              return (
                <Marker
                  key={station.id}
                  position={[station.latitude!, station.longitude!]}
                  icon={towerIcon(color, pulsing)}
                  draggable
                  eventHandlers={{
                    dragend: (e) => {
                      const { lat, lng } = e.target.getLatLng();
                      handleStationDragEnd(station.id, lat, lng);
                    },
                  }}
                >
                  {zoom >= LABEL_VISIBLE_ZOOM && (
                    <Tooltip permanent direction="top" offset={[0, -20]} opacity={0.95} className="station-name-tooltip">
                      {station.name}
                    </Tooltip>
                  )}
                  <Popup>
                    <strong>{station.name}</strong>
                    <br />
                    {station.city} - {station.state}
                    <br />
                    Status:{' '}
                    {state === 'broken'
                      ? 'SEM COMUNICAÇÃO (simulação ativa)'
                      : state === 'saturating'
                        ? 'SATURANDO (restou só 1 link)'
                        : state === 'degraded'
                          ? 'ATENUADO (perdeu redundância)'
                          : station.status}

                    {touchingTypes.length > 0 && (
                      <>
                        <br />
                        <strong style={{ fontSize: 12 }}>Conexões desta estação:</strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                          {touchingTypes.map((t) => (
                            <span key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                              <span
                                style={{
                                  width: 16,
                                  height: 0,
                                  borderTop: `2px ${t.dashed ? 'dashed' : 'solid'} ${t.color}`,
                                  display: 'inline-block',
                                }}
                              />
                              {t.label}
                            </span>
                          ))}
                        </div>
                      </>
                    )}

                    <br />
                    {state !== 'normal' ? (
                      <button
                        onClick={() => normalizeStation(station.id)}
                        style={{
                          marginTop: 8,
                          background: '#22c55e',
                          border: 'none',
                          borderRadius: 6,
                          padding: '6px 12px',
                          color: 'white',
                          fontWeight: 600,
                          cursor: 'pointer',
                          width: '100%',
                        }}
                      >
                        ✓ Normalizar esta estação
                      </button>
                    ) : (
                      <em style={{ fontSize: 11 }}>Arraste a torre para ajustar a posição real no mapa.</em>
                    )}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        <ImpactPanel result={simulationResult} />
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
