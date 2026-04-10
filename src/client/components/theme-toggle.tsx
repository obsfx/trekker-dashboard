import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
      return;
    }

    setTheme('dark');
  };

  let icon = <Sun className="h-4 w-4" />;
  if (resolvedTheme === 'dark') {
    icon = <Moon className="h-4 w-4" />;
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {icon}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
