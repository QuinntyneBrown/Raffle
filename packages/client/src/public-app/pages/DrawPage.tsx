import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ActiveRafflePublic } from '@raffle/shared';
import { getActiveRaffle, drawName } from '@/lib/api';
import { Spinner } from '@/shared-ui/Spinner';
import { AnimationEngine } from '../animations/AnimationEngine';
import { CelebrationFX } from '../animations/CelebrationFX';
import { AudioEngine } from '../audio/AudioEngine';
import { ThemeRenderer } from '../themes/ThemeRenderer';

type DrawState = 'loading' | 'no-active-raffle' | 'ready' | 'cycling' | 'winner-revealed' | 'all-drawn';

export function DrawPage() {
  const [raffle, setRaffle] = useState<ActiveRafflePublic | null>(null);
  const [state, setState] = useState<DrawState>('loading');
  const [winnerName, setWinnerName] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const audioRef = useRef<AudioEngine | null>(null);

  // Initialize audio engine
  useEffect(() => {
    const engine = new AudioEngine();
    audioRef.current = engine;
    setIsMuted(engine.isMuted());
    return () => engine.dispose();
  }, []);

  // Fetch active raffle
  useEffect(() => {
    async function load() {
      try {
        const data = await getActiveRaffle();
        if (!data) {
          setState('no-active-raffle');
          return;
        }
        setRaffle(data);
        if (data.allDrawn) {
          setState('all-drawn');
          if (data.lastDrawnName) {
            setWinnerName(data.lastDrawnName);
          }
        } else {
          setState('ready');
        }
      } catch {
        setState('no-active-raffle');
      }
    }
    load();
  }, []);

  const handleDraw = useCallback(async () => {
    if (!raffle || state !== 'ready') return;

    try {
      // Draw name from server first
      const result = await drawName();

      // Start animation
      setWinnerName(result.name);
      setState('cycling');

      // Start audio cycling
      audioRef.current?.startCycling(80);
    } catch (err) {
      // Could be "all drawn" error; refresh raffle state
      try {
        const data = await getActiveRaffle();
        if (!data) {
          setState('no-active-raffle');
          return;
        }
        setRaffle(data);
        if (data.allDrawn) {
          setState('all-drawn');
        }
      } catch {
        setState('no-active-raffle');
      }
    }
  }, [raffle, state]);

  const handleAnimationComplete = useCallback(() => {
    // Stop cycling audio and play reveal
    audioRef.current?.stopCycling();
    audioRef.current?.playReveal();

    // Show celebration
    setShowCelebration(true);
    setState('winner-revealed');

    // After celebration, allow drawing again if there are remaining names
    setTimeout(() => {
      setShowCelebration(false);

      // Refresh raffle state
      getActiveRaffle()
        .then((data) => {
          if (!data) {
            setState('no-active-raffle');
            return;
          }
          setRaffle(data);
          if (data.allDrawn) {
            setState('all-drawn');
          } else {
            setState('ready');
          }
        })
        .catch(() => {
          setState('no-active-raffle');
        });
    }, 3500);
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newMuted = !audioRef.current.isMuted();
      audioRef.current.setMuted(newMuted);
      setIsMuted(newMuted);
    }
  }, []);

  // ── Loading state ──
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── No active raffle ──
  if (state === 'no-active-raffle' || !raffle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center px-4 flex flex-col items-center gap-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--fg-muted)]">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
            <path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
          </svg>
          <h1 className="font-anton text-3xl sm:text-4xl md:text-5xl text-[var(--fg-primary)] tracking-wide">
            No Active Raffle
          </h1>
          <p className="text-base sm:text-lg text-[var(--fg-muted)] max-w-sm">
            There is no raffle currently running. Please check back later!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ThemeRenderer theme={raffle.theme} />
      <CelebrationFX isActive={showCelebration} />

      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-[var(--bg-primary)] relative">
        {/* Mute toggle */}
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors z-10"
          aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
        >
          {isMuted ? (
            // volume-x icon
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
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            // volume-2 icon
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
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>

        {/* Heading */}
        <h1 className="font-anton text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-center text-[var(--fg-primary)] mb-2 tracking-wide">
          {raffle.heading}
        </h1>

        {/* Subheading */}
        {raffle.subheading && (
          <p className="text-lg sm:text-xl md:text-2xl text-center text-[var(--fg-muted)] mb-8 sm:mb-12 max-w-2xl">
            {raffle.subheading}
          </p>
        )}

        {/* Name display area */}
        <div
          className="
            w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto
            border border-[var(--border)] rounded-2xl
            bg-[var(--bg-secondary)]
            px-6 py-12 sm:py-16 md:py-20
            mb-8 sm:mb-12
            min-h-[160px] sm:min-h-[180px]
            flex items-center justify-center
            shadow-[0_0_40px_rgba(168,85,247,0.1)]
          "
        >
          {state === 'cycling' || state === 'winner-revealed' ? (
            <AnimationEngine
              names={raffle.participantNames}
              winner={winnerName}
              style={raffle.animationStyle}
              isPlaying={state === 'cycling'}
              onComplete={handleAnimationComplete}
            />
          ) : state === 'all-drawn' ? (
            <div className="text-center">
              {winnerName && (
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--accent)] mb-2">
                  {winnerName}
                </p>
              )}
              <p className="text-base sm:text-lg text-[var(--fg-muted)]">
                All names have been drawn!
              </p>
            </div>
          ) : (
            <p className="font-anton text-4xl sm:text-5xl md:text-6xl text-[var(--fg-muted)] tracking-wider">
              ???
            </p>
          )}
        </div>

        {/* Draw button */}
        <button
          onClick={handleDraw}
          disabled={state !== 'ready'}
          className="
            font-anton tracking-widest uppercase
            px-12 py-4 sm:px-16 sm:py-5
            text-lg sm:text-xl
            rounded-full
            bg-gradient-to-b from-[var(--accent)] to-[var(--accent-hover)]
            shadow-[0_4px_24px_rgba(168,85,247,0.4)]
            hover:shadow-[0_6px_32px_rgba(168,85,247,0.5)]
            text-white
            transition-all duration-300
            disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
            focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/30
            active:scale-95
          "
          aria-live="polite"
        >
          {state === 'all-drawn'
            ? 'All Names Drawn'
            : state === 'cycling'
              ? 'Drawing...'
              : state === 'winner-revealed'
                ? 'Revealing...'
                : 'Draw a Name'}
        </button>
      </div>
    </>
  );
}
