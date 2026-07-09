import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = `
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ background: '#09090b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <style>{styles}</style>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(16,185,129,0.2)', borderTop: '3px solid #10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#71717a', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}
