import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const sidebarStyles = `
  .sidebar-link { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; text-decoration: none; color: #71717a; font-size: 14px; font-weight: 500; transition: all 0.2s; background: none; border: none; width: 100%; cursor: pointer; font-family: 'Inter', sans-serif; }
  .sidebar-link:hover { background: rgba(255,255,255,0.05); color: #e4e4e7; }
  .sidebar-link.active { background: rgba(16,185,129,0.1); color: #10b981; }
  .logout-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: #f87171; font-size: 14px; font-weight: 500; transition: all 0.2s; background: none; border: none; width: 100%; cursor: pointer; font-family: 'Inter', sans-serif; }
  .logout-btn:hover { background: rgba(248,113,113,0.08); }

  /* Mobile Bottom Nav */
  .mobile-bottom-nav { display: none; }
  .mobile-drawer-overlay { display: none; }

  @media (max-width: 768px) {
    .desktop-sidebar { display: none !important; }

    .mobile-bottom-nav {
      display: flex;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 200;
      background: rgba(12,12,14,0.98);
      border-top: 1px solid rgba(255,255,255,0.08);
      padding: 0;
      height: 60px;
      align-items: stretch;
      backdrop-filter: blur(20px);
    }

    .mob-nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      text-decoration: none;
      color: #52525b;
      font-size: 9px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      padding: 6px 2px;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: color 0.2s;
      letter-spacing: 0.02em;
    }
    .mob-nav-item.active { color: #10b981; }
    .mob-nav-item:not(.active):hover { color: #a1a1aa; }
    .mob-nav-icon { font-size: 18px; line-height: 1; }

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
      bottom: 60px;
      left: 0;
      right: 0;
      background: rgba(12,12,14,0.99);
      border-top: 1px solid rgba(255,255,255,0.08);
      z-index: 350;
      padding: 16px;
      transform: translateY(100%);
      transition: transform 0.3s ease;
      border-radius: 16px 16px 0 0;
      backdrop-filter: blur(20px);
    }
    .mobile-drawer.open {
      transform: translateY(0);
    }

    .mob-drawer-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      text-decoration: none;
      color: #a1a1aa;
      font-size: 15px;
      font-weight: 500;
      transition: all 0.2s;
      margin-bottom: 4px;
    }
    .mob-drawer-link:hover { background: rgba(255,255,255,0.05); color: #e4e4e7; }
    .mob-drawer-link.active { background: rgba(16,185,129,0.1); color: #10b981; }
    .mob-drawer-link-icon { font-size: 20px; width: 28px; text-align: center; }
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

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-bottom-nav">
        {primaryLinks.map(link => (
          <Link
            key={link.label}
            to={link.to}
            className={`mob-nav-item ${active === link.label ? 'active' : ''}`}
            onClick={() => setDrawerOpen(false)}
          >
            <span className="mob-nav-icon">{link.icon}</span>
            <span>{link.label.split(' ')[0]}</span>
          </Link>
        ))}
        <button
          className={`mob-nav-item ${drawerOpen ? 'active' : ''}`}
          onClick={() => setDrawerOpen(v => !v)}
        >
          <span className="mob-nav-icon">{drawerOpen ? '✕' : '☰'}</span>
          <span>More</span>
        </button>
      </nav>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      <div
        className={`mobile-drawer-overlay ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ── MOBILE DRAWER ── */}
      <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', marginBottom: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
          {user?.photoURL
            ? <img src={user.photoURL} alt={displayName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(16,185,129,0.4)', flexShrink: 0 }} />
            : <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#022c22', fontSize: '16px', flexShrink: 0 }}>{initial}</div>
          }
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#f4f4f5' }}>{displayName}</div>
            <div style={{ fontSize: '12px', color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</div>
          </div>
        </div>

        {/* All links */}
        {links.slice(4).map(link => (
          <Link
            key={link.label}
            to={link.to}
            className={`mob-drawer-link ${active === link.label ? 'active' : ''}`}
            onClick={() => setDrawerOpen(false)}
          >
            <span className="mob-drawer-link-icon">{link.icon}</span>
            {link.label}
          </Link>
        ))}

        <button
          onClick={() => { setDrawerOpen(false); handleLogout(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', color: '#f87171', width: '100%', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.1)', cursor: 'pointer', fontSize: '15px', fontWeight: 500, fontFamily: 'Inter, sans-serif', marginTop: '8px' }}
        >
          <span style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>🚪</span>
          Logout
        </button>
      </div>
    </>
  );
}
