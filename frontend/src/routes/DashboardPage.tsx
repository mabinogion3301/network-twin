import { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api/dashboard.api';

interface Overview {
  stationsCount: number;
  equipmentsCount: number;
  connectionsCount: number;
  offlineConnections: number;
  offlineStations: number;
  offlineEquipments: number;
  linksInFailure: number;
  equipmentInFailure: number;
  stationsInFailure: number;
  hasActiveSimulation: boolean;
  recentSimulations: Array<{ id: string; createdAt: string }>;
}

export function DashboardPage() {
  const [data, setData] = useState<Overview | null>(null);

  function load() {
    dashboardApi.overview().then(setData);
  }

  useEffect(() => {
    load();
    // Atualiza periodicamente — assim, se alguém simular/normalizar uma
    // falha em outra aba, o Dashboard reflete isso sem precisar de F5.
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div style={{ padding: 24, color: '#94a3b8' }}>Carregando...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: '#e2e8f0', marginBottom: 20 }}>Dashboard</h2>

      {data.hasActiveSimulation && (
        <div style={{ background: '#422006', color: '#fbbf24', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 14 }}>
          ⚠️ Existe uma simulação de falha ATIVA no momento. Os números abaixo em "Falha Ativa Agora" refletem
          o estado atual da rede — vá ao Mapa da Rede para normalizar.
        </div>
      )}

      <h3 style={{ color: '#e2e8f0', marginBottom: 12 }}>Falha Ativa Agora</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Links em Falha" value={data.linksInFailure} color="#ef4444" />
        <KpiCard label="Equipamentos Isolados" value={data.equipmentInFailure} color="#ef4444" />
        <KpiCard label="Estações Sem Comunicação" value={data.stationsInFailure} color="#ef4444" />
      </div>

      <h3 style={{ color: '#e2e8f0', marginBottom: 12 }}>Cadastro (Estático)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Estações" value={data.stationsCount} color="#3b82f6" />
        <KpiCard label="Equipamentos" value={data.equipmentsCount} color="#3b82f6" />
        <KpiCard label="Conexões" value={data.connectionsCount} color="#3b82f6" />
        <KpiCard label="Estações Offline (cadastro)" value={data.offlineStations} color="#6b7280" />
        <KpiCard label="Equipamentos Offline (cadastro)" value={data.offlineEquipments} color="#6b7280" />
        <KpiCard label="Links Offline (cadastro)" value={data.offlineConnections} color="#6b7280" />
      </div>

      <h3 style={{ color: '#e2e8f0' }}>Últimas simulações</h3>
      <div style={{ background: '#1e293b', borderRadius: 12, padding: 16 }}>
        {data.recentSimulations.length === 0 ? (
          <p style={{ color: '#64748b' }}>Nenhuma simulação executada ainda.</p>
        ) : (
          data.recentSimulations.map((sim) => (
            <div key={sim.id} style={{ color: '#cbd5e1', fontSize: 13, padding: '6px 0', borderBottom: '1px solid #334155' }}>
              {new Date(sim.createdAt).toLocaleString('pt-BR')} — ID: {sim.id}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 20, borderLeft: `4px solid ${color}` }}>
      <div style={{ color: '#94a3b8', fontSize: 13 }}>{label}</div>
      <div style={{ color: '#e2e8f0', fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
