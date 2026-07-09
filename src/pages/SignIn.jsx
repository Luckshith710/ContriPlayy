import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
  @keyframes float-delayed { 0% { transform: translateY(0px); } 50% { transform: translateY(-12px); } 100% { transform: translateY(0px); } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .si-card { padding: 48px; background: rgba(12,12,14,0.8); border: 1px solid rgba(255,255,255,0.07); border-radius: 24px; width: 100%; max-width: 440px; position: relative; z-index: 10; backdrop-filter: blur(20px); box-shadow: 0 24px 64px rgba(0,0,0,0.4); animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .si-input { width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: #f4f4f5; font-size: 15px; outline: none; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .si-input:focus { border-color: #10b981; background: rgba(255,255,255,0.05); }
  .si-btn { width: 100%; padding: 14px; background: #10b981; color: #022c22; border: none; border-radius: 12px; font-weight: 700; font-size: 16px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; gap: 8px; }
  .si-btn:hover { background: #34d399; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(16,185,129,0.3); }
  .si-btn-google { background: white; color: #18181b; }
  .si-btn-google:hover { background: #f4f4f5; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,255,255,0.15); }
  .shape-1 { position: absolute; top: 15%; left: 15%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0) 70%); border-radius: 50%; filter: blur(40px); animation: float 8s ease-in-out infinite; z-index: 1; }
  .shape-2 { position: absolute; bottom: 15%; right: 15%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(96,165,250,0.1) 0%, rgba(96,165,250,0) 70%); border-radius: 50%; filter: blur(50px); animation: float-delayed 10s ease-in-out infinite; z-index: 1; }

  @media (max-width: 768px) {
    .si-layout { padding: 20px !important; }
    .si-card { padding: 32px 24px !important; width: 92% !important; max-width: none !important; margin: 0 auto; }
  }
  .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
  .divider span { color: #52525b; font-size: 13px; white-space: nowrap; }
  .google-btn { width: 100%; padding: 13px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #e4e4e7; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; gap: 10px; }
  .google-btn:hover:not(:disabled) { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); }
  .tab { flex: 1; padding: 10px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .tab.active { background: #10b981; color: #022c22; }
  .tab.inactive { background: transparent; color: #71717a; }
  .tab.inactive:hover { color: #e4e4e7; }
  .spinner { width: 16px; height: 16px; border: 2px solid rgba(2,44,34,0.3); border-top: 2px solid #022c22; border-radius: 50%; animation: spin 0.6s linear infinite; }
  .error-banner { background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #f87171; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
`;

export default function SignIn() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputError, setInputError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const clearError = () => setError('');

  // Handle redirect result when page loads (after signInWithRedirect)
  useEffect(() => {
    setGoogleLoading(true);
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) navigate('/dashboard');
      })
      .catch((err) => {
        if (err.code !== 'auth/no-current-user') setError(getFriendlyError(err.code));
      })
      .finally(() => setGoogleLoading(false));
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      // Try popup first; fallback to redirect if popup is blocked
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        // Popup was blocked — use redirect instead
        try {
          await signInWithRedirect(auth, googleProvider);
          // Page will reload and redirect result handled in useEffect above
        } catch (redirectErr) {
          setError(getFriendlyError(redirectErr.code));
          setLoading(false);
        }
      } else {
        setError(getFriendlyError(err.code));
        setLoading(false);
      }
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setInputError('Please fill in all fields.');
      return;
    }
    if (mode === 'signup' && !name) {
      setInputError('Please enter your name.');
      return;
    }
    setLoading(true);
    setError('');
    setInputError('');
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getFriendlyError = (code) => {
    const map = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'This email is already registered. Try signing in.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled. Try again.',
      'auth/popup-blocked': 'Popup blocked by browser. Redirecting instead...',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/invalid-credential': 'Invalid credentials. Check your email and password.',
      'auth/network-request-failed': 'Network error. Check your connection.',
      'auth/operation-not-allowed': '⚠️ Google sign-in is not enabled in Firebase Console. Go to Firebase → Authentication → Sign-in methods → Enable Google.',
      'auth/unauthorized-domain': '⚠️ This domain is not authorized. Add "localhost" to Firebase → Authentication → Settings → Authorized Domains.',
      'auth/internal-error': 'Firebase internal error. Make sure Google sign-in is enabled in Firebase Console.',
    };
    return map[code] || `Error: ${code || 'Something went wrong. Please try again.'}`;
  };

  return (
    <div className="si-layout" style={{ background: '#09090b', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <style>{styles}</style>

      {/* BG effects */}
      <div className="shape-1" />
      <div className="shape-2" />

      {/* Logo */}
      <Link to="/" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '22px', fontWeight: 800, color: '#10b981', textDecoration: 'none', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        ⚽ ContriPlayy
      </Link>

      <div className="si-card">
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px', textAlign: 'center' }}>
          {mode === 'signin' ? 'Welcome back 👋' : 'Join the squad 🚀'}
        </h1>
        <p style={{ color: '#71717a', fontSize: '14px', textAlign: 'center', marginBottom: '28px' }}>
          {mode === 'signin' ? 'Sign in to your ContriPlayy account' : 'Create your account and start splitting'}
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px', marginBottom: '24px', gap: '4px' }}>
          <button className={`tab ${mode === 'signin' ? 'active' : 'inactive'}`} onClick={() => { setMode('signin'); clearError(); }}>Sign In</button>
          <button className={`tab ${mode === 'signup' ? 'active' : 'inactive'}`} onClick={() => { setMode('signup'); clearError(); }}>Sign Up</button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Google */}
        <button className="google-btn" onClick={handleGoogleSignIn} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="divider"><span>or continue with email</span></div>

        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#a1a1aa', display: 'block', marginBottom: '6px' }}>Full Name</label>
              <input
                className={`si-input ${inputError && !name ? 'error' : ''}`}
                type="text"
                placeholder="Rahul Sharma"
                value={name}
                onChange={e => { setName(e.target.value); setInputError(''); }}
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#a1a1aa', display: 'block', marginBottom: '6px' }}>Email</label>
            <input
              className={`si-input ${inputError && !email ? 'error' : ''}`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setInputError(''); }}
              autoComplete="email"
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#a1a1aa' }}>Password</label>
              {mode === 'signin' && <a href="#" style={{ fontSize: '12px', color: '#10b981', textDecoration: 'none' }}>Forgot password?</a>}
            </div>
            <input
              className={`si-input ${inputError && !password ? 'error' : ''}`}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setInputError(''); }}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
            {mode === 'signup' && <div style={{ fontSize: '11px', color: '#52525b', marginTop: '5px' }}>Minimum 6 characters</div>}
          </div>

          {inputError && <div style={{ fontSize: '13px', color: '#f87171' }}>⚠️ {inputError}</div>}

          <button type="submit" className="si-btn" disabled={loading} style={{ marginTop: '4px' }}>
            {loading ? <><div className="spinner" /> Processing...</> : (mode === 'signin' ? 'Sign In →' : 'Create Account →')}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#71717a', marginTop: '24px' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); clearError(); }}
            style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', fontFamily: 'Inter, sans-serif' }}
          >
            {mode === 'signin' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>

      <p style={{ marginTop: '24px', fontSize: '12px', color: '#3f3f46', textAlign: 'center', maxWidth: '320px' }}>
        By continuing, you agree to our <a href="#" style={{ color: '#52525b', textDecoration: 'underline' }}>Terms</a> and <a href="#" style={{ color: '#52525b', textDecoration: 'underline' }}>Privacy Policy</a>.
      </p>
    </div>
  );
}
