import { useEffect, useState } from 'react';
import { simulationsApi } from '../services/api/dashboard.api';

interface SimulationRecord {
  id: string;
  createdAt: string;
  removedConnectionIds: string[];
  removedEquipmentIds: string[];
  resultJson: {
    unavailableStationPairs?: Array<{ stationAName: string; stationBName: string }>;
    isolatedEquipment?: Array<{ name: string }>;
    impactedConnections?: Array<{ name: string }>;
  };
}

export function SimulationsHistoryPage() {
  const [history, setHistory] = useState<SimulationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    simulationsApi.history().then(setHistory).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#e2e8f0', marginBottom: 20 }}>Histórico de Simulações</h2>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Carregando...</p>
      ) : history.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>Nenhuma simulação executada ainda. Use a barra de simulação no Mapa da Rede.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map((sim) => {
            const pairs = sim.resultJson?.unavailableStationPairs ?? [];
            const isolated = sim.resultJson?.isolatedEquipment ?? [];
            const impacted = sim.resultJson?.impactedConnections ?? [];
            const hadImpact = pairs.length > 0 || isolated.length > 0;

            return (
              <div
                key={sim.id}
                style={{
                  background: '#1e293b',
                  borderRadius: 10,
                  padding: 16,
                  borderLeft: `4px solid ${hadImpact ? '#ef4444' : '#22c55e'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>
                  <span>{new Date(sim.createdAt).toLocaleString('pt-BR')}</span>
                  <span>{hadImpact ? 'Houve impacto' : 'Sem impacto (redundância funcionou)'}</span>
                </div>

                <div style={{ color: '#e2e8f0', fontSize: 13, marginBottom: 4 }}>
                  <strong>Removido:</strong>{' '}
                  {[...sim.removedConnectionIds, ...sim.removedEquipmentIds].join(', ') || '—'}
                </div>

                {impacted.length > 0 && (
                  <div style={{ color: '#fca5a5', fontSize: 13 }}>
                    <strong>Conexões impactadas:</strong> {impacted.map((c) => c.name).join(', ')}
                  </div>
                )}

                {pairs.length > 0 && (
                  <div style={{ color: '#fca5a5', fontSize: 13 }}>
                    <strong>Estações sem comunicação:</strong>{' '}
                    {pairs.map((p) => `${p.stationAName} ⟷ ${p.stationBName}`).join(' | ')}
                  </div>
                )}

                {isolated.length > 0 && (
                  <div style={{ color: '#fca5a5', fontSize: 13 }}>
                    <strong>Equipamentos isolados:</strong> {isolated.map((e) => e.name).join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
