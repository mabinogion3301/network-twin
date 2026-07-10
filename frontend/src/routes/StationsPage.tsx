import React, { useCallback, useEffect, useRef, useState } from 'react';
import { stationsApi } from '../services/api/stations.api';
import { equipmentsApi, equipmentTypesApi } from '../services/api/equipments.api';
import { connectionsApi, portsApi } from '../services/api/connections.api';
import { CONNECTION_TYPE_STYLES } from './GeoMapPage';

// ─── tipos ───────────────────────────────────────────────────────────────────
interface Station { id: string; name: string; city: string; state: string; status: string; latitude?: number | null; longitude?: number | null; notes?: string; }
interface Equipment { id: string; name: string; ip?: string; status: string; typeId: string; type: { name: string }; ports: Port[]; }
interface Port { id: string; number: number; name?: string; type: string; }
interface Connection { id: string; name: string; type: string; status: string; isBackup: boolean; sourcePort: { id: string; number: number; equipment: { id: string; name: string; station: { name: string } } }; targetPort: { id: string; number: number; equipment: { id: string; name: string; station: { name: string } } }; }

const STATUS_OPTIONS = ['ONLINE', 'OFFLINE', 'MAINTENANCE'];
const TYPE_OPTIONS_CONN = Object.entries(CONNECTION_TYPE_STYLES).map(([v, s]) => ({ value: v, label: s.label }));

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', background: 'var(--bg-base)',
  color: 'var(--text-primary)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', fontSize: 13, fontFamily: 'var(--font-ui)',
};
const btnPrimary: React.CSSProperties = {
  padding: '8px 16px', background: 'var(--accent)', border: 'none',
  borderRadius: 'var(--radius)', color: '#fff', fontWeight: 600,
  fontSize: 13, cursor: 'pointer',
};
const btnDanger: React.CSSProperties = { ...btnPrimary, background: 'var(--red)', padding: '5px 10px', fontSize: 12 };
const btnGhost: React.CSSProperties = { ...btnPrimary, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' };

// ─── Componente principal ─────────────────────────────────────────────────────
export function StationsPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Station[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [allEquipments, setAllEquipments] = useState<Equipment[]>([]);
  const [types, setTypes] = useState<{ id: string; name: string }[]>([]);

  // Modais
  const [showStationModal, setShowStationModal] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [showEquipModal, setShowEquipModal] = useState(false);
  const [showConnModal, setShowConnModal] = useState(false);

  useEffect(() => { equipmentTypesApi.list().then(setTypes); }, []);

  async function search() {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setSelectedStation(null);
    const data = await stationsApi.list().catch(() => []);
    const filtered = data.filter((s: Station) => s.name.toLowerCase().includes(query.toLowerCase()));
    setResults(filtered);
    setLoading(false);
  }

  async function selectStation(station: Station) {
    setSelectedStation(station);
    const [eqs, conns, allEqs] = await Promise.all([
      equipmentsApi.list({ stationId: station.id }),
      connectionsApi.list(),
      equipmentsApi.list({}),
    ]);
    const eqIds = new Set(eqs.map((e: Equipment) => e.id));
    const stationConns = conns.filter((c: Connection) =>
      eqIds.has(c.sourcePort.equipment.id) || eqIds.has(c.targetPort.equipment.id)
    );
    setEquipments(eqs);
    setConnections(stationConns);
    setAllEquipments(allEqs);
  }

  async function deleteStation(station: Station) {
    if (!confirm(`Excluir a estação "${station.name}"?`)) return;
    try {
      await stationsApi.remove(station.id);
      setResults((r) => r.filter((s) => s.id !== station.id));
      if (selectedStation?.id === station.id) setSelectedStation(null);
    } catch (e: any) {
      alert(e?.response?.data?.message?.message ?? 'Erro ao excluir');
    }
  }

  async function deleteEquipment(eq: Equipment) {
    if (!confirm(`Excluir "${eq.name}"? Isso remove suas portas e conexões.`)) return;
    try {
      await equipmentsApi.remove(eq.id);
      if (selectedStation) selectStation(selectedStation);
    } catch (e: any) { alert(e?.response?.data?.message?.message ?? 'Erro'); }
  }

  async function deleteConnection(conn: Connection) {
    if (!confirm(`Excluir conexão "${conn.name}"?`)) return;
    try {
      await connectionsApi.remove(conn.id);
      if (selectedStation) selectStation(selectedStation);
    } catch (e: any) { alert(e?.response?.data?.message?.message ?? 'Erro'); }
  }

  return (
    <div style={{ padding: 28, height: '100%', overflowY: 'auto' }}>

      {/* Título + botão nova estação */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4 }}>GERENCIAMENTO</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Estações</h1>
        </div>
        <button style={btnPrimary} onClick={() => { setEditingStation(null); setShowStationModal(true); }}>
          + Nova Estação
        </button>
      </div>

      {/* Barra de busca */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Buscar estação pelo nome..."
          style={{ ...inputStyle, flex: 1 }}
          autoFocus
        />
        <button style={btnPrimary} onClick={search} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {/* Resultados da busca */}
      {searched && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Nenhuma estação encontrada para "<strong>{query}</strong>"</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Verifique o nome ou crie uma nova estação.</div>
        </div>
      )}

      {results.length > 0 && !selectedStation && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {results.map((station) => (
            <div key={station.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => selectStation(station)}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{station.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{station.city} — {station.state}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <StatusBadge status={station.status} />
                <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>Ver detalhes →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detalhe da estação selecionada */}
      {selectedStation && (
        <StationDetail
          station={selectedStation}
          equipments={equipments}
          connections={connections}
          allEquipments={allEquipments}
          types={types}
          onBack={() => setSelectedStation(null)}
          onEdit={() => { setEditingStation(selectedStation); setShowStationModal(true); }}
          onDelete={() => deleteStation(selectedStation)}
          onDeleteEquipment={deleteEquipment}
          onDeleteConnection={deleteConnection}
          onRefresh={() => selectStation(selectedStation)}
          showEquipModal={showEquipModal}
          setShowEquipModal={setShowEquipModal}
          showConnModal={showConnModal}
          setShowConnModal={setShowConnModal}
        />
      )}

      {/* Modal de criar/editar estação */}
      {showStationModal && (
        <StationModal
          station={editingStation}
          onClose={() => setShowStationModal(false)}
          onSaved={(saved: any) => {
            setShowStationModal(false);
            if (editingStation) {
              setSelectedStation(saved);
              setResults((r) => r.map((s) => s.id === saved.id ? saved : s));
            } else {
              setQuery(saved.name);
              setResults([saved]);
              setSearched(true);
              selectStation(saved);
            }
          }}
        />
      )}
    </div>
  );
}

// ─── Detalhe da estação ───────────────────────────────────────────────────────
function StationDetail({ station, equipments, connections, allEquipments, types, onBack, onEdit, onDelete, onDeleteEquipment, onDeleteConnection, onRefresh, showEquipModal, setShowEquipModal, showConnModal, setShowConnModal }: any) {
  return (
    <div>
      {/* Breadcrumb */}
      <button onClick={onBack} style={{ ...btnGhost, marginBottom: 20, fontSize: 12 }}>
        ← Voltar para resultados
      </button>

      {/* Cabeçalho da estação */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{station.name}</h2>
              <StatusBadge status={station.status} />
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {station.city} · {station.state}
              {station.latitude && ` · ${station.latitude.toFixed(4)}, ${station.longitude?.toFixed(4)}`}
            </div>
            {station.notes && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{station.notes}</div>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={btnGhost} onClick={onEdit}>Editar</button>
            <button style={btnDanger} onClick={onDelete}>Excluir</button>
          </div>
        </div>
      </div>

      {/* Equipamentos */}
      <SectionHeader label="Equipamentos" count={equipments.length} onAdd={() => setShowEquipModal(true)} />
      {equipments.length === 0 ? (
        <EmptyState label="Nenhum equipamento cadastrado" action="+ Adicionar equipamento" onAction={() => setShowEquipModal(true)} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {equipments.map((eq: Equipment) => (
            <div key={eq.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{eq.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {eq.type?.name}{eq.ip ? ` · ${eq.ip}` : ''} · {eq.ports?.length ?? 0} porta(s)
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <StatusBadge status={eq.status} />
                <button style={btnDanger} onClick={() => onDeleteEquipment(eq)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conexões */}
      <SectionHeader label="Conexões" count={connections.length} onAdd={() => setShowConnModal(true)} />
      {connections.length === 0 ? (
        <EmptyState label="Nenhuma conexão cadastrada" action="+ Adicionar conexão" onAction={() => setShowConnModal(true)} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {connections.map((conn: Connection) => {
            const typeStyle = CONNECTION_TYPE_STYLES[conn.type];
            return (
              <div key={conn.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: typeStyle?.color ?? '#94a3b8', display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{conn.name}</span>
                    {conn.isBackup && <span style={{ fontSize: 10, background: 'var(--accent-dim)', color: 'var(--accent)', padding: '1px 6px', borderRadius: 4 }}>BACKUP</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {conn.sourcePort.equipment.name} ({conn.sourcePort.equipment.station.name}) ⟷ {conn.targetPort.equipment.name} ({conn.targetPort.equipment.station.name})
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{typeStyle?.label ?? conn.type}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <StatusBadge status={conn.status} />
                  <button style={btnDanger} onClick={() => onDeleteConnection(conn)}>Excluir</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modais inline */}
      {showEquipModal && (
        <EquipmentModal
          stationId={station.id}
          types={types}
          onClose={() => setShowEquipModal(false)}
          onSaved={() => { setShowEquipModal(false); onRefresh(); }}
        />
      )}
      {showConnModal && (
        <ConnectionModal
          stationEquipments={equipments}
          allEquipments={allEquipments}
          onClose={() => setShowConnModal(false)}
          onSaved={() => { setShowConnModal(false); onRefresh(); }}
        />
      )}
    </div>
  );
}

// ─── Modal de Estação ─────────────────────────────────────────────────────────
function StationModal({ station, onClose, onSaved }: any) {
  const [form, setForm] = useState({ name: station?.name ?? '', city: station?.city ?? '', state: station?.state ?? '', status: station?.status ?? 'ONLINE', notes: station?.notes ?? '', latitude: station?.latitude != null ? String(station.latitude) : '', longitude: station?.longitude != null ? String(station.longitude) : '' });
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, latitude: form.latitude ? Number(form.latitude) : undefined, longitude: form.longitude ? Number(form.longitude) : undefined };
      const saved = station ? await stationsApi.update(station.id, payload) : await stationsApi.create(payload);
      onSaved(saved);
    } catch (err: any) { setError(err?.response?.data?.message?.message ?? 'Erro ao salvar'); }
  }

  return (
    <Modal title={station ? 'Editar Estação' : 'Nova Estação'} onClose={onClose} onSubmit={submit}>
      <Field label="Nome"><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
      <Field label="Cidade"><input style={inputStyle} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required /></Field>
      <Field label="Estado (UF)"><input style={inputStyle} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required maxLength={2} /></Field>
      <Field label="Status">
        <select style={inputStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <div style={{ display: 'flex', gap: 10 }}>
        <Field label="Latitude"><input style={inputStyle} value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-15.7942" /></Field>
        <Field label="Longitude"><input style={inputStyle} value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="-47.8822" /></Field>
      </div>
      <Field label="Observações"><textarea style={{ ...inputStyle, minHeight: 56 }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
      {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
    </Modal>
  );
}

// ─── Modal de Equipamento ─────────────────────────────────────────────────────
function EquipmentModal({ stationId, types, onClose, onSaved }: any) {
  const [form, setForm] = useState({ name: '', typeId: types[0]?.id ?? '', ip: '', status: 'ONLINE', portCount: 4 });
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await equipmentsApi.create({ ...form, stationId });
      onSaved();
    } catch (err: any) { setError(err?.response?.data?.message?.message ?? 'Erro ao salvar'); }
  }

  return (
    <Modal title="Novo Equipamento" onClose={onClose} onSubmit={submit}>
      <Field label="Nome"><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Switch-BSB-01" /></Field>
      <Field label="Tipo">
        <select style={inputStyle} value={form.typeId} onChange={(e) => setForm({ ...form, typeId: e.target.value })}>
          {types.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </Field>
      <Field label="IP (opcional)"><input style={inputStyle} value={form.ip} onChange={(e) => setForm({ ...form, ip: e.target.value })} placeholder="192.168.0.1" /></Field>
      <Field label="Status">
        <select style={inputStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Quantidade de portas">
        <input type="number" min={0} style={inputStyle} value={form.portCount} onChange={(e) => setForm({ ...form, portCount: Number(e.target.value) })} />
      </Field>
      {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
    </Modal>
  );
}

// ─── Modal de Conexão ─────────────────────────────────────────────────────────
function ConnectionModal({ stationEquipments, allEquipments, onClose, onSaved }: any) {
  const [form, setForm] = useState({ name: '', sourceEquipmentId: '', sourcePortId: '', targetEquipmentId: '', targetPortId: '', type: 'ELETRONORTE_FIBER', isBackup: false });
  const [sourcePorts, setSourcePorts] = useState<Port[]>([]);
  const [targetPorts, setTargetPorts] = useState<Port[]>([]);
  const [error, setError] = useState('');

  useEffect(() => { if (form.sourceEquipmentId) portsApi.listByEquipment(form.sourceEquipmentId).then(setSourcePorts); else setSourcePorts([]); }, [form.sourceEquipmentId]);
  useEffect(() => { if (form.targetEquipmentId) portsApi.listByEquipment(form.targetEquipmentId).then(setTargetPorts); else setTargetPorts([]); }, [form.targetEquipmentId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await connectionsApi.create({ name: form.name, sourcePortId: form.sourcePortId, targetPortId: form.targetPortId, type: form.type, isBackup: form.isBackup });
      onSaved();
    } catch (err: any) { setError(err?.response?.data?.message?.message ?? 'Erro ao salvar'); }
  }

  return (
    <Modal title="Nova Conexão" onClose={onClose} onSubmit={submit}>
      <Field label="Nome (ex: FO-001)"><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
      <Field label="Tipo de conexão">
        <select style={inputStyle} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {TYPE_OPTIONS_CONN.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </Field>
      <Field label="Equipamento de origem (desta estação)">
        <select style={inputStyle} value={form.sourceEquipmentId} onChange={(e) => setForm({ ...form, sourceEquipmentId: e.target.value, sourcePortId: '' })} required>
          <option value="">Selecione...</option>
          {stationEquipments.map((eq: Equipment) => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
        </select>
      </Field>
      <Field label="Porta de origem">
        <select style={inputStyle} value={form.sourcePortId} onChange={(e) => setForm({ ...form, sourcePortId: e.target.value })} required disabled={!form.sourceEquipmentId}>
          <option value="">Selecione...</option>
          {sourcePorts.map((p: Port) => <option key={p.id} value={p.id}>Porta {p.number} {p.name ? `· ${p.name}` : ''}</option>)}
        </select>
      </Field>
      <Field label="Equipamento de destino (outra estação)">
        <select style={inputStyle} value={form.targetEquipmentId} onChange={(e) => setForm({ ...form, targetEquipmentId: e.target.value, targetPortId: '' })} required>
          <option value="">Selecione...</option>
          {allEquipments.filter((eq: Equipment) => !stationEquipments.some((se: Equipment) => se.id === eq.id)).map((eq: any) => <option key={eq.id} value={eq.id}>{eq.name} ({eq.station?.name ?? ''})</option>)}
        </select>
      </Field>
      <Field label="Porta de destino">
        <select style={inputStyle} value={form.targetPortId} onChange={(e) => setForm({ ...form, targetPortId: e.target.value })} required disabled={!form.targetEquipmentId}>
          <option value="">Selecione...</option>
          {targetPorts.map((p: Port) => <option key={p.id} value={p.id}>Porta {p.number} {p.name ? `· ${p.name}` : ''}</option>)}
        </select>
      </Field>
      <Field label="">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.isBackup} onChange={(e) => setForm({ ...form, isBackup: e.target.checked })} />
          Link de backup
        </label>
      </Field>
      {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
    </Modal>
  );
}

// ─── Helpers de UI ────────────────────────────────────────────────────────────
function Modal({ title, onClose, onSubmit, children }: any) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, width: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 16 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <button type="button" onClick={onClose} style={btnGhost}>Cancelar</button>
            <button type="submit" style={btnPrimary}>Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 5, letterSpacing: '0.05em' }}>{label.toUpperCase()}</label>}
      {children}
    </div>
  );
}

function SectionHeader({ label, count, onAdd }: { label: string; count: number; onAdd: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
        {label.toUpperCase()} <span style={{ color: 'var(--text-secondary)' }}>({count})</span>
      </div>
      <button onClick={onAdd} style={{ ...btnPrimary, padding: '5px 12px', fontSize: 12 }}>+ Adicionar</button>
    </div>
  );
}

function EmptyState({ label, action, onAction }: { label: string; action: string; onAction: () => void }) {
  return (
    <div style={{ border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', textAlign: 'center', marginBottom: 24 }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 10 }}>{label}</div>
      <button onClick={onAction} style={btnGhost}>{action}</button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { ONLINE: 'var(--green)', OFFLINE: 'var(--red)', MAINTENANCE: 'var(--accent)', ALERT: 'var(--yellow)', DISABLED: 'var(--gray)' };
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: colors[status] ?? 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors[status] ?? 'var(--text-muted)', display: 'inline-block' }} />
      {status}
    </span>
  );
}
