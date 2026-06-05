// src/App.tsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ParticipantDashboard from './pages/Participant/Dashboard';
import JuryPanel from './pages/Jury/JuryPanel';
import OrganizerBoard from './pages/Organizer/Leaderboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

function App() {
  const { user, isAuthenticated } = useAuthStore();

  // Неавторизованные пользователи видят только /login и /register
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {user?.role === 'PARTICIPANT' && (
        <Route path="/*" element={<ParticipantDashboard />} />
      )}
      {user?.role === 'JURY' && (
        <Route path="/*" element={<JuryPanel />} />
      )}
      {user?.role === 'ORGANIZER' && (
        <Route path="/*" element={<OrganizerBoard />} />
      )}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
