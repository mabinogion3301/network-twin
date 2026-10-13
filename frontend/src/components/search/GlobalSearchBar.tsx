import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api/client';

interface SearchResults {
  stations: any[];
  equipments: any[];
  connections: any[];
  ports: any[];
}

export function GlobalSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    const timeout = setTimeout(() => {
      api.get('/search', { params: { q: query } }).then((r) => {
        setResults(r.data);
        setOpen(true);
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasResults =
    results && (results.stations.length + results.equipments.length + results.connections.length + results.ports.length > 0);

  function flyToStation(station: any) {
    if (station.latitude != null && station.longitude != null) {
      window.dispatchEvent(new CustomEvent('fly-to-station', {
        detail: { lat: station.latitude, lng: station.longitude, id: station.id, name: station.name },
      }));
    }
    setOpen(false);
    setQuery(station.name);
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: 360, zIndex: 2000 }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results && setOpen(true)}
        placeholder="Buscar estação, equipamento, IP, conexão, porta..."
        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#e2e8f0' }}
      />
      {open && results && (
        <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: 8, zIndex: 2000, maxHeight: 360, overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
          {!hasResults && <p style={{ color: '#64748b', fontSize: 13, padding: 8 }}>Nenhum resultado.</p>}

          {results.stations.length > 0 && (
            <Group title="Estações">
              {results.stations.map((s) => (
                <ResultItem
                  key={s.id}
                  primary={s.name}
                  secondary={`${s.city} / ${s.state}`}
                  onClick={() => flyToStation(s)}
                />
              ))}
            </Group>
          )}
          {results.equipments.length > 0 && (
            <Group title="Equipamentos">
              {results.equipments.map((e) => (
                <ResultItem key={e.id} primary={e.name} secondary={`${e.station?.name ?? ''} ${e.ip ? '· ' + e.ip : ''}`} />
              ))}
            </Group>
          )}
          {results.connections.length > 0 && (
            <Group title="Conexões">
              {results.connections.map((c) => (
                <ResultItem key={c.id} primary={c.name} secondary={c.type} />
              ))}
            </Group>
          )}
          {results.ports.length > 0 && (
            <Group title="Portas">
              {results.ports.map((p) => (
                <ResultItem key={p.id} primary={p.name ?? `Porta ${p.number}`} secondary={p.equipment?.name} />
              ))}
            </Group>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <p style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', padding: '4px 8px', margin: 0 }}>{title}</p>
      {children}
    </div>
  );
}

function ResultItem({ primary, secondary, onClick }: { primary: string; secondary?: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '6px 8px',
        borderRadius: 6,
        cursor: onClick ? 'pointer' : 'default',
        background: hovered && onClick ? 'rgba(99,102,241,0.15)' : 'transparent',
        transition: 'background 0.1s',
      }}
    >
      <div style={{ color: '#e2e8f0', fontSize: 13 }}>{primary}</div>
      {secondary && <div style={{ color: '#64748b', fontSize: 11 }}>{secondary}</div>}
    </div>
  );
}
