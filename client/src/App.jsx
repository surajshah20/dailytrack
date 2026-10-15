import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { Activity, LogOut, CheckCircle2 } from 'lucide-react';

// Temporary landing component to verify full authentication lifecycle
function DashboardPlaceholder() {
  const { user, settings, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">DailyTrack</h1>
              <p className="text-xs text-gray-400">Phase 1 Complete</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-surface-elevated hover:bg-border transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        <div className="bg-surface-elevated border border-border rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span>Authenticated Session Active</span>
          </div>

          <div className="space-y-2 text-xs font-mono text-gray-300">
            <div><span className="text-gray-500">User ID:</span> {user?.id}</div>
            <div><span className="text-gray-500">Name:</span> {user?.display_name}</div>
            <div><span className="text-gray-500">Email:</span> {user?.email}</div>
            <div><span className="text-gray-500">Timezone:</span> {user?.timezone}</div>
            <div><span className="text-gray-500">Daily Target:</span> {settings?.daily_target_minutes || 480} mins</div>
          </div>
        </div>

        <div className="text-xs text-gray-400 text-center">
          Ready for <span className="text-primary-400 font-semibold">Phase 2: Core Productivity (Tasks, Categories & Daily Schedule)</span>.
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPlaceholder />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}