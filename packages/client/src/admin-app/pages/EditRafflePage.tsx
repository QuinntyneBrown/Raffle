import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Theme, AnimationStyle } from '@raffle/shared';
import { updateRaffleSchema } from '@raffle/shared';
import * as api from '@/lib/api';
import { Button } from '@/shared-ui/Button';
import { Input } from '@/shared-ui/Input';
import { Textarea } from '@/shared-ui/Textarea';
import { Spinner } from '@/shared-ui/Spinner';
import { useToast } from '@/shared-ui/ToastContext';

const themes: { key: Theme; label: string; gradient: string }[] = [
  { key: 'cosmic', label: 'Cosmic', gradient: 'from-purple-600 to-purple-900' },
  { key: 'festive', label: 'Festive', gradient: 'from-red-600 to-yellow-600' },
  { key: 'corporate', label: 'Corporate', gradient: 'from-blue-600 to-blue-900' },
];

const animations: { key: AnimationStyle; label: string; description: string }[] = [
  { key: 'slot_machine', label: 'Slot Machine', description: 'Names scroll vertically like a slot reel' },
  { key: 'wheel_spin', label: 'Wheel Spin', description: 'Names rotate like a prize wheel' },
  { key: 'card_flip', label: 'Card Flip', description: 'Names flip like playing cards' },
];

export function EditRafflePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [participantsText, setParticipantsText] = useState('');
  const [theme, setTheme] = useState<Theme>('cosmic');
  const [animationStyle, setAnimationStyle] = useState<AnimationStyle>('slot_machine');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasDraws, setHasDraws] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const raffle = await api.getRaffle(id);
        setName(raffle.name);
        setHeading(raffle.heading);
        setSubheading(raffle.subheading || '');
        setTheme(raffle.theme as Theme);
        setAnimationStyle(raffle.animationStyle as AnimationStyle);

        const drawn = raffle.participants.some((p) => p.isDrawn);
        setHasDraws(drawn);

        setParticipantsText(
          raffle.participants.map((p) => p.name).join('\n'),
        );
      } catch {
        addToast('Failed to load raffle', 'error');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate, addToast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const participants = participantsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const input: Record<string, unknown> = {
      name,
      heading,
      subheading: subheading || null,
      theme,
      animationStyle,
    };

    // Only include participants if no draws have occurred
    if (!hasDraws) {
      input.participants = participants;
    }

    // Client-side validation
    const result = updateRaffleSchema.safeParse(input);
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
      setSaving(true);
      await api.updateRaffle(id!, input);
      addToast('Raffle updated successfully!', 'success');
      navigate(`/admin/raffles/${id}`);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Failed to update raffle',
        'error',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--fg-primary)] mb-8">Edit Raffle</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="space-y-5">
            <Input
              label="Raffle Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Holiday Party 2026"
              error={errors['name']}
            />

            <Input
              label="Heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. WHO WILL WIN?"
              error={errors['heading']}
            />

            <Input
              label="Subheading (optional)"
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              placeholder="e.g. Click the button to find out!"
              error={errors['subheading']}
            />

            <div>
              <Textarea
                label="Participants (one per line)"
                value={participantsText}
                onChange={(e) => setParticipantsText(e.target.value)}
                placeholder={"Alice Johnson\nBob Smith\nCarol Williams\n..."}
                rows={8}
                error={errors['participants']}
                disabled={hasDraws}
              />
              {hasDraws && (
                <p className="mt-2 text-sm text-[var(--warning)] flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Participants cannot be edited after draws have been made. Reset draws first.
                </p>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-8">
            {/* Theme picker */}
            <div>
              <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-3">
                Theme
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {themes.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTheme(t.key)}
                    className={`
                      rounded-xl p-4 border-2 transition-all duration-200
                      ${
                        theme === t.key
                          ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30'
                          : 'border-[var(--border)] hover:border-[var(--fg-muted)]/50'
                      }
                    `}
                  >
                    <div
                      className={`h-16 rounded-lg bg-gradient-to-br ${t.gradient} mb-3`}
                    />
                    <p className="text-sm font-medium text-[var(--fg-primary)]">{t.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Animation picker */}
            <div>
              <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-3">
                Animation Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {animations.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => setAnimationStyle(a.key)}
                    className={`
                      rounded-xl p-4 border-2 transition-all duration-200 text-left
                      ${
                        animationStyle === a.key
                          ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30'
                          : 'border-[var(--border)] hover:border-[var(--fg-muted)]/50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-center h-12 mb-3 text-[var(--fg-muted)]">
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
                    <p className="text-sm font-medium text-[var(--fg-primary)]">{a.label}</p>
                    <p className="text-xs text-[var(--fg-muted)] mt-1">{a.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[var(--border)]">
          <Button variant="secondary" type="button" onClick={() => navigate(`/admin/raffles/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
