import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Theme, AnimationStyle } from '@raffle/shared';
import { createRaffleSchema } from '@raffle/shared';
import * as api from '@/lib/api';
import { Button } from '@/shared-ui/Button';
import { Input } from '@/shared-ui/Input';
import { Textarea } from '@/shared-ui/Textarea';
import { useToast } from '@/shared-ui/ToastContext';

const themes: { key: Theme; label: string; subtitle: string; gradient: string }[] = [
  { key: 'cosmic', label: 'Cosmic', subtitle: 'Purple gradients', gradient: 'from-purple-600 to-purple-900' },
  { key: 'festive', label: 'Festive', subtitle: 'Holiday warmth', gradient: 'from-red-600 to-yellow-600' },
  { key: 'corporate', label: 'Corporate', subtitle: 'Clean & modern', gradient: 'from-blue-600 to-blue-900' },
];

const animations: { key: AnimationStyle; label: string; description: string }[] = [
  { key: 'slot_machine', label: 'Slot Machine', description: 'Classic slot reel' },
  { key: 'wheel_spin', label: 'Wheel Spin', description: 'Spinning wheel' },
  { key: 'card_flip', label: 'Card Flip', description: 'Card flip reveal' },
];

export function CreateRafflePage() {
  const [name, setName] = useState('');
  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [participantsText, setParticipantsText] = useState('');
  const [theme, setTheme] = useState<Theme>('cosmic');
  const [animationStyle, setAnimationStyle] = useState<AnimationStyle>('slot_machine');
  const [presentationMode, setPresentationMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const participants = participantsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const input = {
      name,
      heading,
      subheading: subheading || null,
      theme,
      animationStyle,
      presentationMode,
      participants,
    };

    // Client-side validation
    const result = createRaffleSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);
      const raffle = await api.createRaffle(input);
      addToast('Raffle created successfully!', 'success');
      navigate(`/admin/raffles/${raffle.id}`);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Failed to create raffle',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-anton text-[28px] text-[var(--fg-primary)] tracking-[1px] mb-6">Create New Raffle</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left column */}
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-[var(--fg-primary)]">Raffle Details</h2>
            <Input
              label="Raffle Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Holiday Giveaway 2026"
              error={errors['name']}
            />

            <Input
              label="Page Heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. HOLIDAY GIVEAWAY 2026"
              error={errors['heading']}
            />

            <Input
              label="Page Subheading (Optional)"
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              placeholder="e.g. Who will be our lucky winner?"
              error={errors['subheading']}
            />

            <Textarea
              label="Participants (one per line)"
              value={participantsText}
              onChange={(e) => setParticipantsText(e.target.value)}
              placeholder={"Alice Johnson\nBob Smith\nCarol Williams\n..."}
              rows={8}
              error={errors['participants']}
            />
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-[var(--fg-primary)]">Theme & Animation</h2>
            {/* Theme picker */}
            <div>
              <label className="block text-[13px] font-medium text-[var(--fg-secondary)] mb-3">
                Visual Theme
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {themes.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTheme(t.key)}
                    className={`
                      rounded-xl overflow-hidden border transition-all duration-200 bg-[var(--bg-secondary)] text-left
                      ${
                        theme === t.key
                          ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30'
                          : 'border-[var(--border)] hover:border-[var(--fg-muted)]/50'
                      }
                    `}
                  >
                    <div
                      className={`h-20 bg-gradient-to-br ${t.gradient}`}
                    />
                    <div className="px-3 py-2.5">
                      <p className="text-[13px] font-semibold text-[var(--fg-primary)]">{t.label}</p>
                      <p className="text-[11px] text-[var(--fg-muted)]">{t.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Animation picker */}
            <div>
              <label className="block text-[13px] font-medium text-[var(--fg-secondary)] mb-3">
                Animation Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {animations.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => setAnimationStyle(a.key)}
                    className={`
                      rounded-xl overflow-hidden border transition-all duration-200 bg-[var(--bg-secondary)] text-left
                      ${
                        animationStyle === a.key
                          ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30'
                          : 'border-[var(--border)] hover:border-[var(--fg-muted)]/50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-center h-20 bg-[var(--bg-tertiary)] text-[var(--accent)]">
                      {a.key === 'slot_machine' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <line x1="8" y1="4" x2="8" y2="20" />
                          <line x1="16" y1="4" x2="16" y2="20" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                        </svg>
                      )}
                      {a.key === 'wheel_spin' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a10 10 0 0 1 0 20" />
                          <line x1="12" y1="2" x2="12" y2="22" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                        </svg>
                      )}
                      {a.key === 'card_flip' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="3" width="20" height="18" rx="2" />
                          <path d="M7 8h10" />
                          <path d="M7 12h6" />
                        </svg>
                      )}
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-[13px] font-semibold text-[var(--fg-primary)]">{a.label}</p>
                      <p className="text-[11px] text-[var(--fg-muted)]">{a.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Presentation Mode toggle */}
            <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3">
              <div>
                <p className="text-[13px] font-semibold text-[var(--fg-primary)]">Presentation Mode</p>
                <p className="text-[11px] text-[var(--fg-muted)]">Optimized for projectors — flat colors, higher contrast, larger text</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={presentationMode}
                onClick={() => setPresentationMode(!presentationMode)}
                className={`
                  relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out
                  focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50
                  ${presentationMode ? 'bg-[var(--accent)]' : 'bg-[var(--bg-tertiary)]'}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out
                    ${presentationMode ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--border)]">
          <Button variant="secondary" type="button" onClick={() => navigate('/admin')}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Raffle
          </Button>
        </div>
      </form>
    </div>
  );
}
