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
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  .player-card { background: rgba(12,12,14,0.8); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px; transition: all 0.25s; animation: fadeInUp 0.4s ease forwards; }
  .player-card:hover { border-color: rgba(16,185,129,0.3); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
  .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
  .match-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; background: rgba(255,255,255,0.05); color: #a1a1aa; }
  .sort-btn { padding: 7px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: #71717a; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .sort-btn.active { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.3); color: #10b981; }

  @media (max-width: 768px) {
    .ms-layout { flex-direction: column !important; }
    .ms-main { padding: 76px 16px 24px !important; width: 100% !important; box-sizing: border-box; }
    .ms-stats { grid-template-columns: 1fr !important; gap: 8px !important; }
    .ms-sort-row { flex-wrap: wrap; gap: 6px; }
    .sort-btn { padding: 6px 12px; font-size: 12px; }
    .ms-grid { grid-template-columns: 1fr !important; }
    .player-card { width: 100% !important; box-sizing: border-box; }
    .player-card:hover { transform: none; }
  }
`;

const COLORS = ['#10b981','#60a5fa','#c084fc','#f472b6','#fb923c','#34d399','#fbbf24','#818cf8','#f87171','#38bdf8','#a78bfa','#4ade80'];
const BG_COLORS = ['rgba(16,185,129,0.15)','rgba(96,165,250,0.15)','rgba(192,132,252,0.15)','rgba(244,114,182,0.15)','rgba(251,146,60,0.15)','rgba(52,211,153,0.15)','rgba(251,191,36,0.15)','rgba(129,140,248,0.15)','rgba(248,113,113,0.15)','rgba(56,189,248,0.15)','rgba(167,139,250,0.15)','rgba(74,222,128,0.15)'];

function getColorIndex(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % COLORS.length;
  return h;
}

export default function MySquads() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('matches'); // matches | spent | rate

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

  // Aggregate players from all matches
  const playerMap = {};
  matches.forEach(match => {
    (match.players || []).forEach(p => {
      const key = p.name.trim().toLowerCase();
      if (!playerMap[key]) {
        playerMap[key] = {
          name: p.name.trim(),
          matchCount: 0,
          paidCount: 0,
          totalOwed: 0,
          totalPaid: 0,
          methods: new Set(),
          sports: new Set(),
          lastSeen: match.date || '',
        };
      }
      playerMap[key].matchCount++;
      playerMap[key].totalOwed += p.amount || 0;
      if (p.paid) { playerMap[key].paidCount++; playerMap[key].totalPaid += p.amount || 0; }
      if (p.method) playerMap[key].methods.add(p.method);
      if (match.sport) playerMap[key].sports.add(match.sport);
      if (match.date && match.date > playerMap[key].lastSeen) playerMap[key].lastSeen = match.date;
    });
  });

  let players = Object.values(playerMap);

  if (sortBy === 'matches') players.sort((a, b) => b.matchCount - a.matchCount);
  else if (sortBy === 'spent') players.sort((a, b) => b.totalPaid - a.totalPaid);
  else if (sortBy === 'rate') players.sort((a, b) => (b.paidCount / b.matchCount) - (a.paidCount / a.matchCount));

  return (
    <div className="ms-layout" style={{ background: '#09090b', color: '#e4e4e7', fontFamily: "'Inter', sans-serif", minHeight: '100vh', display: 'flex' }}>
      <style>{styles}</style>
      <Sidebar active="My Squads" />

      <div className="ms-main" style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>My Squads 👥</h1>
          <p style={{ color: '#71717a', fontSize: '14px' }}>All players you've played with, ranked by activity.</p>
        </div>

        {/* Stats */}
        {!loading && players.length > 0 && (
          <div className="ms-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
            {[
              { label: 'Unique Players', value: players.length, icon: '👤' },
              { label: 'Total Matches', value: matches.length, icon: '⚽' },
              { label: 'Most Active', value: players[0]?.name.split(' ')[0] || '—', icon: '🏆' },
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
        )}

        {/* Sort controls */}
        <div className="ms-sort-row" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <span style={{ fontSize: '13px', color: '#52525b', alignSelf: 'center', marginRight: '4px' }}>Sort by:</span>
          {[['matches', '# Matches'], ['spent', 'Amount Paid'], ['rate', 'Pay Rate']].map(([val, label]) => (
            <button key={val} className={`sort-btn ${sortBy === val ? 'active' : ''}`} onClick={() => setSortBy(val)}>{label}</button>
          ))}
        </div>

        {/* Player Grid */}
        {loading && (
          <div className="ms-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: '180px' }} />)}
          </div>
        )}

        {!loading && players.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: '#52525b' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#71717a', marginBottom: '8px' }}>No squad members yet</div>
            <div style={{ fontSize: '14px' }}>Create a match and add players — they'll appear here automatically.</div>
          </div>
        )}

        <div className="ms-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {players.map((p, i) => {
            const ci = getColorIndex(p.name);
            const payRate = p.matchCount > 0 ? Math.round((p.paidCount / p.matchCount) * 100) : 0;

            return (
              <div key={p.name} className="player-card" style={{ animationDelay: `${i * 0.05}s` }}>
                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: BG_COLORS[ci], border: `2px solid ${COLORS[ci]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800, color: COLORS[ci], flexShrink: 0 }}>
                    {p.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#52525b', marginTop: '2px' }}>{[...p.methods].join(' · ') || '—'}</div>
                  </div>
                  {i === 0 && sortBy === 'matches' && (
                    <div style={{ marginLeft: 'auto', fontSize: '16px' }}>🏆</div>
                  )}
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  {[
                    { label: 'Matches', value: p.matchCount },
                    { label: 'Total Paid', value: `₹${Math.round(p.totalPaid).toLocaleString('en-IN')}` },
                    { label: 'Pay Rate', value: `${payRate}%` },
                    { label: 'Sports', value: [...p.sports].join(', ') || '—' },
                  ].map((s, j) => (
                    <div key={j} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '11px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{s.label}</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#e4e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Pay rate bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#52525b', marginBottom: '5px' }}>
                    <span>Payment reliability</span>
                    <span style={{ color: payRate >= 80 ? '#10b981' : payRate >= 50 ? '#fbbf24' : '#f87171', fontWeight: 600 }}>{payRate}%</span>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${payRate}%`, borderRadius: '100px', background: payRate >= 80 ? 'linear-gradient(90deg,#10b981,#34d399)' : payRate >= 50 ? '#fbbf24' : '#f87171', transition: 'width 1s ease' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
