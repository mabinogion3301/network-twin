import { useCallback, useEffect, useState } from 'react';
import { failuresApi } from '../services/api/failures.api';
import { Failure, FailureImpactState, useWebSocket } from '../hooks/useWebSocket';

// ─── Constantes de UI ────────────────────────────────────────────────────────

const FAILURE_LABELS: Record<string, string> = {
  MANAGEMENT_FAILURE:    'Falha de Gerência',
  OVERHEATING:           'Superaquecimento',
  POWER_FAILURE:         'Falta de Energia',
  EQUIPMENT_UNAVAILABLE: 'Equipamento Indisponível',
  NODE_RUPTURE:          'Rompimento de Nó',
  NODE_ATTENUATION:      'Atenuação de Nó',
};

const FAILURE_ICONS: Record<string, string> = {
  MANAGEMENT_FAILURE:    '🚫',
  OVERHEATING:           '🔥',
  POWER_FAILURE:         '⚡',
  EQUIPMENT_UNAVAILABLE: '🔧',
  NODE_RUPTURE:          '💥',
  NODE_ATTENUATION:      '📉',
};

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH:     '#f97316',
  MEDIUM:   '#f59e0b',
  LOW:      '#3b82f6',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE:       'ATIVA',
  ACKNOWLEDGED: 'RECONHECIDA',
  RESTORED:     'RESTABELECIDA',
};

const TARGET_LABELS: Record<string, string> = {
  STATION:    'Estação',
  CONNECTION: 'Conexão',
};

