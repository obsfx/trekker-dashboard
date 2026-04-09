'use client';

import { NavLink } from 'react-router-dom';

import { APP_ROUTES } from '@/app-routes';
import { cn } from '@/lib/utils';

function getNavLinkClassName(isActive: boolean): string {
  if (isActive) {
    return cn(
      'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
      'bg-background text-foreground shadow-sm'
    );
  }

  return cn(
    'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    'text-muted-foreground hover:bg-background/50 hover:text-foreground'
  );
}

export function AppNavigation() {
  return (
    <nav className="flex items-center gap-1">
      {APP_ROUTES.map(({ path, label, Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) => getNavLinkClassName(isActive)}
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
