import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const links = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    to: '/geo-map', label: 'Mapa da Rede',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  },
  {
    to: '/stations', label: 'Estações',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 L4 20 M12 2 L20 20"/><path d="M7 12 L17 12 M6 17 L18 17"/><circle cx="12" cy="2" r="2" fill="currentColor" stroke="none"/><path d="M10 6 A4 4 0 0 1 14 6"/></svg>,
  },
  {
    to: '/equipments', label: 'Equipamentos',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 11h.01M10 11h.01M14 11h.01"/><path d="M5 7V5a1 1 0 011-1h12a1 1 0 011 1v2"/></svg>,
  },
  {
    to: '/connections', label: 'Conexões',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
  },
];

export function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside style={{
      width: 220,
      background: 'var(--bg-panel)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="1.5"/>
          <circle cx="12" cy="12" r="4" fill="#3b82f6"/>
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
            NETWORK TWIN
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
            TELEBRAS · NOC
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 'var(--radius)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent)' : 'transparent',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              transition: 'background 0.15s, color 0.15s',
            })}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '9px 12px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            transition: 'border-color 0.15s, color 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sair
        </button>
      </div>
    </aside>
  );
}
