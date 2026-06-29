import { useState } from 'react';
import { api } from '../../services/api/client';

interface Props {
  // IDs das conexões já rompidas em simulações anteriores ainda ativas —
  // são reenviadas junto a cada novo "Romper" para a falha ser CUMULATIVA
  // (a simulação anterior não volta ao normal sozinha).
  activeConnectionIds: string[];
}

export function EventsPanel({ activeConnectionIds }: Props) {
  const [connectionInput, setConnectionInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function handleSimulate() {
    if (!connectionInput.trim()) return;
    setLoading(true);
    setFeedback('');
    try {
      const newNames = connectionInput.split(',').map((s) => s.trim()).filter(Boolean);
      await api.post('/simulations', {
        // Soma com o que já estava rompido — falha cumulativa.
        connectionIds: [...new Set([...activeConnectionIds, ...newNames])],
      });
      setConnectionInput('');
      setFeedback('Falha somada às simulações ativas. Veja o resultado no mapa e no Painel de Impactos →');
    } catch (err: any) {
      setFeedback(err?.response?.data?.message?.message ?? 'Erro ao simular falha');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 12, background: '#1e293b', display: 'flex', gap: 8, alignItems: 'center' }}>
      <span style={{ color: '#94a3b8', fontSize: 13 }}>Simular falha (nome da conexão, ex: FO-001):</span>
      <input
        value={connectionInput}
        onChange={(e) => setConnectionInput(e.target.value)}
        placeholder="FO-001, FO-002..."
        style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '6px 10px', color: '#e2e8f0', minWidth: 220 }}
      />
      <button
        onClick={handleSimulate}
        disabled={loading}
        style={{ background: '#ef4444', border: 'none', borderRadius: 6, padding: '6px 14px', color: 'white', fontWeight: 600, cursor: 'pointer' }}
      >
        {loading ? 'Simulando...' : 'Romper'}
      </button>
      {activeConnectionIds.length > 0 && (
        <span style={{ color: '#fbbf24', fontSize: 12 }}>{activeConnectionIds.length} falha(s) ativa(s) agora</span>
      )}
      {feedback && <span style={{ color: '#94a3b8', fontSize: 12 }}>{feedback}</span>}
    </div>
  );
}
