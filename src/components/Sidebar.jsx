import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const sidebarStyles = `
  .sidebar-link { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; text-decoration: none; color: #71717a; font-size: 14px; font-weight: 500; transition: all 0.2s; background: none; border: none; width: 100%; cursor: pointer; font-family: 'Inter', sans-serif; }
  .sidebar-link:hover { background: rgba(255,255,255,0.05); color: #e4e4e7; }
  .sidebar-link.active { background: rgba(16,185,129,0.1); color: #10b981; }
  .logout-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: #f87171; font-size: 14px; font-weight: 500; transition: all 0.2s; background: none; border: none; width: 100%; cursor: pointer; font-family: 'Inter', sans-serif; }
  .logout-btn:hover { background: rgba(248,113,113,0.08); }
`;

export default function Sidebar({ active }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initial = displayName[0]?.toUpperCase() || 'U';

  const handleLogout = async () => {
    try { await logout(); navigate('/signin'); } catch (e) { console.error(e); }
  };

  const links = [
    { icon: '⊞', label: 'Dashboard', to: '/dashboard' },
    { icon: '⚡', label: 'New Match', to: '/create-match' },
    { icon: '📋', label: 'Match History', to: '/match-history' },
    { icon: '👥', label: 'My Squads', to: '/my-squads' },
    { icon: '📊', label: 'Analytics', to: '/analytics' },
    { icon: '💳', label: 'My Expenses', to: '/expenses' },
  ];

  return (
    <div style={{ width: '240px', background: 'rgba(12,12,14,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
      <style>{sidebarStyles}</style>
      <Link to="/" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 800, color: '#10b981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', marginBottom: '24px' }}>
        ⚽ ContriPlayy
      </Link>

      {links.map(link => (
        <Link key={link.label} to={link.to} className={`sidebar-link ${active === link.label ? 'active' : ''}`}>
          <span>{link.icon}</span> {link.label}
        </Link>
      ))}

      <div style={{ flex: 1 }} />

      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user?.photoURL
            ? <img src={user.photoURL} alt={displayName} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(16,185,129,0.3)' }} />
            : <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#022c22', fontSize: '14px', flexShrink: 0 }}>{initial}</div>
          }
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
            <div style={{ fontSize: '11px', color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</div>
          </div>
        </div>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        <span>🚪</span> Logout
      </button>
    </div>
  );
}
