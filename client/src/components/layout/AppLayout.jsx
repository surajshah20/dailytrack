import Sidebar from './Sidebar.jsx';
import BottomNav from './BottomNav.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Activity, LogOut } from 'lucide-react';

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-gray-100">
      {/* Mobile Top Header */}
      <header className="md:hidden h-14 bg-surface border-b border-border flex items-center justify-between px-4 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
            <Activity className="w-4 h-4 text-primary-500" />
          </div>
          <span className="font-bold text-sm text-white tracking-tight">DailyTrack</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-300 font-medium">{user?.display_name}</span>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 bg-surface-elevated transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* pb-24 ensures mobile content is never hidden behind the bottom navigation bar */}
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}