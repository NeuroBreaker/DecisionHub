import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ParticipantDashboard from './pages/Participant/Dashboard';
import JuryPanel from './pages/Jury/JuryPanel';
import OrganizerBoard from './pages/Organizer/Leaderboard';
import Login from './pages/Auth/Login';

function App() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Login />; // Компонент авторизации

  return (
    <BrowserRouter>
      <Routes>
        {/* Роутинг на основе ролей */}
        {user?.role === 'PARTICIPANT' && (
          <Route path="/*" element={<ParticipantDashboard />} />
        )}
        {user?.role === 'JURY' && (
          <Route path="/*" element={<JuryPanel />} />
        )}
        {user?.role === 'ORGANIZER' && (
          <Route path="/*" element={<OrganizerBoard />} />
        )}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
