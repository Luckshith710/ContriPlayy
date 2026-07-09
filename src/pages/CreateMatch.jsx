import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #09090b; }
  ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 3px; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .cm-input { width: 100%; padding: 13px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #f4f4f5; font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; font-family: 'Inter', sans-serif; }
  .cm-input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
  .cm-input::placeholder { color: #52525b; }
  .cm-select { width: 100%; padding: 13px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #f4f4f5; font-size: 14px; outline: none; font-family: 'Inter', sans-serif; cursor: pointer; }
  .cm-select option { background: #18181b; }
  .player-chip { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; transition: all 0.2s; }
  .player-chip:hover { border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.03); }
  .remove-btn { width: 24px; height: 24px; border-radius: 50%; background: rgba(255,59,59,0.1); border: 1px solid rgba(255,59,59,0.2); color: #f87171; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .remove-btn:hover { background: rgba(255,59,59,0.2); }
  .submit-btn { width: 100%; padding: 15px; background: #10b981; color: #022c22; font-weight: 800; font-size: 16px; border: none; border-radius: 12px; cursor: pointer; transition: all 0.3s; font-family: 'Plus Jakarta Sans', sans-serif; display: flex; align-items: center; justify-content: center; gap: 10px; }
  .submit-btn:hover:not(:disabled) { background: #34d399; transform: translateY(-2px); box-shadow: 0 10px 30px rgba(16,185,129,0.4); }
  .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
  .sport-btn { flex: 1; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: transparent; color: #71717a; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .sport-btn.selected { border-color: #10b981; background: rgba(16,185,129,0.1); color: #10b981; }
  .sport-btn:hover:not(.selected) { border-color: rgba(255,255,255,0.2); color: #e4e4e7; }
  .section-card { background: rgba(12,12,14,0.7); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 28px; margin-bottom: 20px; }
  .error-banner { background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #f87171; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .spinner { width: 18px; height: 18px; border: 2px solid rgba(2,44,34,0.4); border-top: 2px solid #022c22; border-radius: 50%; animation: spin 0.6s linear infinite; }
`;

const sports = [
  { emoji: '⚽', name: 'Football' },
  { emoji: '🏏', name: 'Cricket' },
  { emoji: '🏸', name: 'Badminton' },
  { emoji: '🏀', name: 'Basketball' },
  { emoji: '🎾', name: 'Tennis' },
  { emoji: '🏐', name: 'Volleyball' },
];

const sportEmoji = { Football: '⚽', Cricket: '🏏', Badminton: '🏸', Basketball: '🏀', Tennis: '🎾', Volleyball: '🏐' };

export default function CreateMatch() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sport, setSport] = useState('Football');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addPlayer = () => {
    if (newPlayer.trim()) {
      setPlayers([...players, { name: newPlayer.trim(), method: 'UPI', paid: false }]);
      setNewPlayer('');
    }
  };

  const removePlayer = (i) => setPlayers(players.filter((_, idx) => idx !== i));

  const perHead = players.length > 0 && totalCost
    ? (parseFloat(totalCost) / players.length).toFixed(2)
    : 0;

  const handleSubmit = async () => {
    if (!venue.trim()) { setError('Please enter a venue name.'); return; }
    if (!date) { setError('Please select a date.'); return; }
    if (!totalCost || parseFloat(totalCost) <= 0) { setError('Please enter a valid total cost.'); return; }
    if (players.length < 1) { setError('Add at least one player.'); return; }

    setLoading(true);
    setError('');

    const amountPerHead = parseFloat((parseFloat(totalCost) / players.length).toFixed(2));

    const matchData = {
      createdBy: user.uid,
      createdByName: user.displayName || user.email,
      createdAt: serverTimestamp(),
      sport,
      sportEmoji: sportEmoji[sport] || '⚽',
      venue: venue.trim(),
      date,
      time,
      totalCost: parseFloat(totalCost),
      status: 'active',
      players: players.map(p => ({ ...p, amount: amountPerHead, amountPaid: 0 })),
    };

    try {
      console.log('Attempting to save match to Firestore...');
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT: Connection to Firestore is taking too long. This usually means your Firestore Database has not been created in the Firebase Console, or your network is blocking the connection.')), 10000);
      });

      // Race addDoc against the timeout
      const docRef = await Promise.race([
        addDoc(collection(db, 'matches'), matchData),
        timeoutPromise
      ]);
      
      console.log('Match saved successfully with ID:', docRef.id);
      navigate(`/match-details/${docRef.id}`);
    } catch (err) {
      console.error('Error saving match:', err);
      setError(err.message || 'Failed to create match. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#09090b', color: '#e4e4e7', fontFamily: "'Inter', sans-serif", minHeight: '100vh' }}>
      <style>{styles}</style>

      {/* Navbar */}
      <nav style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link to="/" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 800, color: '#10b981', textDecoration: 'none' }}>⚽ ContriPlayy</Link>
        <Link to="/dashboard" style={{ color: '#71717a', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '36px', animation: 'fadeInUp 0.5s ease forwards' }}>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>Create New Match ⚡</h1>
          <p style={{ color: '#71717a', fontSize: '15px' }}>Set up your match and invite your squad</p>
        </div>

        {error && (
          <div className="error-banner">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Sport */}
        <div className="section-card" style={{ animation: 'fadeInUp 0.5s ease 0.05s both' }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>🏅 Sport</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
            {sports.map(s => (
              <button key={s.name} className={`sport-btn ${sport === s.name ? 'selected' : ''}`} onClick={() => setSport(s.name)}>
                <span style={{ fontSize: '24px' }}>{s.emoji}</span>
                <span style={{ fontSize: '11px' }}>{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Venue & Time */}
        <div className="section-card" style={{ animation: 'fadeInUp 0.5s ease 0.1s both' }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>📍 Venue & Time</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Venue Name</label>
              <input className="cm-input" type="text" placeholder="Arena X, GreenField Turf..." value={venue} onChange={e => setVenue(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Date</label>
              <input className="cm-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Time</label>
              <input className="cm-input" type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Cost */}
        <div className="section-card" style={{ animation: 'fadeInUp 0.5s ease 0.15s both' }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>💰 Cost</h3>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Total Booking Cost (₹)</label>
            <input className="cm-input" type="number" placeholder="2400" value={totalCost} onChange={e => setTotalCost(e.target.value)} />
          </div>
          {totalCost && players.length > 0 && (
            <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#71717a' }}>Per person ({players.length} players)</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>₹{perHead}</span>
            </div>
          )}
        </div>

        {/* Players */}
        <div className="section-card" style={{ animation: 'fadeInUp 0.5s ease 0.2s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              👥 Players{' '}
              <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '2px 8px', borderRadius: '100px', fontSize: '12px' }}>{players.length}</span>
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {players.map((p, i) => (
              <div key={i} className="player-chip" style={{ animation: `slideIn 0.3s ease ${i * 0.05}s both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `hsl(${i * 60 + 120}, 60%, 25%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: `hsl(${i * 60 + 120}, 70%, 70%)` }}>{p.name[0]}</div>
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>{p.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <select
                    value={p.method}
                    onChange={e => setPlayers(players.map((pp, idx) => idx === i ? { ...pp, method: e.target.value } : pp))}
                    className="cm-select"
                    style={{ width: '100px', padding: '6px 10px' }}
                  >
                    <option>UPI</option><option>Cash</option>
                  </select>
                  <button className="remove-btn" onClick={() => removePlayer(i)}>×</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              className="cm-input"
              type="text"
              placeholder="Add player name..."
              value={newPlayer}
              onChange={e => setNewPlayer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPlayer()}
              style={{ flex: 1 }}
            />
            <button onClick={addPlayer} style={{ padding: '0 20px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', color: '#10b981', fontWeight: 700, cursor: 'pointer', fontSize: '20px', transition: 'all 0.2s' }}>+</button>
          </div>
        </div>

        {/* Submit */}
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading}
          style={{ animation: 'fadeInUp 0.5s ease 0.25s both' }}
        >
          {loading ? (
            <><div className="spinner" /> Saving match...</>
          ) : (
            '🚀 Create Match & Notify Squad'
          )}
        </button>
      </div>
    </div>
  );
}
