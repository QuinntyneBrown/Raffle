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
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-[var(--accent)]/20 to-[var(--bg-secondary)] p-12">
        <div className="max-w-md text-center">
          <h1 className="font-anton text-6xl text-[var(--fg-primary)] mb-4 tracking-wide">
            RAFFLE
          </h1>
          <p className="text-xl text-[var(--fg-muted)]">
            Create, manage, and run raffles with style. Draw names with beautiful animations and effects.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-blue-500" />
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-anton text-4xl text-[var(--fg-primary)] tracking-wide">
              RAFFLE
            </h1>
            <p className="text-sm text-[var(--fg-muted)] mt-1">Admin Portal</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[var(--fg-primary)]">
              Welcome back
            </h2>
            <p className="text-sm text-[var(--fg-muted)] mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
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
