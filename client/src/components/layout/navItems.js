import { LayoutDashboard, CalendarDays, Calendar, Clock, BarChart3 } from 'lucide-react';

export const NAV_ITEMS = [
  { name: 'Dashboard', short: 'Home', path: '/', icon: LayoutDashboard },
  { name: 'Schedule', short: 'Schedule', path: '/schedule', icon: CalendarDays },
  { name: 'Work hours', short: 'Timer', path: '/timer', icon: Clock },
  { name: 'Calendar', short: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Reports', short: 'Reports', path: '/reports', icon: BarChart3 },
];