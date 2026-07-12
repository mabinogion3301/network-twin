import React, { useEffect, useState } from 'react';
import { stationsApi } from '../services/api/stations.api';
import { equipmentsApi, equipmentTypesApi } from '../services/api/equipments.api';
import { connectionsApi, portsApi } from '../services/api/connections.api';
import { CONNECTION_TYPE_STYLES } from './GeoMapPage';

interface Station { id: string; name: string; city: string; state: string; status: string; latitude?: number | null; longitude?: number | null; notes?: string; trechos?: string[]; }
interface Equipment { id: string; name: string; ip?: string; status: string; typeId: string; type: { name: string }; ports: Port[]; }
interface Port { id: string; number: number; name?: string; type: string; }
interface Connection { id: string; name: string; type: string; status: string; isBackup: boolean; sourcePort: { id: string; number: number; equipment: { id: string; name: string; station: { name: string } } }; targetPort: { id: string; number: number; equipment: { id: string; name: string; station: { name: string } } }; }

const STATUS_COLORS: Record<string, string> = { ONLINE: 'var(--green)', OFFLINE: 'var(--red)', MAINTENANCE: 'var(--accent)', ALERT: 'var(--yellow)', DISABLED: 'var(--gray)' };
const STATUS_OPTIONS = ['ONLINE', 'OFFLINE', 'MAINTENANCE'];
const CONN_TYPES = Object.entries(CONNECTION_TYPE_STYLES).map(([v, s]) => ({ value: v, label: s.label }));

