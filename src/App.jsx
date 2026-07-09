import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/SignIn';
import MatchDetails from './pages/MatchDetails';
import CreateMatch from './pages/CreateMatch';
import MatchHistory from './pages/MatchHistory';
import MySquads from './pages/MySquads';
import Analytics from './pages/Analytics';
import Expenses from './pages/Expenses';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/match-details/:id" element={<ProtectedRoute><MatchDetails /></ProtectedRoute>} />
          <Route path="/create-match" element={<ProtectedRoute><CreateMatch /></ProtectedRoute>} />
          <Route path="/match-history" element={<ProtectedRoute><MatchHistory /></ProtectedRoute>} />
          <Route path="/my-squads" element={<ProtectedRoute><MySquads /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
