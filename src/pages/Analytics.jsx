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
  @keyframes growBar { from { height: 0; } to { height: var(--h); } }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  .an-card { background: rgba(12,12,14,0.8); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; animation: fadeInUp 0.4s ease forwards; }
  .stat-chip { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 20px; }
  .stat-chip:hover { border-color: rgba(16,185,129,0.25); }
  .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%); background-size: 400px 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
  .bar-chart-bar { border-radius: 6px 6px 0 0; transition: opacity 0.2s; cursor: default; position: relative; }
  .bar-chart-bar:hover { opacity: 0.85; }
  .donut-label { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 28px; font-weight: 800; }

  @media (max-width: 768px) {
    .an-layout { flex-direction: column !important; }
    .an-main { padding: 16px !important; padding-bottom: 80px !important; }
    .an-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
    .an-charts-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
    .an-card { padding: 18px; }
    .stat-chip { padding: 14px; }
    .stat-chip-value { font-size: 20px !important; }
    .an-loading-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
`;

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const SPORT_COLORS = { Football: '#10b981', Cricket: '#60a5fa', Badminton: '#c084fc', Basketball: '#f472b6', Tennis: '#fb923c', Volleyball: '#fbbf24' };
const DEFAULT_COLOR = '#818cf8';

function getMonthKey(dateStr) {
  if (!dateStr) return null;
  const [y, m] = dateStr.split('-');
  return `${y}-${m}`;
}

export default function Analytics() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // --- Derived stats ---
  const totalSpent = matches.reduce((a, m) => a + (m.totalCost || 0), 0);
  const totalPlayers = matches.reduce((a, m) => a + (m.players?.length || 0), 0);
  const paidPlayers = matches.reduce((a, m) => a + (m.players?.filter(p => {
    const pAmtPaid = p.amountPaid !== undefined ? p.amountPaid : (p.paid ? (p.amount || 0) : 0);
    const pAmt = p.amount || 0;
    return pAmt > 0 && pAmtPaid >= pAmt;
  }).length || 0), 0);
  const settlementRate = totalPlayers > 0 ? Math.round((paidPlayers / totalPlayers) * 100) : 0;
  const avgCostPerMatch = matches.length > 0 ? Math.round(totalSpent / matches.length) : 0;

  // Monthly spend (last 6 months)
  const monthMap = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthMap[key] = { label: MONTH_NAMES[d.getMonth()], spent: 0, count: 0 };
  }
  matches.forEach(m => {
    const key = getMonthKey(m.date);
    if (key && monthMap[key]) {
      monthMap[key].spent += m.totalCost || 0;
      monthMap[key].count++;
    }
  });
  const monthData = Object.values(monthMap);
  const maxMonthSpend = Math.max(...monthData.map(m => m.spent), 1);

  // Sport breakdown
  const sportMap = {};
  matches.forEach(m => {
    const s = m.sport || 'Other';
    if (!sportMap[s]) sportMap[s] = { sport: s, emoji: m.sportEmoji || '⚽', count: 0, spent: 0 };
    sportMap[s].count++;
    sportMap[s].spent += m.totalCost || 0;
  });
  const sportData = Object.values(sportMap).sort((a, b) => b.spent - a.spent);
  const maxSportSpend = Math.max(...sportData.map(s => s.spent), 1);

  // Payment method breakdown
  const methodMap = { UPI: 0, Cash: 0 };
  matches.forEach(m => {
    (m.players || []).forEach(p => {
      const pAmtPaid = p.amountPaid !== undefined ? p.amountPaid : (p.paid ? (p.amount || 0) : 0);
      if (pAmtPaid > 0 && methodMap[p.method] !== undefined) methodMap[p.method] += pAmtPaid;
    });
  });
  const methodTotal = Object.values(methodMap).reduce((a, b) => a + b, 0);
  const methodColors = { UPI: '#10b981', Cash: '#60a5fa' };

  // Top venues
  const venueMap = {};
  matches.forEach(m => {
    const v = m.venue || 'Unknown';
    if (!venueMap[v]) venueMap[v] = { venue: v, count: 0, spent: 0 };
    venueMap[v].count++;
    venueMap[v].spent += m.totalCost || 0;
  });
  const venueData = Object.values(venueMap).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="an-layout" style={{ background: '#09090b', color: '#e4e4e7', fontFamily: "'Inter', sans-serif", minHeight: '100vh', display: 'flex' }}>
      <style>{styles}</style>
      <Sidebar active="Analytics" />

      <div className="an-main" style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>Analytics 📊</h1>
          <p style={{ color: '#71717a', fontSize: '14px' }}>Your sports spending breakdown and trends.</p>
        </div>

        {loading && (
          <div className="an-loading-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '200px' }} />)}
          </div>
        )}

        {!loading && matches.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: '#52525b' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#71717a', marginBottom: '8px' }}>No data yet</div>
            <div style={{ fontSize: '14px' }}>Create a few matches and come back here to see your analytics.</div>
          </div>
        )}

        {!loading && matches.length > 0 && (
          <>
            {/* KPI chips */}
            <div className="an-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
              {[
                { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: '💰', color: '#10b981' },
                { label: 'Matches Played', value: matches.length, icon: '⚽', color: '#60a5fa' },
                { label: 'Avg Cost / Match', value: `₹${avgCostPerMatch.toLocaleString('en-IN')}`, icon: '📐', color: '#c084fc' },
                { label: 'Settlement Rate', value: `${settlementRate}%`, icon: '✅', color: settlementRate >= 80 ? '#10b981' : '#fbbf24' },
              ].map((s, i) => (
                <div key={i} className="stat-chip" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div style={{ fontSize: '22px', marginBottom: '10px' }}>{s.icon}</div>
                  <div className="stat-chip-value" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '26px', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                  <div style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Monthly spend bar chart */}
            <div className="an-card" style={{ marginBottom: '20px', animationDelay: '0.1s' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>Monthly Spend (Last 6 Months)</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', height: '180px' }}>
                {monthData.map((m, i) => {
                  const h = maxMonthSpend > 0 ? Math.max((m.spent / maxMonthSpend) * 140, m.spent > 0 ? 8 : 0) : 0;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#52525b', fontWeight: 600 }}>
                        {m.spent > 0 ? `₹${Math.round(m.spent / 1000)}k` : ''}
                      </div>
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '140px' }}>
                        <div
                          className="bar-chart-bar"
                          style={{
                            height: `${h}px`,
                            background: h > 0 ? 'linear-gradient(180deg, #10b981, #059669)' : 'rgba(255,255,255,0.04)',
                            width: '100%',
                            transition: 'height 1s ease',
                            border: h === 0 ? '1px dashed rgba(255,255,255,0.06)' : 'none',
                          }}
                          title={m.spent > 0 ? `₹${m.spent.toLocaleString('en-IN')} · ${m.count} match${m.count !== 1 ? 'es' : ''}` : 'No matches'}
                        />
                      </div>
                      <div style={{ fontSize: '12px', color: '#71717a', fontWeight: 500 }}>{m.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="an-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              {/* Sport breakdown */}
              <div className="an-card" style={{ animationDelay: '0.15s' }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Spend by Sport</h3>
                {sportData.length === 0 ? (
                  <div style={{ color: '#52525b', fontSize: '14px' }}>No sport data yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {sportData.map((s, i) => {
                      const pct = Math.round((s.spent / maxSportSpend) * 100);
                      const color = SPORT_COLORS[s.sport] || DEFAULT_COLOR;
                      return (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{s.emoji} {s.sport}</span>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '14px', fontWeight: 700, color }}> ₹{s.spent.toLocaleString('en-IN')}</span>
                              <span style={{ fontSize: '11px', color: '#52525b', marginLeft: '6px' }}>{s.count} match{s.count !== 1 ? 'es' : ''}</span>
                            </div>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '100px', transition: 'width 1s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Payment method donut-style */}
              <div className="an-card" style={{ animationDelay: '0.2s' }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Payment Methods Collected</h3>
                {methodTotal === 0 ? (
                  <div style={{ color: '#52525b', fontSize: '14px' }}>No payments recorded yet.</div>
                ) : (
                  <>
                    {Object.entries(methodMap).map(([method, amt], i) => {
                      const pct = methodTotal > 0 ? Math.round((amt / methodTotal) * 100) : 0;
                      const icon = method === 'UPI' ? '📲' : '💵';
                      const color = methodColors[method];
                      return (
                        <div key={i} style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{icon} {method}</span>
                            <div>
                              <span style={{ fontSize: '14px', fontWeight: 700, color }}>₹{Math.round(amt).toLocaleString('en-IN')}</span>
                              <span style={{ fontSize: '11px', color: '#52525b', marginLeft: '6px' }}>{pct}%</span>
                            </div>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '100px', transition: 'width 1s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#71717a' }}>Total Collected</span>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#10b981', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>₹{Math.round(methodTotal).toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Top Venues */}
            {venueData.length > 0 && (
              <div className="an-card" style={{ animationDelay: '0.25s' }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>📍 Top Venues</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {venueData.map((v, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `hsl(${i * 50 + 140}, 60%, 20%)`, border: `1px solid hsl(${i * 50 + 140}, 60%, 35%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', color: `hsl(${i * 50 + 140}, 70%, 65%)`, flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.venue}</div>
                        <div style={{ fontSize: '12px', color: '#52525b', marginTop: '2px' }}>{v.count} match{v.count !== 1 ? 'es' : ''}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 800, color: '#10b981' }}>₹{v.spent.toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: '11px', color: '#52525b' }}>total spent</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