const inp: React.CSSProperties = { width: '100%', padding: '8px 10px', background: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 13 };
const btnPrimary = (small = false): React.CSSProperties => ({ padding: small ? '5px 10px' : '8px 16px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontWeight: 600, fontSize: small ? 12 : 13, cursor: 'pointer' });
const btnGhost = (small = false): React.CSSProperties => ({ ...btnPrimary(small), background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' });
const btnDanger = (small = false): React.CSSProperties => ({ ...btnPrimary(small), background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)' });

export function StationsPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Station[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [station, setStation] = useState<Station | null>(null);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [allEquipments, setAllEquipments] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [modal, setModal] = useState<'station' | 'equip' | 'conn' | null>(null);
  const [editStation, setEditStation] = useState<Station | null>(null);

  useEffect(() => { equipmentTypesApi.list().then(setTypes); }, []);

  async function search() {
    if (!query.trim()) return;
    setLoading(true); setSearched(true); setStation(null);
    const data = await stationsApi.list().catch(() => []);
    setResults(data.filter((s: Station) => s.name.toLowerCase().includes(query.toLowerCase())));
    setLoading(false);
  }

  async function select(s: Station) {
    setStation(s);
    const [eqs, conns, all] = await Promise.all([
      equipmentsApi.list({ stationId: s.id }),
      connectionsApi.list(),
      equipmentsApi.list({}),
    ]);
    const ids = new Set(eqs.map((e: Equipment) => e.id));
    setEquipments(eqs);
    setConnections(conns.filter((c: Connection) => ids.has(c.sourcePort.equipment.id) || ids.has(c.targetPort.equipment.id)));
    setAllEquipments(all);
  }

  async function delStation() {
    if (!station || !confirm(`Excluir "${station.name}"?`)) return;
    try { await stationsApi.remove(station.id); setStation(null); setResults(r => r.filter(s => s.id !== station.id)); }
    catch (e: any) { alert(e?.response?.data?.message?.message ?? 'Erro ao excluir'); }
  }

  async function delEquip(eq: Equipment) {
    if (!confirm(`Excluir "${eq.name}"?`)) return;
    try { await equipmentsApi.remove(eq.id); station && select(station); }
    catch (e: any) { alert(e?.response?.data?.message?.message ?? 'Erro ao excluir'); }
  }

  async function delConn(conn: Connection) {
    if (!confirm(`Excluir "${conn.name}"?`)) return;
    try { await connectionsApi.remove(conn.id); station && select(station); }
    catch (e: any) { alert(e?.response?.data?.message?.message ?? 'Erro ao excluir'); }
  }

  return (
    <div style={{ padding: 28, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Estações</h1>
        <button style={btnPrimary()} onClick={() => { setEditStation(null); setModal('station'); }}>+ Nova</button>
      </div>

      {/* Busca */}
      {!station && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Nome da estação..." style={{ ...inp, flex: 1 }} autoFocus />
          <button style={btnPrimary()} onClick={search} disabled={loading}>{loading ? '...' : 'Buscar'}</button>
        </div>
      )}

      {/* Sem resultado */}
      {searched && !station && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
          <div style={{ color: 'var(--text-secondary)' }}>Nenhuma estação encontrada para "<strong>{query}</strong>"</div>
        </div>
      )}

      {/* Lista de resultados */}
      {!station && results.map(s => (
        <div key={s.id} onClick={() => select(s)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>{s.city} · {s.state}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Dot status={s.status} />
            <span style={{ fontSize: 12, color: 'var(--accent)' }}>→</span>
          </div>
        </div>
      ))}

      {/* Detalhe da estação */}
      {station && (
        <>
          {/* Voltar */}
          <button onClick={() => setStation(null)} style={{ ...btnGhost(true), marginBottom: 20 }}>← Voltar</button>

          {/* Card da estação */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Dot status={station.status} />
                  <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>{station.name}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {station.city} · {station.state}
                  {station.latitude ? ` · ${station.latitude.toFixed(3)}, ${station.longitude?.toFixed(3)}` : ''}
                </span>
                {station.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{station.notes}</div>}
                {station.trechos && station.trechos.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                    {station.trechos.map((t, i) => (
                      <span key={i} style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 4, padding: '2px 7px', fontSize: 10, color: '#a78bfa', fontFamily: 'var(--font-mono)' }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={btnGhost(true)} onClick={() => { setEditStation(station); setModal('station'); }}>Editar</button>
                <button style={btnDanger(true)} onClick={delStation}>Excluir</button>
              </div>
            </div>
          </div>

          {/* Equipamentos */}
          <Row label={`Equipamentos (${equipments.length})`} onAdd={() => setModal('equip')} />
          {equipments.length === 0
            ? <Empty label="Nenhum equipamento" onAdd={() => setModal('equip')} />
            : equipments.map(eq => (
              <Item key={eq.id}
                title={eq.name}
                sub={`${eq.type?.name}${eq.ip ? ' · ' + eq.ip : ''} · ${eq.ports?.length ?? 0} porta(s)`}
                status={eq.status}
                onDelete={() => delEquip(eq)}
              />
            ))
          }

          {/* Conexões */}
          <Row label={`Conexões (${connections.length})`} onAdd={() => setModal('conn')} />
          {connections.length === 0
            ? <Empty label="Nenhuma conexão" onAdd={() => setModal('conn')} />
            : connections.map(conn => {
              const ts = CONNECTION_TYPE_STYLES[conn.type];
              return (
                <Item key={conn.id}
                  title={conn.name}
                  sub={`${conn.sourcePort.equipment.name} ⟷ ${conn.targetPort.equipment.name}`}
                  status={conn.status}
                  accent={ts?.color}
                  badge={conn.isBackup ? 'BACKUP' : undefined}
                  onDelete={() => delConn(conn)}
                />
              );
            })
          }
        </>
      )}

      {/* Modais */}
      {modal === 'station' && (
        <StationModal station={editStation} onClose={() => setModal(null)} onSaved={async (saved: any) => {
          setModal(null);
          if (editStation) { setStation(saved); setResults(r => r.map(s => s.id === saved.id ? saved : s)); }
          else { setResults([saved]); setSearched(true); setQuery(saved.name); await select(saved); }
        }} />
      )}
      {modal === 'equip' && station && (
        <EquipModal stationId={station.id} types={types} onClose={() => setModal(null)} onSaved={() => { setModal(null); select(station); }} />
      )}
      {modal === 'conn' && station && (
        <ConnModal stationEqs={equipments} allEqs={allEquipments} onClose={() => setModal(null)} onSaved={() => { setModal(null); select(station); }} />
      )}
    </div>
  );
}

// ─── Componentes de UI mínimos ────────────────────────────────────────────────

function Dot({ status }: { status: string }) {
  return <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLORS[status] ?? 'var(--text-muted)', display: 'inline-block', flexShrink: 0 }} />;
}

function Row({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 20 }}>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{label.toUpperCase()}</span>
      <button onClick={onAdd} style={btnPrimary(true)}>+ Adicionar</button>
    </div>
  );
}

function Empty({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div style={{ border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, textAlign: 'center', marginBottom: 8 }}>
      <span style={{ color: 'var(--text-muted)', fontSize: 13, marginRight: 12 }}>{label}</span>
      <button onClick={onAdd} style={btnGhost(true)}>+ Adicionar</button>
    </div>
  );
}

function Item({ title, sub, status, accent, badge, onDelete }: { title: string; sub: string; status: string; accent?: string; badge?: string; onDelete: () => void }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '10px 14px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
      {accent
        ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0 }} />
        : <Dot status={status} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{title}</span>
          {badge && <span style={{ fontSize: 10, background: 'var(--accent-dim)', color: 'var(--accent)', padding: '1px 5px', borderRadius: 3 }}>{badge}</span>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
      <button onClick={onDelete} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px' }} title="Excluir">×</button>
    </div>
  );
}

// ─── Modais ───────────────────────────────────────────────────────────────────

function Modal({ title, onClose, onSubmit, children }: any) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, width: 440, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 15 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {children}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={btnGhost()}>Cancelar</button>
            <button type="submit" style={btnPrimary()}>Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, letterSpacing: '0.04em' }}>{label}</div>
      {children}
    </div>
  );
}

function StationModal({ station, onClose, onSaved }: any) {
  const [f, setF] = useState({ name: station?.name ?? '', city: station?.city ?? '', state: station?.state ?? '', status: station?.status ?? 'ONLINE', notes: station?.notes ?? '', latitude: station?.latitude != null ? String(station.latitude) : '', longitude: station?.longitude != null ? String(station.longitude) : '', trechosInput: (station?.trechos ?? []).join(', ') });
  const [err, setErr] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    try {
      const trechos = f.trechosInput.split(',').map(t => t.trim()).filter(Boolean);
      const payload = { ...f, trechos, latitude: f.latitude ? Number(f.latitude) : undefined, longitude: f.longitude ? Number(f.longitude) : undefined };
      const saved = station ? await stationsApi.update(station.id, payload) : await stationsApi.create(payload);
      onSaved(saved);
    } catch (e: any) { setErr(e?.response?.data?.message?.message ?? 'Erro ao salvar'); }
  }
  return (
    <Modal title={station ? 'Editar Estação' : 'Nova Estação'} onClose={onClose} onSubmit={submit}>
      <F label="Nome"><input style={inp} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required /></F>
      <div style={{ display: 'flex', gap: 10 }}>
        <F label="Cidade"><input style={inp} value={f.city} onChange={e => setF({ ...f, city: e.target.value })} required /></F>
        <F label="UF"><input style={inp} value={f.state} onChange={e => setF({ ...f, state: e.target.value })} required maxLength={2} /></F>
      </div>
      <F label="Status">
        <select style={inp} value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </F>
      <div style={{ display: 'flex', gap: 10 }}>
        <F label="Latitude"><input style={inp} value={f.latitude} onChange={e => setF({ ...f, latitude: e.target.value })} placeholder="-15.7942" /></F>
        <F label="Longitude"><input style={inp} value={f.longitude} onChange={e => setF({ ...f, longitude: e.target.value })} placeholder="-47.8822" /></F>
      </div>
      <F label="Observações"><textarea style={{ ...inp, minHeight: 50 }} value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} /></F>
      <F label="Trechos (separados por vírgula)">
        <input style={inp} value={f.trechosInput} onChange={e => setF({ ...f, trechosInput: e.target.value })} placeholder="Campo Grande, MT Sul, Cuiabá Norte" />
        {f.trechosInput && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
            {f.trechosInput.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
              <span key={i} style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 4, padding: '2px 8px', fontSize: 11, color: '#a78bfa' }}>{t}</span>
            ))}
          </div>
        )}
      </F>
      {err && <p style={{ color: 'var(--red)', fontSize: 12, margin: 0 }}>{err}</p>}
    </Modal>
  );
}

