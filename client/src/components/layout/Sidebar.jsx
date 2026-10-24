import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { NAV_ITEMS } from './navItems.js';

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:sticky md:top-0 md:flex md:h-dvh">
      <div className="flex h-14 items-center border-b border-border px-5">
        <span className="text-base font-semibold tracking-tight text-fg">DailyTrack</span>
      </div>

      <nav aria-label="Main" className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV_ITEMS.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors ${
                isActive
                  ? 'bg-muted font-medium text-fg'
                  : 'text-fg-muted hover:bg-muted hover:text-fg'
              }`
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {name}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center justify-between gap-2 border-t border-border p-3">
        <div className="min-w-0 px-2">
          <p className="truncate text-sm font-medium text-fg">{user?.display_name}</p>
          <p className="truncate text-xs text-fg-subtle">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          aria-label="Sign out"
          title="Sign out"
          className="shrink-0 cursor-pointer rounded-md p-2 text-fg-muted transition-colors hover:bg-muted hover:text-fg"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}