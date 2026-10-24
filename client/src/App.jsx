import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { TimerProvider } from './context/TimerContext.jsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Schedule = lazy(() => import('./pages/Schedule.jsx'));
const Calendar = lazy(() => import('./pages/Calendar.jsx'));
const WorkHours = lazy(() => import('./pages/WorkHours.jsx'));
const Reports = lazy(() => import('./pages/Reports.jsx'));

function PageFallback() {
  return <div className="py-24 text-center text-sm text-fg-subtle">Loading…</div>;
}

// One protected shell for every signed-in page. AppLayout stays mounted
// while the user navigates, so the sidebar and timer UI don't remount.
function ProtectedShell() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TimerProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedShell />}>
              <Route index element={<Dashboard />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="timer" element={<WorkHours />} />
              <Route path="reports" element={<Reports />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TimerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}