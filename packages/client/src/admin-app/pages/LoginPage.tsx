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
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg-primary)]">
      {/* Brand panel */}
      <div className="flex items-center justify-center bg-gradient-to-b from-[#7C3AED] via-[#A855F7] to-[#6D28D9] p-8 lg:p-12 lg:w-1/2 lg:min-h-screen relative overflow-hidden">
        <div className="max-w-md text-center">
          <h1 className="font-anton text-4xl lg:text-[64px] text-white mb-2 lg:mb-4 tracking-[6px]">
            RAFFLE
          </h1>
          <p className="font-geist text-sm lg:text-lg text-white/80">
            Admin Portal
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-[360px]">
          <div className="mb-6">
            <h2 className="font-anton text-[32px] text-[var(--fg-primary)] tracking-[2px]">
              Welcome Back
            </h2>
            <p className="font-geist text-sm text-[var(--fg-secondary)] mt-2">
              Sign in to manage your raffles
            </p>
          </div>

          {error && (
            <div className="mb-6 py-3 px-4 rounded-lg bg-[var(--error-light)] text-[var(--error)] text-[13px] flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-[var(--fg-muted)]">
            <a
              href="#"
              className="font-geist text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
            >
              Forgot your password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
