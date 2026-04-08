import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ActiveRafflePublic } from '@raffle/shared';
import { getActiveRaffle, drawName } from '@/lib/api';
import { Spinner } from '@/shared-ui/Spinner';
import { AnimationEngine } from '../animations/AnimationEngine';
import { CelebrationFX } from '../animations/CelebrationFX';
import { AudioEngine } from '../audio/AudioEngine';
import { ThemeRenderer } from '../themes/ThemeRenderer';
import { StatsPills } from '../components/StatsPills';
import { WinnerHistory } from '../components/WinnerHistory';

type DrawState = 'loading' | 'no-active-raffle' | 'ready' | 'cycling' | 'winner-revealed' | 'all-drawn';

export function DrawPage() {
  const [raffle, setRaffle] = useState<ActiveRafflePublic | null>(null);
  const [state, setState] = useState<DrawState>('loading');
  const [winnerName, setWinnerName] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [drawnNames, setDrawnNames] = useState<string[]>([]);
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
        setDrawnNames(data.drawnNames ?? []);
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

    // Optimistically add winner to drawn names list
    if (winnerName) {
      setDrawnNames(prev => prev.includes(winnerName) ? prev : [...prev, winnerName]);
    }

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
          setDrawnNames(data.drawnNames ?? []);
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
  }, [winnerName]);

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
        <div className="text-center px-4 flex flex-col items-center gap-4 sm:gap-5 max-w-[300px] sm:max-w-[400px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-16 sm:h-16 text-[var(--accent)]/25">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
            <path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
          </svg>
          <h1 className="font-anton text-[28px] sm:text-4xl text-[var(--fg-primary)] tracking-[2px]">
            No Active Raffle
          </h1>
          <p className="font-geist text-sm sm:text-base text-[var(--fg-secondary)] max-w-[260px] sm:max-w-[320px] text-center">
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
          className="absolute top-3 right-3 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors z-10"
          aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
        >
          {isMuted ? (
            // volume-x icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
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
              width="18"
              height="18"
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
        <h1 className="font-anton text-[28px] sm:text-[48px] text-center text-[var(--fg-primary)] mb-2 tracking-[2px] sm:tracking-[3px]">
          {raffle.heading}
        </h1>

        {/* Subheading */}
        {raffle.subheading && (
          <p className="font-geist text-sm sm:text-lg text-center text-[var(--fg-secondary)] mb-8 sm:mb-12 max-w-2xl">
            {raffle.subheading}
          </p>
        )}

        {/* Stats pills */}
        <StatsPills
          totalCount={raffle.totalCount}
          remainingCount={raffle.remainingCount}
          drawnCount={raffle.totalCount - raffle.remainingCount}
        />

        {/* Name display area */}
        <div
          className="
            w-full sm:max-w-[500px] mx-auto
            border border-[var(--accent)]/25 rounded-2xl
            bg-[radial-gradient(circle,#1C1A20_30%,#151318_100%)]
            h-[140px] sm:h-[180px]
            mb-5 sm:mb-10
            flex items-center justify-center
            shadow-[0_0_80px_6px_rgba(168,85,247,0.16),0_12px_160px_rgba(124,58,237,0.07),0_0_40px_rgba(168,85,247,0.06)]
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
            <div className="text-center flex flex-col items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="font-anton text-4xl sm:text-[56px] text-[var(--fg-muted)] tracking-[2px] sm:tracking-[3px]">
                ALL DRAWN!
              </p>
            </div>
          ) : (
            <p className="font-anton text-4xl sm:text-[56px] text-[var(--fg-muted)] tracking-[2px] sm:tracking-[3px]">
              ???
            </p>
          )}
        </div>

        {/* Draw button */}
        <button
          onClick={handleDraw}
          disabled={state !== 'ready'}
          className={`
            font-anton uppercase
            px-12 py-5 sm:px-12 sm:py-5
            text-xl sm:text-2xl tracking-[2px]
            rounded-full
            bg-gradient-to-b from-[var(--accent-btn)] to-[var(--accent-btn-hover)]
            shadow-[0_4px_24px_rgba(168,85,247,0.4)]
            hover:shadow-[0_6px_32px_rgba(168,85,247,0.5)]
            text-white
            transition-all duration-300
            disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
            focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/30
            active:scale-95
            ${state === 'ready' ? 'motion-safe:animate-[glowPulse_2.5s_ease-in-out_infinite]' : ''}
          `}
          aria-live="polite"
        >
          {state === 'all-drawn' ? (
            'All Names Drawn'
          ) : state === 'cycling' ? (
            <span className="inline-flex items-center gap-3">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 motion-safe:animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="32" strokeDashoffset="8"
                />
              </svg>
              Drawing...
            </span>
          ) : state === 'winner-revealed' ? (
            'Revealing...'
          ) : (
            'Draw a Name'
          )}
        </button>

        {/* Winner history */}
        <WinnerHistory drawnNames={drawnNames} />
      </div>
    </>
  );
}
