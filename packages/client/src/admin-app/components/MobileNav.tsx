import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignore
    }
  };

  return (
    <div className="lg:hidden">
      {/* Mobile top bar */}
      <div className="h-14 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex items-center px-4 justify-between">
        {/* Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        {/* Logo */}
        <h1 className="font-anton text-lg text-[var(--accent)] tracking-wider">
          RAFFLE
        </h1>

        {/* User icon */}
        <div className="p-2 text-[var(--fg-muted)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-14 left-0 right-0 z-50 bg-[var(--bg-secondary)] border-b border-[var(--border)] shadow-xl">
            <nav className="p-4 space-y-1">
              <NavLink
                to="/admin"
                end
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'text-[var(--fg-muted)] hover:text-[var(--fg-primary)]'}`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/admin/create"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'text-[var(--fg-muted)] hover:text-[var(--fg-primary)]'}`
                }
              >
                Create Raffle
              </NavLink>
              <NavLink
                to="/admin/settings"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'text-[var(--fg-muted)] hover:text-[var(--fg-primary)]'}`
                }
              >
                Settings
              </NavLink>
            </nav>

            <div className="p-4 border-t border-[var(--border)]">
              {user && (
                <p className="text-xs text-[var(--fg-muted)] mb-2">{user.email}</p>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
