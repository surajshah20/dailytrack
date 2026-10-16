import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  Activity, 
  CalendarDays, 
  CheckSquare, 
  Clock, 
  BarChart3, 
  FolderKanban, 
  LogOut,
  User
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Today & Schedule', path: '/schedule', icon: CalendarDays },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Work Hours', path: '/timer', icon: Clock },
  { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
  { name: 'Categories', path: '/categories', icon: FolderKanban },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400">
          <Activity className="w-5 h-5 text-primary-500" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-white block">DailyTrack</span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-500">Productivity Suite</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                    : 'text-gray-400 hover:text-white hover:bg-surface-elevated'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Card & Logout */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated border border-border/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gray-800 border border-border flex items-center justify-center text-gray-300 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.display_name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-surface transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}