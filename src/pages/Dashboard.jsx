import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #09090b; }
  ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 3px; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  .anim { animation: fadeInUp 0.5s ease forwards; }
  .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 20px; transition: all 0.2s; }
  .stat-card:hover { border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.03); transform: translateY(-2px); }
  .match-row { display: grid; grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 1fr; align-items: center; padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s; cursor: pointer; text-decoration: none; color: inherit; }
  .match-row:hover { background: rgba(16,185,129,0.04); }
  .match-row:last-child { border-bottom: none; }
  .pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
  .pill-active { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
  .pill-done { background: rgba(113,113,122,0.1); color: #71717a; border: 1px solid rgba(113,113,122,0.2); }
  .pill-pending { background: rgba(251,191,36,0.1); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
  .sidebar-link { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; text-decoration: none; color: #71717a; font-size: 14px; font-weight: 500; transition: all 0.2s; background: none; border: none; width: 100%; cursor: pointer; font-family: 'Inter', sans-serif; }
  .sidebar-link:hover { background: rgba(255,255,255,0.05); color: #e4e4e7; }
  .sidebar-link.active { background: rgba(16,185,129,0.1); color: #10b981; }
  .action-btn { padding: 10px 20px; background: #10b981; color: #022c22; border: none; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
  .action-btn:hover { background: #34d399; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,0.35); }
  .progress-bar { height: 6px; background: rgba(255,255,255,0.06); border-radius: 100px; overflow: hidden; margin-top: 8px; }
  .progress-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #10b981, #34d399); }
  .tab-btn { padding: 8px 16px; border-radius: 8px 8px 0 0; border: none; background: transparent; font-weight: 600; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .logout-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: #f87171; font-size: 14px; font-weight: 500; transition: all 0.2s; background: none; border: none; width: 100%; cursor: pointer; font-family: 'Inter', sans-serif; }
  .logout-btn:hover { background: rgba(248,113,113,0.08); }
  .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite; border-radius: 6px; }

  @media (max-width: 767px) {
    .dash-layout { flex-direction: column !important; }
    .dash-main { padding: 76px 16px 24px !important; }
    .dash-header { flex-direction: column !important; gap: 12px !important; margin-bottom: 20px !important; }
    .dash-header h1 { font-size: 22px !important; }
    .dash-header .action-btn { width: 100%; justify-content: center; }
    .stats-grid { grid-template-columns: 1fr !important; gap: 10px !important; margin-bottom: 20px !important; }
    .stat-card { padding: 14px !important; }
    .stat-card-value { font-size: 18px !important; }
    .match-table { border-radius: 12px; }
    .match-table-header { display: none !important; }
    .match-row {
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
      padding: 14px !important;
      position: relative;
    }
    .match-row-top { display: flex; align-items: center; justify-content: space-between; width: 100%; }
    .match-row-meta { display: flex; align-items: center; gap: 12px; width: 100%; }
    .match-row-progress { width: 100%; }
    .tab-btn { padding: 6px 10px; font-size: 12px; }
    .tabs-bar { padding: 12px 12px 0 !important; overflow-x: auto; white-space: nowrap; }
  }
  @media (max-width: 480px) {
    .stat-card-value { font-size: 16px !important; }
  }
`;

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'matches'),
      where('createdBy', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setMatches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingMatches(false);
      setError(null);
    }, (err) => {
      console.error('Firestore error:', err);
      setError(err.message);
      setLoadingMatches(false);
    });
    return unsub;
  }, [user]);

  const handleLogout = async () => {
    try { await logout(); navigate('/signin'); } catch (e) { console.error(e); }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initial = displayName[0]?.toUpperCase() || 'U';
  const filtered = activeTab === 'all' ? matches : matches.filter(m => m.status === activeTab);

  // Compute stats from real data
  const totalSpent = matches.reduce((a, m) => a + (m.totalCost || 0), 0);
  const pendingAmount = matches.reduce((a, m) => {
    if (!m.players) return a;
    return a + m.players.reduce((s, p) => {
      const pAmtPaid = p.amountPaid !== undefined ? p.amountPaid : (p.paid ? (p.amount || 0) : 0);
      const pAmt = p.amount || 0;
      return s + Math.max(0, pAmt - pAmtPaid);
    }, 0);
  }, 0);
  const totalPlayers = matches.reduce((a, m) => a + (m.players?.length || 0), 0);
  const paidPlayers = matches.reduce((a, m) => a + (m.players?.filter(p => {
    const pAmtPaid = p.amountPaid !== undefined ? p.amountPaid : (p.paid ? (p.amount || 0) : 0);
    const pAmt = p.amount || 0;
    return pAmt > 0 && pAmtPaid >= pAmt;
  }).length || 0), 0);
  const settlementRate = totalPlayers > 0 ? Math.round((paidPlayers / totalPlayers) * 100) : 0;

  return (
    <div className="dash-layout" style={{ background: '#09090b', color: '#e4e4e7', fontFamily: "'Inter', sans-serif", minHeight: '100vh', display: 'flex' }}>
      <style>{styles}</style>

      {/* Sidebar */}
      <Sidebar active="Dashboard" />

      {/* Main */}
      <div className="dash-main" style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {/* Header */}
        <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Dashboard 🏆
            </h1>
            <p style={{ color: '#71717a', fontSize: '14px' }}>Welcome back, {displayName}! Track your matches and splits.</p>
          </div>
          <Link to="/create-match" className="action-btn">⚡ New Match</Link>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Matches', value: matches.length.toString(), icon: '⚽', change: `${matches.filter(m => m.status === 'active').length} active`, changeColor: '#10b981' },
            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: '💰', change: 'all time', changeColor: '#10b981' },
            { label: 'Pending', value: `₹${Math.round(pendingAmount).toLocaleString('en-IN')}`, icon: '⏳', change: `${matches.filter(m => m.status === 'pending' || m.status === 'active').length} matches`, changeColor: '#fbbf24' },
            { label: 'Settlement Rate', value: `${settlementRate}%`, icon: '✅', change: `${paidPlayers}/${totalPlayers} players`, changeColor: '#10b981' },
          ].map((s, i) => (
            <div key={i} className="stat-card anim" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '22px' }}>{s.icon}</span>
                <span style={{ fontSize: '11px', color: s.changeColor, fontWeight: 600 }}>{s.change}</span>
              </div>
              <div className="stat-card-value" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: '#71717a' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Matches Table */}
        <div className="match-table" style={{ background: 'rgba(12,12,14,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
          {/* Tabs */}
          <div className="tabs-bar" style={{ display: 'flex', gap: '4px', padding: '16px 16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {[['all', 'All Matches'], ['active', 'Active'], ['pending', 'Pending'], ['done', 'Completed']].map(([val, label]) => (
              <button
                key={val}
                className="tab-btn"
                onClick={() => setActiveTab(val)}
                style={{
                  color: activeTab === val ? '#10b981' : '#71717a',
                  background: activeTab === val ? 'rgba(16,185,129,0.1)' : 'transparent',
                  borderBottom: activeTab === val ? '2px solid #10b981' : '2px solid transparent',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Table Header */}
          <div className="match-table-header" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 1fr', padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <div>Match</div><div>Venue</div><div>Date</div><div>Players</div><div>Progress</div><div>Status</div>
          </div>

          {/* Loading skeleton */}
          {loadingMatches && (
            <div style={{ padding: '16px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 1fr', gap: '12px', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                  <div className="skeleton" style={{ height: '18px', width: '80%' }} />
                  <div className="skeleton" style={{ height: '18px', width: '70%' }} />
                  <div className="skeleton" style={{ height: '18px', width: '60%' }} />
                  <div className="skeleton" style={{ height: '18px', width: '40%' }} />
                  <div className="skeleton" style={{ height: '18px', width: '90%' }} />
                  <div className="skeleton" style={{ height: '24px', width: '60px', borderRadius: '100px' }} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingMatches && !error && filtered.length === 0 && (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🏟️</div>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>No matches yet</div>
              <div style={{ fontSize: '13px', color: '#52525b', marginBottom: '24px' }}>Create your first match and start splitting costs with your squad.</div>
              <Link to="/create-match" className="action-btn" style={{ display: 'inline-flex' }}>⚡ Create First Match</Link>
            </div>
          )}

          {/* Error state */}
          {!loadingMatches && error && (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#f87171', marginBottom: '8px' }}>Error Loading Matches</div>
              <div style={{ fontSize: '13px', color: '#f87171', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.5 }}>{error}</div>
            </div>
          )}

          {/* Rows */}
          {!loadingMatches && filtered.map((m, i) => {
            const playerList = m.players || [];
            const paidAmt = playerList.reduce((a, p) => {
              const pAmtPaid = p.amountPaid !== undefined ? p.amountPaid : (p.paid ? (p.amount || 0) : 0);
              return a + pAmtPaid;
            }, 0);
            const totalAmt = m.totalCost || 0;
            const progress = totalAmt > 0 ? (paidAmt / totalAmt) * 100 : 0;

            return (
              <Link key={m.id} to={`/match-details/${m.id}`} className="match-row">
                <div className="match-row-top" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{m.sportEmoji || '⚽'}</span>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#71717a' }}>#{m.id.slice(-4).toUpperCase()}</span>
                  <span style={{ marginLeft: 'auto' }} className={`pill ${m.status === 'active' ? 'pill-active' : m.status === 'done' ? 'pill-done' : 'pill-pending'}`}>
                    {m.status === 'active' ? '● Active' : m.status === 'done' ? '✓ Done' : '⏳ Pending'}
                  </span>
                </div>
                <div className="match-row-meta" style={{ display: 'contents' }}>
                  <div style={{ fontSize: '14px', color: '#a1a1aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.venue}</div>
                  <div style={{ fontSize: '13px', color: '#71717a' }}>{formatDate(m.date)}</div>
                  <div style={{ fontSize: '14px' }}>👤 {playerList.length}</div>
                </div>
                <div className="match-row-progress" style={{ display: 'contents' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>
                      ₹{Math.round(paidAmt).toLocaleString('en-IN')} <span style={{ color: '#52525b', fontWeight: 400 }}>/ ₹{totalAmt.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div style={{ display: 'none' }}>
                    <span className={`pill ${m.status === 'active' ? 'pill-active' : m.status === 'done' ? 'pill-done' : 'pill-pending'}`}>
                      {m.status === 'active' ? '● Active' : m.status === 'done' ? '✓ Done' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
