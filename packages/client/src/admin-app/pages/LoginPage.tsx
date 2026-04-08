import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/shared-ui/Button';
import { Input } from '@/shared-ui/Input';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      {/* Brand panel - visible on lg+ */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-b from-purple-600 via-purple-500 to-purple-800 p-12">
        <div className="max-w-md text-center">
          <h1 className="font-anton text-6xl text-white mb-4 tracking-wide">
            RAFFLE
          </h1>
          <p className="text-lg text-purple-200">
            Admin Portal
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile brand banner */}
          <div className="lg:hidden text-center mb-8 -mx-6 sm:-mx-12 -mt-6 sm:-mt-12 p-8 bg-gradient-to-b from-purple-600 via-purple-500 to-purple-800">
            <h1 className="font-anton text-4xl text-white tracking-wide">
              RAFFLE
            </h1>
            <p className="text-sm text-purple-200 mt-1">Admin Portal</p>
          </div>

          <div className="mb-8">
            <h2 className="font-anton text-3xl text-[var(--fg-primary)] tracking-wide">
              Welcome Back
            </h2>
            <p className="text-sm text-[var(--fg-muted)] mt-1">
              Sign in to manage your raffles
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-400 text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--fg-muted)]">
            <a
              href="#"
              className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
            >
              Forgot your password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
