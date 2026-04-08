import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { ActiveRafflePublic } from '@raffle/shared';
import { getActiveRaffle } from '@/lib/api';
import { Spinner } from '@/shared-ui/Spinner';
import { ThemeRenderer } from '../themes/ThemeRenderer';

type PageState = 'loading' | 'no-active-raffle' | 'accepting-entries' | 'entries-closed';

export function QRCodePage() {
  const [raffle, setRaffle] = useState<ActiveRafflePublic | null>(null);
  const [state, setState] = useState<PageState>('loading');

  useEffect(() => {
    async function load() {
      try {
        const data = await getActiveRaffle();
        if (!data) {
          setState('no-active-raffle');
          return;
        }
        setRaffle(data);
        setState(data.hasDrawingStarted ? 'entries-closed' : 'accepting-entries');
      } catch {
        setState('no-active-raffle');
      }
    }
    load();
  }, []);

  const entryUrl = `${window.location.origin}/enter`;

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
        <h1 className="font-anton text-[28px] sm:text-[48px] text-center text-[var(--fg-primary)] mb-2 tracking-[2px] sm:tracking-[3px]">
          {raffle.heading}
        </h1>

        {raffle.subheading && (
          <p className="font-geist text-sm sm:text-lg text-center text-[var(--fg-secondary)] mb-6 sm:mb-8 max-w-2xl">
            {raffle.subheading}
          </p>
        )}

        {/* Status badge */}
        {state === 'entries-closed' ? (
          <div className="mb-6 px-4 py-2 rounded-full bg-[var(--error)]/10 border border-[var(--error)]/30">
            <span className="font-geist text-sm text-[var(--error)] font-medium">
              Entries Closed — Drawing Has Started
            </span>
          </div>
        ) : (
          <div className="mb-6 px-4 py-2 rounded-full bg-[var(--success)]/10 border border-[var(--success)]/30">
            <span className="font-geist text-sm text-[var(--success)] font-medium">
              Accepting Entries
            </span>
          </div>
        )}

        {/* QR Code */}
        <div
          className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg mb-6"
          role="img"
          aria-label={`QR code linking to ${entryUrl}`}
        >
          <QRCodeSVG
            value={entryUrl}
            size={220}
            level="M"
            marginSize={0}
          />
        </div>

        {/* Instructions */}
        <p className="font-geist text-base sm:text-lg text-center text-[var(--fg-primary)] mb-2 font-medium">
          Scan to Enter the Raffle
        </p>
        <p className="font-geist text-xs sm:text-sm text-center text-[var(--fg-muted)] max-w-[300px] mb-4">
          Point your phone camera at the QR code or visit the link below
        </p>

        {/* URL display */}
        <a
          href={entryUrl}
          className="font-geist text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] underline underline-offset-2 transition-colors"
        >
          {entryUrl}
        </a>

        {/* Participant count */}
        <div className="mt-8 flex items-center gap-2 text-[var(--fg-secondary)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="font-geist text-sm">
            {raffle.totalCount} participant{raffle.totalCount !== 1 ? 's' : ''} registered
          </span>
        </div>
      </div>
    </>
  );
}