function EquipModal({ stationId, types, onClose, onSaved }: any) {
  const [f, setF] = useState({ name: '', typeId: types[0]?.id ?? '', ip: '', status: 'ONLINE', portCount: 4 });
  const [err, setErr] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    try { await equipmentsApi.create({ ...f, stationId }); onSaved(); }
    catch (e: any) { setErr(e?.response?.data?.message?.message ?? 'Erro ao salvar'); }
  }
  return (
    <Modal title="Novo Equipamento" onClose={onClose} onSubmit={submit}>
      <F label="Nome"><input style={inp} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required placeholder="SW-BSB-01" /></F>
      <div style={{ display: 'flex', gap: 10 }}>
        <F label="Tipo">
          <select style={inp} value={f.typeId} onChange={e => setF({ ...f, typeId: e.target.value })}>
            {types.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </F>
        <F label="Status">
          <select style={inp} value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </F>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <F label="IP (opcional)"><input style={inp} value={f.ip} onChange={e => setF({ ...f, ip: e.target.value })} placeholder="192.168.0.1" /></F>
        <F label="Portas"><input type="number" min={0} style={inp} value={f.portCount} onChange={e => setF({ ...f, portCount: Number(e.target.value) })} /></F>
      </div>
      {err && <p style={{ color: 'var(--red)', fontSize: 12, margin: 0 }}>{err}</p>}
    </Modal>
  );
}

