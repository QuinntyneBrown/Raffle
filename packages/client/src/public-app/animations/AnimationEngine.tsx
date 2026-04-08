import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnimationStyle } from '@raffle/shared';

interface AnimationEngineProps {
  names: string[];
  winner: string;
  style: AnimationStyle;
  isPlaying: boolean;
  onComplete: () => void;
}

const TOTAL_DURATION = 4000; // 4 seconds total cycling
const START_INTERVAL = 50; // start fast
const END_INTERVAL = 500; // end slow

export function AnimationEngine({
  names,
  winner,
  style,
  isPlaying,
  onComplete,
}: AnimationEngineProps) {
  const [currentName, setCurrentName] = useState<string>('???');
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  const clearCycling = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      clearCycling();
      return;
    }

    // Reduced motion: instantly show winner
    if (prefersReducedMotion.current) {
      setCurrentName(winner);
      setIsFinished(true);
      onComplete();
      return;
    }

    startTimeRef.current = Date.now();
    setIsFinished(false);

    const cycle = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / TOTAL_DURATION, 1);

      if (progress >= 1) {
        // Land on winner
        setCurrentName(winner);
        setIsFinished(true);
        onComplete();
        return;
      }

      // Pick a random name (not the winner, unless near the end)
      if (progress > 0.9) {
        // Near the end, occasionally show the winner to build tension
        const showWinner = Math.random() > 0.5;
        setCurrentName(showWinner ? winner : names[Math.floor(Math.random() * names.length)]);
      } else {
        const randomIndex = Math.floor(Math.random() * names.length);
        setCurrentName(names[randomIndex]);
      }

      // Decelerate: interval increases as progress increases (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const currentInterval = START_INTERVAL + (END_INTERVAL - START_INTERVAL) * eased;
      intervalRef.current = setTimeout(cycle, currentInterval);
    };

    cycle();

    return clearCycling;
  }, [isPlaying, names, winner, onComplete, clearCycling]);

  // Reset when not playing
  useEffect(() => {
    if (!isPlaying && !isFinished) {
      setCurrentName('???');
    }
  }, [isPlaying, isFinished]);

  const getAnimationVariants = () => {
    switch (style) {
      case 'slot_machine':
        return {
          initial: { y: -40, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: 40, opacity: 0 },
          transition: { duration: 0.08 },
        };
      case 'wheel_spin':
        return {
          initial: { rotateX: -90, opacity: 0 },
          animate: { rotateX: 0, opacity: 1 },
          exit: { rotateX: 90, opacity: 0 },
          transition: { duration: 0.08 },
        };
      case 'card_flip':
        return {
          initial: { scale: 0.8, rotateY: 90, opacity: 0 },
          animate: { scale: 1, rotateY: 0, opacity: 1 },
          exit: { scale: 0.8, rotateY: -90, opacity: 0 },
          transition: { duration: 0.08 },
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.05 },
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden"
      style={{ perspective: 600 }}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentName + (isFinished ? '-final' : '')}
          initial={prefersReducedMotion.current ? false : variants.initial}
          animate={variants.animate}
          exit={prefersReducedMotion.current ? undefined : variants.exit}
          transition={variants.transition}
          className={`
            text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center
            ${isFinished ? 'text-[var(--accent)]' : 'text-[var(--fg-primary)]'}
          `}
        >
          {currentName}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
