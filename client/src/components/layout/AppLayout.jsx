import { LogOut } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import BottomNav from './BottomNav.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-fg md:flex-row">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface px-4 pt-[env(safe-area-inset-top)] md:hidden">
        <span className="text-base font-semibold tracking-tight">DailyTrack</span>
        <div className="flex items-center gap-1">
          <span className="max-w-[10rem] truncate text-sm text-fg-muted">{user?.display_name}</span>
          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            className="cursor-pointer rounded-md p-2 text-fg-muted transition-colors hover:bg-muted hover:text-fg"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <Sidebar />

      <main className="min-w-0 flex-1">
        {/* Bottom padding keeps content clear of the mobile tab bar */}
        <div className="mx-auto max-w-6xl p-4 pb-24 sm:p-6 sm:pb-24 md:p-8">{children}</div>
      </main>

      <BottomNav />
    </div>
  );
}