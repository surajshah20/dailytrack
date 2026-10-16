import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Clock, 
  Calendar, 
  BarChart3 
} from 'lucide-react';

const MOBILE_NAV = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Schedule', path: '/schedule', icon: CalendarDays },
  { name: 'Timer', path: '/timer', icon: Clock },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-border px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {MOBILE_NAV.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-primary-400 font-semibold'
                  : 'text-gray-400 hover:text-gray-200'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}