import React from 'react';
interface Props {
  selected: Record<string, any> | null;
}

export function EquipmentDetailsPanel({ selected }: Props) {
  if (!selected) {
    return (
      <div style={panelStyle}>
        <p style={{ color: '#64748b', fontSize: 13 }}>
          Clique em um equipamento ou conexão no mapa para ver os detalhes.
        </p>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <h3 style={{ marginTop: 0, color: '#e2e8f0', fontSize: 15 }}>{selected.label}</h3>
      {Object.entries(selected)
        .filter(([key]) => key !== 'label' && key !== 'id')
        .map(([key, value]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid #1e293b' }}>
            <span style={{ color: '#64748b' }}>{key}</span>
            <span style={{ color: '#cbd5e1' }}>{String(value)}</span>
          </div>
        ))}
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  width: 280,
  background: '#0f172a',
  borderLeft: '1px solid #1e293b',
  padding: 16,
  overflowY: 'auto',
};
