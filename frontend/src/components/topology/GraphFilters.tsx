import React from 'react';
interface FilterOptions {
  cities: string[];
  stations: Array<{ id: string; name: string }>;
  types: Array<{ id: string; name: string }>;
}

interface Props {
  options: FilterOptions;
  filters: { city?: string; stationId?: string; typeId?: string; status?: string };
  onChange: (filters: Props['filters']) => void;
}

const STATUS_OPTIONS = ['ONLINE', 'OFFLINE', 'MAINTENANCE'];

export function GraphFilters({ options, filters, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: 12, background: '#1e293b', flexWrap: 'wrap' }}>
      <select
        value={filters.city ?? ''}
        onChange={(e) => onChange({ ...filters, city: e.target.value || undefined })}
        style={selectStyle}
      >
        <option value="">Todas as cidades</option>
        {options.cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={filters.stationId ?? ''}
        onChange={(e) => onChange({ ...filters, stationId: e.target.value || undefined })}
        style={selectStyle}
      >
        <option value="">Todas as estações</option>
        {options.stations.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <select
        value={filters.typeId ?? ''}
        onChange={(e) => onChange({ ...filters, typeId: e.target.value || undefined })}
        style={selectStyle}
      >
        <option value="">Todos os tipos</option>
        {options.types.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <select
        value={filters.status ?? ''}
        onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
        style={selectStyle}
      >
        <option value="">Todos os status</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  background: '#0f172a',
  color: '#e2e8f0',
  border: '1px solid #334155',
  borderRadius: 6,
  padding: '6px 10px',
};
