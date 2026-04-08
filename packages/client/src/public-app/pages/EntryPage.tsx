import React, { useEffect, useState } from 'react';
import { selfRegistrationSchema } from '@raffle/shared';
import type { ActiveRafflePublic } from '@raffle/shared';
import { getActiveRaffle, registerParticipant, ApiError } from '@/lib/api';
import { Spinner } from '@/shared-ui/Spinner';
import { ThemeRenderer } from '../themes/ThemeRenderer';

type PageState = 'loading' | 'no-active-raffle' | 'form' | 'submitting' | 'success' | 'entries-closed';

export function EntryPage() {
  const [raffle, setRaffle] = useState<ActiveRafflePublic | null>(null);
  const [state, setState] = useState<PageState>('loading');
  const [name, setName] = useState('');
  const [registeredName, setRegisteredName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getActiveRaffle();
        if (!data) {
          setState('no-active-raffle');
          return;
        }
        setRaffle(data);
        setState(data.hasDrawingStarted ? 'entries-closed' : 'form');
      } catch {
        setState('no-active-raffle');
      }
    }
    load();
  }, []);

  function validateName(value: string): string | null {
    const result = selfRegistrationSchema.safeParse({ name: value });
    if (!result.success) {
      return result.error.errors[0]?.message ?? 'Invalid name';
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldError(null);

    const validationError = validateName(name);
    if (validationError) {
      setFieldError(validationError);
      return;
    }

    setState('submitting');

    try {
      const result = await registerParticipant(name.trim());
      setRegisteredName(result.name);
      setState('success');
    } catch (err) {
      setState('form');
      if (err instanceof ApiError) {
        switch (err.code) {
          case 'ENTRIES_CLOSED':
            setState('entries-closed');
            return;
          case 'DUPLICATE_ENTRY':
            setError('This name is already registered. Try a different name.');
            return;
          case 'RATE_LIMIT_EXCEEDED':
            setError('Too many attempts. Please wait a moment and try again.');
            return;
          case 'VALIDATION_ERROR':
            setFieldError('Please enter a valid name (1-100 characters).');
            return;
          case 'NOT_FOUND':
            setState('no-active-raffle');
            return;
          default:
            setError(err.message);
            return;
        }
      }
      setError('Something went wrong. Please try again.');
    }
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (state === 'no-active-raffle' || !raffle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center px-4 flex flex-col items-center gap-4 max-w-[400px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]/25">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
          </svg>
          <h1 className="font-anton text-[28px] sm:text-4xl text-[var(--fg-primary)] tracking-[2px]">
            No Active Raffle
          </h1>
          <p className="font-geist text-sm sm:text-base text-[var(--fg-secondary)]">
            There is no raffle currently running. Please check back later!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ThemeRenderer theme={raffle.theme} />
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-[var(--bg-primary)]">
        {/* Heading */}
        <h1 className="font-anton text-[28px] sm:text-[40px] text-center text-[var(--fg-primary)] mb-2 tracking-[2px] sm:tracking-[3px]">
          {raffle.heading}
        </h1>

        {raffle.subheading && (
          <p className="font-geist text-sm sm:text-lg text-center text-[var(--fg-secondary)] mb-6 sm:mb-8 max-w-2xl">
            {raffle.subheading}
          </p>
        )}

        {/* Entries closed state */}
        {state === 'entries-closed' && (
          <div className="w-full max-w-[400px] text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--error)]/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="font-anton text-2xl text-[var(--fg-primary)] tracking-[1px]">
              Entries Closed
            </h2>
            <p className="font-geist text-sm text-[var(--fg-secondary)]">
              Drawing has already started. New entries are no longer accepted.
            </p>
          </div>
        )}

        {/* Success state */}
        {state === 'success' && (
          <div className="w-full max-w-[400px] text-center flex flex-col items-center gap-4" role="status">
            <div className="w-14 h-14 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="font-anton text-2xl text-[var(--fg-primary)] tracking-[1px]">
              You're In!
            </h2>
            <p className="font-geist text-base text-[var(--fg-secondary)]">
              <span className="font-medium text-[var(--fg-primary)]">{registeredName}</span> has been entered into the raffle. Good luck!
            </p>
          </div>
        )}

        {/* Form state */}
        {(state === 'form' || state === 'submitting') && (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[400px] flex flex-col gap-4"
            noValidate
          >
            <div className="text-center mb-2">
              <p className="font-geist text-sm sm:text-base text-[var(--fg-secondary)]">
                Enter your name to join the raffle
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div
                className="px-4 py-3 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/30 text-[var(--error)] font-geist text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Name input */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="participant-name"
                className="font-geist text-sm font-medium text-[var(--fg-primary)]"
              >
                Your Name
              </label>
              <input
                id="participant-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldError) setFieldError(null);
                  if (error) setError(null);
                }}
                placeholder="Enter your name"
                maxLength={100}
                autoComplete="name"
                autoFocus
                disabled={state === 'submitting'}
                aria-invalid={fieldError ? 'true' : undefined}
                aria-describedby={fieldError ? 'name-error' : undefined}
                className={`
                  w-full px-4 py-3 rounded-lg
                  bg-[var(--bg-secondary)] border
                  ${fieldError ? 'border-[var(--error)]' : 'border-[var(--border)]'}
                  text-[var(--fg-primary)] font-geist text-base
                  placeholder:text-[var(--fg-muted)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--border-focus)]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                `}
              />
              {fieldError && (
                <p id="name-error" className="font-geist text-xs text-[var(--error)]" role="alert">
                  {fieldError}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={state === 'submitting'}
              className="
                w-full py-3 rounded-lg
                font-anton uppercase text-lg tracking-[1px]
                bg-gradient-to-b from-[var(--accent-btn)] to-[var(--accent-btn-hover)]
                text-white
                shadow-[0_4px_16px_rgba(168,85,247,0.3)]
                hover:shadow-[0_6px_24px_rgba(168,85,247,0.4)]
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/30
                active:scale-[0.98]
              "
            >
              {state === 'submitting' ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  Entering...
                </span>
              ) : (
                'Enter Raffle'
              )}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
