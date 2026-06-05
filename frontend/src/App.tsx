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
    {/* Таблица лидеров доступна всем авторизованным по отдельному пути */}
    <Route path="/leaderboard" element={<OrganizerBoard />} />

    {/* Основные маршруты по ролям */}
    {user?.role.toUpperCase() === 'PARTICIPANT' && (
      <Route path="/*" element={<ParticipantDashboard />} />
    )}
    {user?.role.toUpperCase() === 'JURY' && (
      <Route path="/*" element={<JuryPanel />} />
    )}
    {user?.role.toUpperCase() === 'ORGANIZER' && (
      <Route path="/*" element={<OrganizerBoard />} />
    )}
    <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
