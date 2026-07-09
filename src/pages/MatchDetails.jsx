import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #09090b; }
  ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 3px; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  .md-card { background: rgba(12,12,14,0.8); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; animation: fadeInUp 0.4s ease forwards; }
  .player-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 8px; transition: all 0.2s; }
  .player-row:hover { border-color: rgba(16,185,129,0.25); background: rgba(16,185,129,0.03); }
  .pill { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; }
  .pill-paid { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
  .pill-partial { background: rgba(96,165,250,0.1); color: #60a5fa; border: 1px solid rgba(96,165,250,0.2); }
  .pill-pending { background: rgba(251,191,36,0.1); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
  .progress-track { height: 8px; background: rgba(255,255,255,0.06); border-radius: 100px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #10b981, #34d399); transition: width 1.2s ease; }
  .action-btn { padding: 10px 20px; background: #10b981; color: #022c22; border: none; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .action-btn:hover { background: #34d399; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(16,185,129,0.35); }
  .outline-btn { padding: 10px 20px; background: transparent; color: #71717a; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; text-decoration: none; display: inline-block; }
  .outline-btn:hover { color: #e4e4e7; border-color: rgba(255,255,255,0.2); }
  .activity-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .activity-item:last-child { border-bottom: none; }
  .avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
  .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 100px; font-size: 13px; font-weight: 600; }
  .toggle-btn { padding: 6px 14px; border-radius: 6px; border: none; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .toggle-btn.paid { background: rgba(16,185,129,0.12); color: #10b981; border: 1px solid rgba(16,185,129,0.25); }
  .toggle-btn.paid:hover { background: rgba(16,185,129,0.2); }
  .toggle-btn.partial { background: rgba(96,165,250,0.12); color: #60a5fa; border: 1px solid rgba(96,165,250,0.25); }
  .toggle-btn.partial:hover { background: rgba(96,165,250,0.2); }
  .toggle-btn.unpaid { background: rgba(251,191,36,0.12); color: #fbbf24; border: 1px solid rgba(251,191,36,0.25); }
  .toggle-btn.unpaid:hover { background: rgba(251,191,36,0.2); }
  .close-btn { padding: 10px 20px; background: rgba(255,255,255,0.05); color: #a1a1aa; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .close-btn:hover { background: rgba(255,255,255,0.08); color: #e4e4e7; }
  .close-btn.done { background: rgba(16,185,129,0.1); color: #10b981; border-color: rgba(16,185,129,0.2); }
  
  /* Modal Styles */
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; animation: fadeIn 0.2s ease; }
  .modal-content { background: #0c0c0e; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; width: 100%; max-width: 400px; animation: slideUp 0.3s ease; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
  .modal-input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #f4f4f5; font-size: 16px; outline: none; margin: 16px 0; font-family: 'Inter', sans-serif; }
  .modal-input:focus { border-color: #10b981; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 768px) {
    .md-nav { padding: 14px 16px !important; }
    .md-nav-links { gap: 12px !important; }
    .md-page { padding: 16px !important; padding-bottom: 80px !important; }
    .md-header { flex-direction: column !important; align-items: stretch !important; gap: 16px !important; margin-bottom: 24px !important; }
    .md-header h1 { font-size: 24px !important; }
    .md-header-actions { justify-content: stretch; width: 100%; }
    .md-header-actions .outline-btn, .md-header-actions .action-btn { flex: 1; justify-content: center; text-align: center; }
    .md-main-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
    .md-summary-cards { grid-template-columns: 1fr 1fr !important; }
    .md-card { padding: 16px !important; }
    
    .player-row { flex-direction: column; align-items: flex-start; gap: 12px; }
    .pr-left { width: 100%; }
    .pr-right { width: 100%; justify-content: space-between; }
    
    .md-player-tabs { overflow-x: auto; white-space: nowrap; padding-bottom: 4px; }
    .md-player-tabs button { flex-shrink: 0; }
    
    .modal-content { max-width: 90vw !important; margin: 16px; padding: 20px !important; }
  }
`;


const COLORS = ['#10b981','#60a5fa','#c084fc','#f472b6','#fb923c','#34d399','#fbbf24','#818cf8','#f87171','#38bdf8'];
const BG = ['rgba(16,185,129,0.2)','rgba(96,165,250,0.2)','rgba(192,132,252,0.2)','rgba(244,114,182,0.2)','rgba(251,146,60,0.2)','rgba(52,211,153,0.2)','rgba(251,191,36,0.2)','rgba(129,140,248,0.2)','rgba(248,113,113,0.2)','rgba(56,189,248,0.2)'];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function MatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const { user } = useAuth();
  const [tab, setTab] = useState('all');
  const [reminded, setReminded] = useState(false);
  const [closingMatch, setClosingMatch] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayerIdx, setEditingPlayerIdx] = useState(null);
  const [paymentInput, setPaymentInput] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    const fetchMatch = async () => {
      try {
        const snap = await getDoc(doc(db, 'matches', id));
        if (snap.exists()) {
          const data = snap.data();
          if (data.createdBy !== user.uid) {
            setUnauthorized(true);
          } else {
            setMatch({ id: snap.id, ...data });
          }
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Error fetching match:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id, user]);

  const openPaymentModal = (idx, currentPaid, totalDue) => {
    if (match.status === 'done') return;
    setEditingPlayerIdx(idx);
    setPaymentInput(currentPaid.toString());
    setModalOpen(true);
  };

  const handleSavePayment = async () => {
    if (editingPlayerIdx === null || !match) return;
    
    let newAmount = parseFloat(paymentInput);
    if (isNaN(newAmount) || newAmount < 0) newAmount = 0;
    const playerAmount = match.players[editingPlayerIdx].amount || 0;
    if (newAmount > playerAmount) newAmount = playerAmount;
    
    setSavingPayment(true);
    
    const updatedPlayers = match.players.map((p, i) =>
      i === editingPlayerIdx ? { ...p, amountPaid: newAmount, paid: newAmount >= p.amount } : p
    );
    
    try {
      await updateDoc(doc(db, 'matches', id), { players: updatedPlayers });
      setMatch(prev => ({ ...prev, players: updatedPlayers }));
      setModalOpen(false);
    } catch (err) {
      console.error('Error updating player:', err);
    } finally {
      setSavingPayment(false);
    }
  };

  const closeMatch = async () => {
    if (!match) return;
    setClosingMatch(true);
    try {
      const newStatus = match.status === 'done' ? 'active' : 'done';
      await updateDoc(doc(db, 'matches', id), { status: newStatus });
      setMatch(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Error closing match:', err);
    } finally {
      setClosingMatch(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#09090b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(16,185,129,0.2)', borderTop: '3px solid #10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#71717a', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>Loading match...</span>
      </div>
    );
  }

  if (notFound || unauthorized) {
    return (
      <div style={{ background: '#09090b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', fontFamily: 'Inter, sans-serif', color: '#e4e4e7' }}>
        <div style={{ fontSize: '48px' }}>{unauthorized ? '🔒' : '🏟️'}</div>
        <div style={{ fontSize: '20px', fontWeight: 700 }}>{unauthorized ? 'Access Denied' : 'Match not found'}</div>
        <div style={{ color: '#71717a', fontSize: '14px' }}>
          {unauthorized ? 'You do not have permission to view or manage this match.' : "This match may have been deleted or doesn't exist."}
        </div>
        <Link to="/dashboard" style={{ marginTop: '8px', padding: '10px 24px', background: '#10b981', color: '#022c22', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>← Back to Dashboard</Link>
      </div>
    );
  }

  const players = match.players || [];
  
  // Calculate paid amounts with backward compatibility
  const playersWithStatus = players.map(p => {
    const amountPaid = p.amountPaid !== undefined ? p.amountPaid : (p.paid ? (p.amount || 0) : 0);
    const amount = p.amount || 0;
    
    let status = 'unpaid';
    if (amountPaid >= amount && amount > 0) status = 'paid';
    else if (amountPaid > 0) status = 'partial';
    
    return { ...p, amountPaid, amount, status };
  });

  const fullPaidPlayers = playersWithStatus.filter(p => p.status === 'paid');
  const partialPlayers = playersWithStatus.filter(p => p.status === 'partial');
  const unpaidPlayers = playersWithStatus.filter(p => p.status === 'unpaid');
  
  const total = match.totalCost || 0;
  const collected = playersWithStatus.reduce((a, p) => a + p.amountPaid, 0);
  
  let displayed = playersWithStatus;
  if (tab === 'paid') displayed = fullPaidPlayers;
  if (tab === 'partial') displayed = partialPlayers;
  if (tab === 'pending') displayed = unpaidPlayers;

  const paymentBreakdown = ['UPI', 'Cash'].map(method => {
    const amt = playersWithStatus.filter(p => p.method === method).reduce((a, p) => a + p.amountPaid, 0);
    const count = playersWithStatus.filter(p => p.method === method && p.amountPaid > 0).length;
    return {
      method,
      icon: method === 'UPI' ? '📲' : '💵',
      amount: amt,
      count
    };
  });

  return (
    <div style={{ background: '#09090b', color: '#e4e4e7', fontFamily: "'Inter', sans-serif", minHeight: '100vh' }}>
      <style>{styles}</style>

      {/* Nav */}
      <nav className="md-nav" style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link to="/" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 800, color: '#10b981', textDecoration: 'none' }}>⚽ ContriPlayy</Link>
        <div className="md-nav-links" style={{ display: 'flex', gap: '12px' }}>
          <Link to="/dashboard" className="outline-btn">← Dashboard</Link>
          <button className="action-btn" onClick={() => setReminded(true)}>{reminded ? '✓ Sent!' : '🔔 Send Reminders'}</button>
        </div>
      </nav>

      <div className="md-page" style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div className="md-header" style={{ marginBottom: '32px', animation: 'fadeInUp 0.5s ease forwards' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Match #{id.slice(-6).toUpperCase()}</div>
            <span className="status-badge" style={{
              background: match.status === 'done' ? 'rgba(113,113,122,0.1)' : 'rgba(16,185,129,0.1)',
              border: match.status === 'done' ? '1px solid rgba(113,113,122,0.25)' : '1px solid rgba(16,185,129,0.25)',
              color: match.status === 'done' ? '#71717a' : '#10b981',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: match.status === 'done' ? '#71717a' : '#10b981', display: 'inline-block', animation: match.status !== 'done' ? 'pulse 2s infinite' : 'none' }} />
              {match.status === 'done' ? 'Closed' : 'Active'}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '36px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '8px' }}>
            {match.sportEmoji || '⚽'} {match.venue} — {match.sport} Booking
          </h1>
          <p style={{ color: '#71717a', fontSize: '15px' }}>
            {formatDate(match.date)}{match.time ? ' - ' + match.time : ''}{' \u2022 '}{players.length} Players
          </p>
        </div>

        <div className="md-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
          {/* Left */}
          <div>
            {/* Summary Cards */}
            <div className="md-summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
              {[
                { label: 'Total Cost', value: '₹' + total.toLocaleString('en-IN'), icon: '💰', sub: players.length > 0 ? '₹' + (total / players.length).toFixed(0) + ' per head' : '—', color: '#f4f4f5' },
                { label: 'Collected', value: '₹' + Math.round(collected).toLocaleString('en-IN'), icon: '✅', sub: fullPaidPlayers.length + ' full, ' + partialPlayers.length + ' partial', color: '#10b981' },
                { label: 'Remaining', value: '₹' + Math.round(total - collected).toLocaleString('en-IN'), icon: '⏳', sub: unpaidPlayers.length + ' completely unpaid', color: '#fbbf24' },
              ].map((s, i) => (
                <div key={i} className="md-card" style={{ animationDelay: (i * 0.1) + 's' }}>
                  <div style={{ fontSize: '24px', marginBottom: '10px' }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>{s.label}</div>
                  <div style={{ fontSize: '12px', color: '#52525b', marginTop: '2px' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="md-card" style={{ marginBottom: '24px', animationDelay: '0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Collection Progress</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>{total > 0 ? Math.round((collected / total) * 100) : 0}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: (total > 0 ? (collected / total) * 100 : 0) + '%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#52525b' }}>
                <span>₹{Math.round(collected).toLocaleString('en-IN')} collected</span>
                <span>₹{total.toLocaleString('en-IN')} total</span>
              </div>
            </div>

            {/* Players List */}
            <div className="md-card" style={{ animationDelay: '0.4s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700 }}>Players</h3>
                <div className="md-player-tabs" style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '3px', gap: '2px' }}>
                  {[['all', 'All'], ['paid', 'Paid (' + fullPaidPlayers.length + ')'], ['partial', 'Partial (' + partialPlayers.length + ')'], ['pending', 'Pending (' + unpaidPlayers.length + ')']].map(([val, label]) => (
                    <button key={val} onClick={() => setTab(val)} style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', background: tab === val ? '#10b981' : 'transparent', color: tab === val ? '#022c22' : '#71717a', fontWeight: 600, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {displayed.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: '#52525b', fontSize: '14px' }}>No players in this view</div>
              )}

              {displayed.map((p) => {
                const i = players.indexOf(match.players.find(mp => mp.name === p.name));
                const colorIdx = i % COLORS.length;
                
                return (
                  <div key={i} className="player-row">
                    <div className="pr-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="avatar" style={{ background: BG[colorIdx], color: COLORS[colorIdx] }}>{p.name[0]?.toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: '#52525b', marginTop: '2px' }}>{p.method}</div>
                      </div>
                    </div>
                    <div className="pr-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: p.status === 'paid' ? '#10b981' : p.status === 'partial' ? '#60a5fa' : '#fbbf24' }}>
                          ₹{p.amountPaid.toFixed(0)} <span style={{ color: '#52525b', fontSize: '12px', fontWeight: 500 }}>/ ₹{p.amount.toFixed(0)}</span>
                        </div>
                      </div>
                      <button
                        className={'toggle-btn ' + p.status}
                        onClick={() => openPaymentModal(i, p.amountPaid, p.amount)}
                        disabled={match.status === 'done'}
                        title={match.status === 'done' ? 'Match is closed' : 'Update payment amount'}
                      >
                        {p.status === 'paid' ? '✓ Paid' : p.status === 'partial' ? '⏱ Partial' : '⏳ Unpaid'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Close / Reopen match */}
              {match.status !== 'done' && unpaidPlayers.length === 0 && partialPlayers.length === 0 && players.length > 0 && (
                <div className="md-header-actions" style={{ marginTop: '16px', padding: '14px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>🎉 All players have paid in full!</div>
                    <div style={{ fontSize: '12px', color: '#52525b', marginTop: '2px' }}>Mark this match as completed.</div>
                  </div>
                  <button className="action-btn" onClick={closeMatch} disabled={closingMatch}>
                    {closingMatch ? '...' : '✓ Close Match'}
                  </button>
                </div>
              )}
              {match.status === 'done' && (
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="close-btn done" onClick={closeMatch} disabled={closingMatch}>
                    {closingMatch ? '...' : '↩ Reopen Match'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div>
            {/* Payment breakdown */}
            <div className="md-card" style={{ marginBottom: '16px', animationDelay: '0.2s' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Payment Breakdown</h3>
              {paymentBreakdown.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < paymentBreakdown.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{m.icon}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{m.method}</div>
                      <div style={{ fontSize: '11px', color: '#52525b' }}>{m.count} payments</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '16px', color: '#f4f4f5', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>₹{Math.round(m.amount)}</span>
                </div>
              ))}
            </div>

            {/* Match Info */}
            <div className="md-card" style={{ animationDelay: '0.3s' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Match Info</h3>
              {[
                { label: 'Sport', value: (match.sportEmoji || '⚽') + ' ' + match.sport },
                { label: 'Venue', value: match.venue },
                { label: 'Date', value: formatDate(match.date) },
                { label: 'Time', value: match.time || '—' },
                { label: 'Organized by', value: match.createdByName || '—' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.05)' : 'none', gap: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{item.label}</div>
                  <div style={{ fontSize: '13px', fontWeight: 500, textAlign: 'right', color: '#a1a1aa' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      {modalOpen && editingPlayerIdx !== null && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Update Payment</h3>
            <p style={{ color: '#71717a', fontSize: '13px', marginBottom: '16px' }}>
              Enter the amount paid by <strong>{players[editingPlayerIdx].name}</strong>. Total due is ₹{players[editingPlayerIdx].amount.toFixed(0)}.
            </p>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button 
                onClick={() => setPaymentInput(players[editingPlayerIdx].amount.toString())}
                style={{ flex: 1, padding: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', transition: 'background 0.2s' }}
              >
                Full (₹{players[editingPlayerIdx].amount.toFixed(0)})
              </button>
              <button 
                onClick={() => setPaymentInput('0')}
                style={{ flex: 1, padding: '8px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', transition: 'background 0.2s' }}
              >
                Reset (₹0)
              </button>
            </div>
            
            <input 
              type="number" 
              className="modal-input" 
              value={paymentInput}
              onChange={(e) => setPaymentInput(e.target.value)}
              placeholder="Enter amount..."
              autoFocus
            />
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button 
                className="outline-btn" 
                style={{ flex: 1, textAlign: 'center' }} 
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="action-btn" 
                style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }} 
                onClick={handleSavePayment}
                disabled={savingPayment}
              >
                {savingPayment ? 'Saving...' : 'Save Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
