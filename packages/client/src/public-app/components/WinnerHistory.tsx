import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WinnerHistoryProps {
  drawnNames: string[];
}

export function WinnerHistory({ drawnNames }: WinnerHistoryProps) {
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  if (drawnNames.length === 0) return null;

  // Display in reverse chronological order (most recent first)
  const reversed = [...drawnNames].reverse();

  return (
    <div className="w-full sm:max-w-[500px] mx-auto mt-8">
      <h2 className="font-geist text-base text-[var(--fg-secondary)] mb-3 text-center">
        🏆 Winners ({drawnNames.length})
      </h2>
      <ol
        aria-live="polite"
        className={`
          flex flex-col gap-2 overflow-y-auto max-h-[280px]
          ${drawnNames.length > 5 ? '[mask-image:linear-gradient(to_bottom,black_calc(100%-40px),transparent)]' : ''}
        `}
      >
        <AnimatePresence initial={false}>
          {reversed.map((name, i) => {
            const drawNumber = drawnNames.length - i;
            return (
              <motion.li
                key={`${drawNumber}-${name}`}
                initial={prefersReducedMotion.current ? false : { x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3"
              >
                <span className="font-geist text-sm text-[var(--fg-muted)] shrink-0">
                  #{drawNumber}
                </span>
                <span className="font-bold text-[var(--fg-primary)] truncate">
                  {name}
                </span>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </div>
  );
}
