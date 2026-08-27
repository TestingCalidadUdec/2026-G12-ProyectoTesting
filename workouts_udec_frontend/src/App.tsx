import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ActiveWorkoutProvider } from './context/ActiveWorkoutContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import WorkoutPage from './pages/WorkoutPage';
import WorkoutsPage from './pages/WorkoutsPage';
import HistoryPage from './pages/HistoryPage';

function App() {
  return (
    <AuthProvider>
      <ActiveWorkoutProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout"
              element={
                <ProtectedRoute>
                  <WorkoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workouts"
              element={
                <ProtectedRoute>
                  <WorkoutsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ActiveWorkoutProvider>
    </AuthProvider>
  );
}

export default App;
