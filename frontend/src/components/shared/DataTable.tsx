import React from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  getId: (row: T) => string;
}

export function DataTable<T>({ columns, rows, onEdit, onDelete, getId }: Props<T>) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #334155' }}>
          {columns.map((col) => (
            <th key={col.key} style={{ textAlign: 'left', padding: '10px 12px', color: '#94a3b8', fontWeight: 600 }}>
              {col.label}
            </th>
          ))}
          {(onEdit || onDelete) && <th style={{ width: 120 }} />}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={columns.length + 1} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
              Nenhum registro encontrado.
            </td>
          </tr>
        )}
        {rows.map((row) => (
          <tr key={getId(row)} style={{ borderBottom: '1px solid #1e293b' }}>
            {columns.map((col) => (
              <td key={col.key} style={{ padding: '10px 12px', color: '#e2e8f0' }}>
                {col.render ? col.render(row) : String((row as any)[col.key] ?? '')}
              </td>
            ))}
            {(onEdit || onDelete) && (
              <td style={{ padding: '10px 12px', display: 'flex', gap: 8 }}>
                {onEdit && (
                  <button onClick={() => onEdit(row)} style={actionBtn}>
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(row)} style={{ ...actionBtn, color: '#ef4444' }}>
                    Excluir
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const actionBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #334155',
  borderRadius: 6,
  padding: '4px 10px',
  color: '#cbd5e1',
  cursor: 'pointer',
  fontSize: 12,
};