function dur(from: string): string {
  const secs = Math.floor((Date.now() - new Date(from).getTime()) / 1000);
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}min`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  return `${Math.floor(secs / 86400)}d`;
}

const card: React.CSSProperties = {
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)', padding: '14px 18px', marginBottom: 8,
};

const btnStyle = (color: string, small = false): React.CSSProperties => ({
  padding: small ? '4px 10px' : '7px 14px', background: color, border: 'none',
  borderRadius: 'var(--radius)', color: 'white', fontWeight: 600,
  fontSize: small ? 11 : 12, cursor: 'pointer',
});

// ─── Componente principal ─────────────────────────────────────────────────────

export function FailuresPage() {
  const [failures, setFailures] = useState<Failure[]>([]);
  const [history, setHistory] = useState<Failure[]>([]);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [selected, setSelected] = useState<Failure | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [noteEdit, setNoteEdit] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  function loadActive() { failuresApi.list().then(setFailures); }
  function loadHistory() { failuresApi.history().then(setHistory); }

  useEffect(() => { loadActive(); loadHistory(); }, []);

  // Tempo real: recebe atualização de falhas via WebSocket
  const handleFailureUpdate = useCallback((state: FailureImpactState) => {
    setFailures(state.failures);
    // Atualiza o selecionado se ainda existir
    setSelected(prev => prev ? state.failures.find(f => f.id === prev.id) ?? prev : null);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  useWebSocket(() => {}, undefined, handleFailureUpdate);

  async function acknowledge(f: Failure) {
    await failuresApi.acknowledge(f.id);
    loadActive();
  }

  async function restore(f: Failure) {
    await failuresApi.restore(f.id);
    loadActive(); loadHistory();
    setSelected(null);
  }

  async function saveNote() {
    if (!selected) return;
    setNoteSaving(true);
    await failuresApi.updateNote(selected.id, noteEdit);
    setNoteSaving(false);
  }

  function selectFailure(f: Failure) {
    setSelected(f);
    setNoteEdit(f.note ?? '');
  }

  const active = failures.filter(f => f.status !== 'RESTORED');
  const shown  = tab === 'active' ? active : history;

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* Lista lateral */}
      <div style={{ width: 360, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>OPERACIONAL</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Falhas</h2>
          </div>
          <button onClick={() => setShowCreate(true)} style={btnStyle('#ef4444')}>+ Registrar</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {(['active', 'history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px', background: 'transparent', border: 'none',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: tab === t ? 600 : 400, fontSize: 13, cursor: 'pointer',
            }}>
              {t === 'active' ? `Ativas (${active.length})` : 'Histórico'}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          {shown.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              {tab === 'active' ? '✓ Nenhuma falha ativa' : 'Nenhum histórico'}
            </div>
          )}
          {shown.map(f => (
            <div key={f.id} onClick={() => selectFailure(f)} style={{
              ...card,
              cursor: 'pointer',
              borderLeft: `3px solid ${SEVERITY_COLORS[f.severity] ?? '#94a3b8'}`,
              background: selected?.id === f.id ? 'var(--bg-hover)' : 'var(--bg-card)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{FAILURE_ICONS[f.type] ?? '⚠️'}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{FAILURE_LABELS[f.type] ?? f.type}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{TARGET_LABELS[f.targetType]} · {f.targetName}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusBadge status={f.status} />
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
                    {f.status === 'RESTORED' ? dur(f.restoredAt!) + ' atrás' : dur(f.createdAt)}
                  </div>
                </div>
              </div>
              {f.note && <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{f.note}"</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Detalhe */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {!selected ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 40 }}>⚠️</span>
            <span>Selecione uma falha para ver os detalhes</span>
          </div>
        ) : (
          <FailureDetail
            failure={selected}
            noteEdit={noteEdit}
            setNoteEdit={setNoteEdit}
            noteSaving={noteSaving}
            onSaveNote={saveNote}
            onAcknowledge={() => acknowledge(selected)}
            onRestore={() => restore(selected)}
          />
        )}
      </div>

      {/* Modal de criar falha */}
      {showCreate && (
        <CreateFailureModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { loadActive(); setShowCreate(false); }}
        />
      )}
    </div>
  );
}

// ─── Detalhe da falha ────────────────────────────────────────────────────────

function FailureDetail({ failure: f, noteEdit, setNoteEdit, noteSaving, onSaveNote, onAcknowledge, onRestore }: {
  failure: Failure;
  noteEdit: string;
  setNoteEdit: (v: string) => void;
  noteSaving: boolean;
  onSaveNote: () => void;
  onAcknowledge: () => void;
  onRestore: () => void;
}) {
  const isActive = f.status !== 'RESTORED';
  return (
    <div style={{ maxWidth: 640 }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
        <span style={{ fontSize: 40 }}>{FAILURE_ICONS[f.type] ?? '⚠️'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{FAILURE_LABELS[f.type] ?? f.type}</h2>
            <StatusBadge status={f.status} />
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {TARGET_LABELS[f.targetType]} · <strong>{f.targetName}</strong>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Severidade: <span style={{ color: SEVERITY_COLORS[f.severity], fontWeight: 600 }}>{f.severity}</span>
          </div>
        </div>
      </div>

      {/* Linha do tempo */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 10, letterSpacing: '0.08em' }}>LINHA DO TEMPO</div>
        <TimelineItem icon="🔴" label="Abertura" time={f.createdAt} by={f.createdBy} />
        {f.acknowledgedAt && <TimelineItem icon="👁️" label="Reconhecida" time={f.acknowledgedAt} by={f.acknowledgedBy} />}
        {f.restoredAt && <TimelineItem icon="✅" label="Restabelecida" time={f.restoredAt} by={f.restoredBy} />}
      </div>

      {/* Nota operacional */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 10, letterSpacing: '0.08em' }}>NOTA OPERACIONAL</div>
        {isActive ? (
          <>
            <textarea
              value={noteEdit}
              onChange={e => setNoteEdit(e.target.value)}
              placeholder="Registre informações operacionais — equipe acionada, status do campo, previsão..."
              rows={4}
              style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontSize: 13, padding: '8px 10px', resize: 'vertical', fontFamily: 'var(--font-ui)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={onSaveNote} disabled={noteSaving} style={btnStyle('#3b82f6', true)}>
                {noteSaving ? 'Salvando...' : '💾 Salvar nota'}
              </button>
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0, fontStyle: f.note ? 'normal' : 'italic' }}>
            {f.note || 'Nenhuma nota registrada.'}
          </p>
        )}
      </div>

      {/* Ações */}
      {isActive && (
        <div style={{ display: 'flex', gap: 10 }}>
          {f.status === 'ACTIVE' && (
            <button onClick={onAcknowledge} style={btnStyle('#f59e0b')}>
              👁️ Reconhecer Falha
            </button>
          )}
          <button onClick={onRestore} style={btnStyle('#10b981')}>
            ✓ Restabelecer Falha
          </button>
        </div>
      )}
    </div>
  );
}

function TimelineItem({ icon, label, time, by }: { icon: string; label: string; time?: string | null; by?: string | null }) {
  if (!time) return null;
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {new Date(time).toLocaleString('pt-BR')}
          {by && ` · ${by}`}
        </div>
      </div>
    </div>
  );
}

// ─── Modal de criar falha ────────────────────────────────────────────────────

function CreateFailureModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    type: 'NODE_RUPTURE',
    targetType: 'CONNECTION',
    targetId: '',
    targetName: '',
    severity: 'HIGH',
    note: '',
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await failuresApi.create(form); onCreated(); }
    catch { /* silencioso */ }
    finally { setSaving(false); }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '8px 10px', background: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 13 };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, width: 460, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: 16 }}>Registrar Falha</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>TIPO DA FALHA</label>
            <select style={inp} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              {Object.entries(FAILURE_LABELS).map(([v, l]) => <option key={v} value={v}>{FAILURE_ICONS[v]} {l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>CATEGORIA</label>
            <select style={inp} value={form.targetType} onChange={e => setForm({...form, targetType: e.target.value})}>
              <option value="STATION">Estação</option>
              <option value="CONNECTION">Conexão / Nó</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>NOME DO ELEMENTO AFETADO</label>
            <input required style={inp} value={form.targetName} onChange={e => setForm({...form, targetName: e.target.value})} placeholder="Ex: FO-Cuiabá-Jaciara, Estação Juscimeira" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>ID DO ELEMENTO (opcional)</label>
            <input style={inp} value={form.targetId} onChange={e => setForm({...form, targetId: e.target.value})} placeholder="UUID da estação ou conexão no sistema" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>SEVERIDADE</label>
            <select style={inp} value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
              <option value="CRITICAL">🔴 Crítica</option>
              <option value="HIGH">🟠 Alta</option>
              <option value="MEDIUM">🟡 Média</option>
              <option value="LOW">🔵 Baixa</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>NOTA INICIAL (opcional)</label>
            <textarea style={{ ...inp, minHeight: 60 }} value={form.note} onChange={e => setForm({...form, note: e.target.value})} placeholder="Equipe acionada, detalhes iniciais..." />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={saving} style={btnStyle('#ef4444')}>{saving ? 'Registrando...' : '⚡ Registrar Falha'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Badge de status ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { ACTIVE: '#ef4444', ACKNOWLEDGED: '#f59e0b', RESTORED: '#10b981' };
  return (
    <span style={{ background: `${colors[status] ?? '#94a3b8'}20`, border: `1px solid ${colors[status] ?? '#94a3b8'}40`, borderRadius: 4, padding: '2px 7px', fontSize: 10, color: colors[status] ?? '#94a3b8', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
