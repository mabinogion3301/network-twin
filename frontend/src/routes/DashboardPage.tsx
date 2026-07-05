import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
}

export function DashboardPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  function load() {
    dashboardApi.overview().then((d) => {
      setData(d);
      setLastUpdate(new Date());
    });
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
      Carregando...
    </div>
  );

  const networkOk = !data.hasActiveSimulation && data.offlineStations === 0 && data.offlineEquipments === 0 && data.offlineConnections === 0;

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 28, overflowY: 'auto', height: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4 }}>
            VISÃO GERAL
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Status da Rede
          </h1>
        </div>
        {lastUpdate && (
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'right' }}>
            Atualizado às<br />
            <span style={{ color: 'var(--text-secondary)' }}>
              {lastUpdate.toLocaleTimeString('pt-BR')}
            </span>
          </div>
        )}
      </div>

      {/* Status geral da rede */}
      <div style={{
        background: networkOk ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
        border: `1px solid ${networkOk ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <div style={{
          width: 12, height: 12, borderRadius: '50%',
          background: networkOk ? 'var(--green)' : 'var(--red)',
          boxShadow: networkOk ? '0 0 10px #10b981' : '0 0 10px #ef4444',
          flexShrink: 0,
        }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
            {networkOk ? 'Rede operando normalmente' : 'Rede com ocorrências ativas'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {networkOk
              ? 'Todos os equipamentos, estações e conexões estão online.'
              : `${data.hasActiveSimulation ? 'Simulação de falha ativa · ' : ''}${data.offlineStations > 0 ? `${data.offlineStations} estação(ões) offline · ` : ''}${data.offlineConnections > 0 ? `${data.offlineConnections} link(s) offline` : ''}`.replace(/ · $/, '')
            }
          </div>
        </div>
        {!networkOk && (
          <Link to="/geo-map" style={{
            marginLeft: 'auto', padding: '7px 14px',
            background: 'var(--red)', borderRadius: 'var(--radius)',
            color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none',
            flexShrink: 0,
          }}>
            Ver no Mapa →
          </Link>
        )}
      </div>

      {/* Falha ativa (só aparece se houver simulação) */}
      {data.hasActiveSimulation && (
        <section>
          <SectionLabel>Simulação Ativa</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <StatCard label="Links Rompidos" value={data.linksInFailure} accent="var(--red)" icon="🔴" />
            <StatCard label="Equipamentos Isolados" value={data.equipmentInFailure} accent="var(--red)" icon="⚡" />
            <StatCard label="Estações Sem Comunicação" value={data.stationsInFailure} accent="var(--red)" icon="📡" />
          </div>
        </section>
      )}

      {/* Inventário */}
      <section>
        <SectionLabel>Inventário</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <StatCard label="Estações" value={data.stationsCount} sub={data.offlineStations > 0 ? `${data.offlineStations} offline` : 'Todas online'} accent="var(--accent)" icon="🏢" />
          <StatCard label="Equipamentos" value={data.equipmentsCount} sub={data.offlineEquipments > 0 ? `${data.offlineEquipments} offline` : 'Todos online'} accent="var(--accent)" icon="🖧" />
          <StatCard label="Conexões" value={data.connectionsCount} sub={data.offlineConnections > 0 ? `${data.offlineConnections} offline` : 'Todas online'} accent="var(--accent)" icon="🔗" />
        </div>
      </section>

      {/* Atalhos */}
      <section>
        <SectionLabel>Acesso Rápido</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { to: '/geo-map', label: 'Mapa da Rede', desc: 'Visualizar topologia e simular falhas' },
            { to: '/stations', label: 'Estações', desc: 'Gerenciar locais físicos' },
            { to: '/equipments', label: 'Equipamentos', desc: 'Cadastrar e editar ativos' },
            { to: '/connections', label: 'Conexões', desc: 'Gerenciar links e fibras' },
          ].map((item) => (
            <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hi)';
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
              }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
      letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, accent, icon }: {
  label: string; value: number; sub?: string; accent: string; icon: string;
}) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 18px',
      borderTop: `3px solid ${accent}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
        <span style={{ fontSize: 16 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: sub.includes('offline') && value > 0 ? 'var(--red)' : 'var(--green)', marginTop: 6 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