function ConnModal({ stationEqs, allEqs, onClose, onSaved }: any) {
  const [f, setF] = useState({ name: '', srcEq: '', srcPort: '', dstEq: '', dstPort: '', type: 'ELETRONORTE_FIBER', isBackup: false });
  const [srcPorts, setSrcPorts] = useState<Port[]>([]);
  const [dstPorts, setDstPorts] = useState<Port[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => { if (f.srcEq) portsApi.listByEquipment(f.srcEq).then(setSrcPorts); else setSrcPorts([]); }, [f.srcEq]);
  useEffect(() => { if (f.dstEq) portsApi.listByEquipment(f.dstEq).then(setDstPorts); else setDstPorts([]); }, [f.dstEq]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    try { await connectionsApi.create({ name: f.name, sourcePortId: f.srcPort, targetPortId: f.dstPort, type: f.type, isBackup: f.isBackup }); onSaved(); }
    catch (e: any) { setErr(e?.response?.data?.message?.message ?? 'Erro ao salvar'); }
  }

  const otherEqs = allEqs.filter((e: any) => !stationEqs.some((s: any) => s.id === e.id));

  return (
    <Modal title="Nova Conexão" onClose={onClose} onSubmit={submit}>
      <div style={{ display: 'flex', gap: 10 }}>
        <F label="Nome"><input style={inp} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required placeholder="FO-001" /></F>
        <F label="Tipo">
          <select style={inp} value={f.type} onChange={e => setF({ ...f, type: e.target.value })}>
            {CONN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </F>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <F label="Equipamento origem (esta estação)">
          <select style={inp} value={f.srcEq} onChange={e => setF({ ...f, srcEq: e.target.value, srcPort: '' })} required>
            <option value="">Selecione...</option>
            {stationEqs.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </F>
        <F label="Porta">
          <select style={inp} value={f.srcPort} onChange={e => setF({ ...f, srcPort: e.target.value })} required disabled={!f.srcEq}>
            <option value="">-</option>
            {srcPorts.map((p: Port) => <option key={p.id} value={p.id}>P{p.number}</option>)}
          </select>
        </F>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <F label="Equipamento destino (outra estação)">
          <select style={inp} value={f.dstEq} onChange={e => setF({ ...f, dstEq: e.target.value, dstPort: '' })} required>
            <option value="">Selecione...</option>
            {otherEqs.map((e: any) => <option key={e.id} value={e.id}>{e.name} ({e.station?.name ?? ''})</option>)}
          </select>
        </F>
        <F label="Porta">
          <select style={inp} value={f.dstPort} onChange={e => setF({ ...f, dstPort: e.target.value })} required disabled={!f.dstEq}>
            <option value="">-</option>
            {dstPorts.map((p: Port) => <option key={p.id} value={p.id}>P{p.number}</option>)}
          </select>
        </F>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
        <input type="checkbox" checked={f.isBackup} onChange={e => setF({ ...f, isBackup: e.target.checked })} />
        Link de backup
      </label>
      {err && <p style={{ color: 'var(--red)', fontSize: 12, margin: 0 }}>{err}</p>}
    </Modal>
  );
}
