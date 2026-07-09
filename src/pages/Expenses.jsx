import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #09090b; }
  ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 3px; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .ex-card { background: rgba(12,12,14,0.8); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; animation: fadeInUp 0.4s ease forwards; }
  .stat-chip { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 20px; }
  .ex-input { padding: 10px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #f4f4f5; font-size: 14px; outline: none; transition: border-color 0.2s; font-family: 'Inter', sans-serif; width: 200px; }
  .ex-input:focus { border-color: #10b981; }
  .bar-chart-bar { border-radius: 6px 6px 0 0; transition: opacity 0.2s; cursor: default; }
  .bar-chart-bar:hover { opacity: 0.85; }
  .match-row { display: grid; grid-template-columns: 1fr 2fr 1fr 1fr; align-items: center; padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s; cursor: pointer; text-decoration: none; color: inherit; }
  .match-row:hover { background: rgba(16,185,129,0.04); }
  .match-row:last-child { border-bottom: none; }

  @media (max-width: 767px) {
    .ex-layout { flex-direction: column !important; }
    .ex-main { padding: 76px 16px 24px !important; width: 100% !important; box-sizing: border-box; }
    .ex-page-header { flex-direction: column !important; gap: 14px !important; align-items: stretch !important; }
    .ex-name-bar { flex-direction: column !important; gap: 8px !important; width: 100% !important; padding: 12px !important; }
    .ex-input { width: 100% !important; font-size: 16px; box-sizing: border-box; }
    .ex-save-btn { width: 100%; padding: 12px !important; border-radius: 8px; }
    .ex-kpi-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
    .ex-charts-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
    .ex-table-header { display: none !important; }
    .match-row {
      display: flex !important;
      flex-direction: column !important;
      gap: 4px !important;
      padding: 14px 16px !important;
      align-items: flex-start !important;
    }
    .match-row-venue { font-weight: 600; font-size: 14px; color: #e4e4e7; }
    .match-row-meta { font-size: 12px; color: #71717a; }
    .match-row-amounts { display: flex; gap: 16px; margin-top: 4px; }
    .ex-card { width: 100% !important; box-sizing: border-box; }
  }
`;

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getMonthKey(dateStr) {
  if (!dateStr) return null;
  const [y, m] = dateStr.split('-');
  return `${y}-${m}`;
}

function getWeekKey(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  const dStart = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d - dStart) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((d.getDay() + 1 + days) / 7);
  return `${d.getFullYear()}-W${weekNumber}`;
}

export default function Expenses() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Try to load name from localStorage, fallback to displayName or empty
  const defaultName = localStorage.getItem('contriplayy_player_name') || user?.displayName || user?.email?.split('@')[0] || '';
  const [playerName, setPlayerName] = useState(defaultName);
  const [tempName, setTempName] = useState(defaultName);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'matches'),
      where('createdBy', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setMatches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleSaveName = () => {
    const name = tempName.trim();
    if (name) {
      setPlayerName(name);
      localStorage.setItem('contriplayy_player_name', name);
    }
  };

  // Filter matches to only those where the user is a player (case insensitive)
  const myMatches = matches.map(m => {
    const player = (m.players || []).find(p => p.name.toLowerCase() === playerName.toLowerCase());
    return player ? { ...m, myAmountPaid: player.amountPaid || 0, myAmountDue: player.amount || 0, myStatus: player.status } : null;
  }).filter(Boolean);

  const totalSpent = myMatches.reduce((a, m) => a + m.myAmountPaid, 0);
  const totalMatches = myMatches.length;

  // Monthly Data
  const monthMap = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthMap[key] = { label: MONTH_NAMES[d.getMonth()], spent: 0, count: 0 };
  }
  myMatches.forEach(m => {
    const key = getMonthKey(m.date);
    if (key && monthMap[key]) {
      monthMap[key].spent += m.myAmountPaid;
      monthMap[key].count++;
    }
  });
  const monthData = Object.values(monthMap);
  const maxMonthSpend = Math.max(...monthData.map(m => m.spent), 1);

  // Weekly Data (last 6 weeks)
  const weekMap = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const key = getWeekKey(d.toISOString().split('T')[0]);
    if (key) {
      weekMap[key] = { label: `W${key.split('W')[1]}`, spent: 0, count: 0 };
    }
  }
  myMatches.forEach(m => {
    const key = getWeekKey(m.date);
    if (key && weekMap[key]) {
      weekMap[key].spent += m.myAmountPaid;
      weekMap[key].count++;
    }
  });
  const weekData = Object.values(weekMap);
  const maxWeekSpend = Math.max(...weekData.map(w => w.spent), 1);

  return (
    <div className="ex-layout" style={{ background: '#09090b', color: '#e4e4e7', fontFamily: "'Inter', sans-serif", minHeight: '100vh', display: 'flex' }}>
      <style>{styles}</style>
      <Sidebar active="My Expenses" />

      <div className="ex-main" style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div className="ex-page-header" style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>My Expenses 💳</h1>
            <p style={{ color: '#71717a', fontSize: '14px' }}>Track your personal spending across all matches.</p>
          </div>
          
          <div className="ex-name-bar" style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '12px', color: '#71717a', fontWeight: 600 }}>MY PLAYER NAME</div>
            <input 
              className="ex-input" 
              value={tempName} 
              onChange={e => setTempName(e.target.value)} 
              placeholder="e.g. John Doe"
            />
            <button 
              className="ex-save-btn"
              onClick={handleSaveName}
              style={{ padding: '10px 16px', background: '#10b981', color: '#022c22', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              Save
            </button>
          </div>
        </div>

        {loading && <div style={{ color: '#71717a' }}>Loading your data...</div>}

        {!loading && myMatches.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: '#52525b' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💸</div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#71717a', marginBottom: '8px' }}>No expenses found</div>
            <div style={{ fontSize: '14px' }}>We couldn't find any matches where a player is named <strong>"{playerName}"</strong>.</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>Make sure your Player Name matches exactly what you enter when creating matches.</div>
          </div>
        )}

        {!loading && myMatches.length > 0 && (
          <>
            {/* KPI chips */}
            <div className="ex-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
              {[
                { label: 'Total Personally Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: '💰', color: '#10b981' },
                { label: 'Matches Participated', value: totalMatches, icon: '⚽', color: '#60a5fa' },
                { label: 'Avg Spend / Match', value: `₹${totalMatches > 0 ? Math.round(totalSpent / totalMatches).toLocaleString('en-IN') : 0}`, icon: '📐', color: '#c084fc' },
              ].map((s, i) => (
                <div key={i} className="stat-chip" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div style={{ fontSize: '22px', marginBottom: '10px' }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '26px', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                  <div style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="ex-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              {/* Monthly spend bar chart */}
              <div className="ex-card" style={{ animationDelay: '0.1s' }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>Monthly Spend (Last 6 Months)</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', height: '180px' }}>
                  {monthData.map((m, i) => {
                    const h = maxMonthSpend > 0 ? Math.max((m.spent / maxMonthSpend) * 140, m.spent > 0 ? 8 : 0) : 0;
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '11px', color: '#52525b', fontWeight: 600 }}>
                          {m.spent > 0 ? `₹${Math.round(m.spent)}` : ''}
                        </div>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '140px' }}>
                          <div
                            className="bar-chart-bar"
                            style={{
                              height: `${h}px`,
                              background: h > 0 ? 'linear-gradient(180deg, #10b981, #059669)' : 'rgba(255,255,255,0.04)',
                              width: '100%',
                              border: h === 0 ? '1px dashed rgba(255,255,255,0.06)' : 'none',
                            }}
                            title={m.spent > 0 ? `₹${m.spent.toLocaleString('en-IN')}` : 'No matches'}
                          />
                        </div>
                        <div style={{ fontSize: '12px', color: '#71717a', fontWeight: 500 }}>{m.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly spend bar chart */}
              <div className="ex-card" style={{ animationDelay: '0.15s' }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>Weekly Spend (Last 6 Weeks)</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', height: '180px' }}>
                  {weekData.map((m, i) => {
                    const h = maxWeekSpend > 0 ? Math.max((m.spent / maxWeekSpend) * 140, m.spent > 0 ? 8 : 0) : 0;
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '11px', color: '#52525b', fontWeight: 600 }}>
                          {m.spent > 0 ? `₹${Math.round(m.spent)}` : ''}
                        </div>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '140px' }}>
                          <div
                            className="bar-chart-bar"
                            style={{
                              height: `${h}px`,
                              background: h > 0 ? 'linear-gradient(180deg, #60a5fa, #3b82f6)' : 'rgba(255,255,255,0.04)',
                              width: '100%',
                              border: h === 0 ? '1px dashed rgba(255,255,255,0.06)' : 'none',
                            }}
                            title={m.spent > 0 ? `₹${m.spent.toLocaleString('en-IN')}` : 'No matches'}
                          />
                        </div>
                        <div style={{ fontSize: '12px', color: '#71717a', fontWeight: 500 }}>{m.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* My Match History */}
            <div className="ex-card" style={{ animationDelay: '0.2s', padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700 }}>My Match History</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', padding: '12px 24px', fontSize: '11px', fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="ex-table-header">
                <div>Date</div><div>Venue / Sport</div><div>My Share</div><div>I Paid</div>
              </div>

              <div>
                {myMatches.map((m, i) => (
                  <Link key={m.id} to={`/match-details/${m.id}`} className="match-row" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
                    <div style={{ fontSize: '13px', color: '#71717a' }}>{m.date ? new Date(m.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#e4e4e7', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.venue}</div>
                      <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>{m.sportEmoji} {m.sport}</div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#a1a1aa' }}>₹{m.myAmountDue.toLocaleString('en-IN')}</div>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: m.myAmountPaid >= m.myAmountDue ? '#10b981' : m.myAmountPaid > 0 ? '#60a5fa' : '#fbbf24' }}>
                        ₹{m.myAmountPaid.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
