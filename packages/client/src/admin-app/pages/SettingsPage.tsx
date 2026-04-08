import { useAuth } from '@/lib/auth-context';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="font-anton text-[28px] text-[var(--fg-primary)] tracking-[1px] mb-8">
        Settings
      </h1>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <h2 className="text-lg font-semibold text-[var(--fg-primary)] mb-4">Account</h2>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-[var(--fg-muted)]">Email</span>
            <p className="text-[var(--fg-primary)]">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
