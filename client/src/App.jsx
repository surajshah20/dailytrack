import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Schedule from './pages/Schedule.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Schedule />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Root redirect to /schedule */}
          <Route path="/" element={<Navigate to="/schedule" replace />} />
          <Route path="*" element={<Navigate to="/schedule" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}