import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navItems.js';

export default function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {NAV_ITEMS.map(({ short, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] transition-colors ${
              isActive ? 'font-medium text-accent' : 'text-fg-subtle hover:text-fg'
            }`
          }
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
          {short}
        </NavLink>
      ))}
    </nav>
  );
}