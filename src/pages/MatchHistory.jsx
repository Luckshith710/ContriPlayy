import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  .mh-card { background: rgba(12,12,14,0.8); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; text-decoration: none; color: inherit; transition: all 0.2s; animation: fadeInUp 0.4s ease forwards; }
  .mh-card:hover { border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.03); transform: translateX(4px); }
  .pill { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; }
  .pill-active { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
  .pill-done { background: rgba(113,113,122,0.1); color: #71717a; border: 1px solid rgba(113,113,122,0.2); }
  .pill-pending { background: rgba(251,191,36,0.1); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
  .progress-bar { height: 5px; background: rgba(255,255,255,0.06); border-radius: 100px; overflow: hidden; width: 100px; }
  .progress-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #10b981, #34d399); }
  .filter-btn { padding: 7px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: #71717a; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .filter-btn:hover { border-color: rgba(255,255,255,0.18); color: #e4e4e7; }
  .filter-btn.active { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.3); color: #10b981; }
  .search-input { padding: 10px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #f4f4f5; font-size: 14px; outline: none; font-family: 'Inter', sans-serif; width: 240px; transition: border-color 0.2s; }
  .search-input:focus { border-color: rgba(16,185,129,0.4); }
  .search-input::placeholder { color: #52525b; }
  .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
`;

function formatDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MatchHistory() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSport, setFilterSport] = useState('all');
  const [search, setSearch] = useState('');

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
      setError(null);
    }, err => {
      console.error(err);
      setError(err.message);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const sports = ['all', ...new Set(matches.map(m => m.sport).filter(Boolean))];

  const filtered = matches.filter(m => {
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    if (filterSport !== 'all' && m.sport !== filterSport) return false;
    if (search && !m.venue?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalSpent = filtered.reduce((a, m) => a + (m.totalCost || 0), 0);

  return (
    <div style={{ background: '#09090b', color: '#e4e4e7', fontFamily: "'Inter', sans-serif", minHeight: '100vh', display: 'flex' }}>
      <style>{styles}</style>
      <Sidebar active="Match History" />

      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Match History 📋
          </h1>
          <p style={{ color: '#71717a', fontSize: '14px' }}>All your past matches and splits in one place.</p>
        </div>

        {/* Summary strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Total Matches', value: matches.length, icon: '⚽' },
            { label: 'Filtered Results', value: filtered.length, icon: '🔍' },
            { label: 'Total Spent (filtered)', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: '💰' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '24px' }}>{s.icon}</span>
              <div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '22px', fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: '#71717a' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
          <input
            className="search-input"
            placeholder="🔍  Search by venue..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            {[['all', 'All'], ['active', 'Active'], ['done', 'Completed']].map(([val, label]) => (
              <button key={val} className={`filter-btn ${filterStatus === val ? 'active' : ''}`} onClick={() => setFilterStatus(val)}>{label}</button>
            ))}
          </div>
          {sports.length > 1 && (
            <div style={{ display: 'flex', gap: '6px' }}>
              {sports.map(s => (
                <button key={s} className={`filter-btn ${filterSport === s ? 'active' : ''}`} onClick={() => setFilterSport(s)}>
                  {s === 'all' ? 'All Sports' : s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Match List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading && [1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ height: '90px' }} />
          ))}

          {/* Empty State */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 24px', color: '#52525b' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#71717a', marginBottom: '8px' }}>No matches found</div>
              <div style={{ fontSize: '14px' }}>You haven't added any matches matching these filters.</div>
              <Link to="/create-match" style={{ display: 'inline-flex', marginTop: '20px', padding: '10px 24px', background: '#10b981', color: '#022c22', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>⚡ Create Match</Link>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '80px 24px', color: '#f87171' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Error Loading Matches</div>
              <div style={{ fontSize: '14px', maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>{error}</div>
            </div>
          )}

          {!loading && filtered.map((m, i) => {
            const players = m.players || [];
            const collected = players.reduce((a, p) => {
              const paidAmt = p.amountPaid !== undefined ? p.amountPaid : (p.paid ? p.amount || 0 : 0);
              return a + paidAmt;
            }, 0);
            const progress = m.totalCost > 0 ? (collected / m.totalCost) * 100 : 0;

            return (
              <Link key={m.id} to={`/match-details/${m.id}`} className="mh-card" style={{ animationDelay: `${i * 0.04}s` }}>
                {/* Left: sport + info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                    {m.sportEmoji || '⚽'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.venue}</div>
                    <div style={{ fontSize: '12px', color: '#71717a' }}>{formatDate(m.date)}{m.time ? ` • ${m.time}` : ''} • {players.length} players</div>
                  </div>
                </div>

                {/* Middle: progress */}
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#a1a1aa' }}>
                    ₹{Math.round(collected).toLocaleString('en-IN')} <span style={{ color: '#52525b', fontWeight: 400 }}>/ ₹{(m.totalCost || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {/* Right: status + arrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <span className={`pill ${m.status === 'active' ? 'pill-active' : m.status === 'done' ? 'pill-done' : 'pill-pending'}`}>
                    {m.status === 'active' ? '● Active' : m.status === 'done' ? '✓ Done' : '⏳ Pending'}
                  </span>
                  <span style={{ color: '#52525b', fontSize: '18px' }}>→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
