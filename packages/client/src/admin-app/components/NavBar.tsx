import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/shared-ui/Button';

export function NavBar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore logout errors
    }
  };

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-between px-8">
      {/* Logo */}
      <h1 className="font-anton text-xl text-[var(--accent)] tracking-[3px]">
        RAFFLE
      </h1>

      {/* User info + logout */}
      <div className="flex items-center gap-4">
        {user && (
          <span className="hidden sm:inline text-[13px] text-[var(--fg-secondary)]">
            {user.email}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
