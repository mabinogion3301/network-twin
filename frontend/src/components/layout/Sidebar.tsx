import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/geo-map', label: 'Mapa da Rede', icon: '🗺️' },
  { to: '/stations', label: 'Estações', icon: '🏢' },
  { to: '/equipments', label: 'Equipamentos', icon: '🖧' },
  { to: '/connections', label: 'Conexões', icon: '🔗' },
  { to: '/simulations', label: 'Histórico de Simulações', icon: '⚠️' },
];

export function Sidebar() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <div style={{ width: 220, background: '#1e293b', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: 20, color: '#e2e8f0', fontWeight: 700, fontSize: 16, borderBottom: '1px solid #334155' }}>
        Network Twin
      </div>
      <nav style={{ flex: 1, padding: 12 }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              color: isActive ? '#fff' : '#94a3b8',
              background: isActive ? '#3b82f6' : 'transparent',
              textDecoration: 'none',
              fontSize: 14,
              marginBottom: 4,
            })}
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={logout}
        style={{ margin: 12, padding: 10, background: '#334155', border: 'none', borderRadius: 8, color: '#e2e8f0', cursor: 'pointer' }}
      >
        Sair
      </button>
    </div>
  );
}
