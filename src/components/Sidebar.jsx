import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const sidebarStyles = `
  .sidebar-link { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; text-decoration: none; color: #71717a; font-size: 14px; font-weight: 500; transition: all 0.2s; background: none; border: none; width: 100%; cursor: pointer; font-family: 'Inter', sans-serif; }
  .sidebar-link:hover { background: rgba(255,255,255,0.05); color: #e4e4e7; }
  .sidebar-link.active { background: rgba(16,185,129,0.1); color: #10b981; }
  .logout-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: #f87171; font-size: 14px; font-weight: 500; transition: all 0.2s; background: none; border: none; width: 100%; cursor: pointer; font-family: 'Inter', sans-serif; }
  .logout-btn:hover { background: rgba(248,113,113,0.08); }

  /* Mobile Header & Drawer */
  .mobile-header { display: none; }
  .mobile-drawer-overlay { display: none; }
  .mobile-drawer { display: none; }

  @media (max-width: 767px) {
    .desktop-sidebar { display: none !important; }

    .mobile-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: rgba(12,12,14,0.95);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      z-index: 200;
      padding: 0 16px;
      backdrop-filter: blur(20px);
    }
    
    .hamburger-btn {
      background: transparent;
      border: none;
      color: #e4e4e7;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
    }

    .mobile-drawer-overlay {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      z-index: 300;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .mobile-drawer-overlay.open {
      opacity: 1;
      pointer-events: all;
    }

    .mobile-drawer {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 280px;
      max-width: 85vw;
      background: rgba(12,12,14,0.98);
      border-right: 1px solid rgba(255,255,255,0.06);
      z-index: 350;
      padding: 24px 16px;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      display: flex;
      flex-direction: column;
      gap: 4px;
      backdrop-filter: blur(20px);
      overflow-y: auto;
    }
    .mobile-drawer.open {
      transform: translateX(0);
    }
  }
`;

export default function Sidebar({ active }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  // Bottom nav shows first 4 links + a "More" button
  const primaryLinks = links.slice(0, 4);

  return (
    <>
      <style>{sidebarStyles}</style>

      {/* ── DESKTOP SIDEBAR ── */}
      <div
        className="desktop-sidebar"
        style={{ width: '240px', background: 'rgba(12,12,14,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}
      >
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

      {/* ── MOBILE HEADER ── */}
      <div className="mobile-header">
        <Link to="/" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 800, color: '#10b981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚽ ContriPlayy
        </Link>
        <button className="hamburger-btn" onClick={() => setDrawerOpen(true)}>
          ☰
        </button>
      </div>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      <div
        className={`mobile-drawer-overlay ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ── MOBILE DRAWER ── */}
      <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 4px' }}>
          <Link to="/" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 800, color: '#10b981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚽ ContriPlayy
          </Link>
          <button className="hamburger-btn" onClick={() => setDrawerOpen(false)}>
            ✕
          </button>
        </div>

        {links.map(link => (
          <Link
            key={link.label}
            to={link.to}
            className={`sidebar-link ${active === link.label ? 'active' : ''}`}
            onClick={() => setDrawerOpen(false)}
          >
            <span>{link.icon}</span> {link.label}
          </Link>
        ))}

        <div style={{ flex: 1 }} />

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '8px' }}>
          {user?.photoURL
            ? <img src={user.photoURL} alt={displayName} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(16,185,129,0.3)', flexShrink: 0 }} />
            : <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#022c22', fontSize: '14px', flexShrink: 0 }}>{initial}</div>
          }
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
            <div style={{ fontSize: '11px', color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</div>
          </div>
        </div>

        <button
          onClick={() => { setDrawerOpen(false); handleLogout(); }}
          className="logout-btn"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </>
  );
}
