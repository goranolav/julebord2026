import { Navigate, type RouteObject } from 'react-router-dom';
import RootLayout from './RootLayout';
import HomePage from './pages/HomePage';
import AdminListPage from './pages/AdminListPage';
import AdminEditPage from './pages/AdminEditPage';
import GameSetupPage from './pages/GameSetupPage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';
import AnswerSheetPage from './pages/AnswerSheetPage';

/** Route table, shared by the app (hash router) and the tests (memory router). */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/admin', element: <AdminListPage /> },
      { path: '/admin/:boardId', element: <AdminEditPage /> },
      { path: '/setup/:boardId', element: <GameSetupPage /> },
      { path: '/game', element: <GamePage /> },
      { path: '/result', element: <ResultPage /> },
      { path: '/fasit/:boardId', element: <AnswerSheetPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];
