import { GlobalSearchBar } from '../search/GlobalSearchBar';

export function Topbar() {
  return (
    <div style={{ height: 56, background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'flex-end' }}>
      <GlobalSearchBar />
    </div>
  );
}
