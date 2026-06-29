import React from 'react';
import { SimulationResult } from '../../hooks/useWebSocket';

interface Props {
  result: SimulationResult | null;
}

export function ImpactPanel({ result }: Props) {
  if (!result) {
    return (
      <div style={panelStyle}>
        <h4 style={titleStyle}>Painel de Impactos</h4>
        <p style={{ color: '#64748b', fontSize: 13 }}>Nenhuma simulação executada ainda.</p>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <h4 style={titleStyle}>Painel de Impactos</h4>

      <Section title="Estações sem comunicação entre si">
        {result.unavailableStationPairs.length === 0 ? (
          <Empty text="Nenhuma — toda a rede permanece conectada (rotas redundantes funcionaram)." />
        ) : (
          result.unavailableStationPairs.map((p) => (
            <Item key={p.linkId} color="#ef4444">
              {p.stationAName} ⟷ {p.stationBName}
            </Item>
          ))
        )}
      </Section>

      <Section title="Equipamentos isolados">
        {result.isolatedEquipment.length === 0 ? (
          <Empty text="Nenhum." />
        ) : (
          result.isolatedEquipment.map((eq) => (
            <Item key={eq.id} color="#f59e0b">{eq.name}</Item>
          ))
        )}
      </Section>

      <Section title="Conexões impactadas">
        {result.impactedConnections.length === 0 ? (
          <Empty text="Nenhuma." />
        ) : (
          result.impactedConnections.map((c) => (
            <Item key={c.id} color="#ef4444">{c.name}</Item>
          ))
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' }}>{title}</p>
      {children}
    </div>
  );
}

function Item({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div style={{ fontSize: 13, color: '#e2e8f0', padding: '4px 8px', borderLeft: `3px solid ${color}`, marginBottom: 4, background: '#1e293b' }}>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p style={{ color: '#22c55e', fontSize: 12 }}>{text}</p>;
}

const panelStyle: React.CSSProperties = {
  width: 300,
  background: '#0f172a',
  borderLeft: '1px solid #1e293b',
  padding: 16,
  overflowY: 'auto',
};

const titleStyle: React.CSSProperties = { color: '#e2e8f0', fontSize: 15, marginTop: 0 };
