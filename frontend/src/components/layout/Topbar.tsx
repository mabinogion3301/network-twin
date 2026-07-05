import { GlobalSearchBar } from '../search/GlobalSearchBar';

export function Topbar() {
  return (
    <header style={{
      height: 52,
      background: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      justifyContent: 'space-between',
      gap: 16,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: 'var(--green)',
          boxShadow: '0 0 6px #10b981',
          animation: 'pulse-dot 2s infinite',
        }} />
        <style>{`@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
          SISTEMA ONLINE
        </span>
      </div>
      <GlobalSearchBar />
    </header>
  );
}
