import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminListPage from './pages/AdminListPage';
import AdminEditPage from './pages/AdminEditPage';
import GameSetupPage from './pages/GameSetupPage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminListPage />} />
      <Route path="/admin/:boardId" element={<AdminEditPage />} />
      <Route path="/setup/:boardId" element={<GameSetupPage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
