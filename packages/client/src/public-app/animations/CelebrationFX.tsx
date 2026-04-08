import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationFXProps {
  isActive: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  velocity: number;
  shape: 'circle' | 'square';
}

const COLORS = [
  '#A855F7', '#EF4444', '#F59E0B', '#22C55E',
  '#3B82F6', '#EC4899', '#F97316', '#06B6D4',
];

const PARTICLE_COUNT = 60;

export function CelebrationFX({ isActive }: CelebrationFXProps) {
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 10,
      y: 50 + (Math.random() - 0.5) * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 8,
      angle: (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5,
      velocity: 150 + Math.random() * 300,
      shape: Math.random() > 0.5 ? 'circle' : 'square',
    }));
  }, []);

  useEffect(() => {
    if (isActive) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!visible) return null;

  // Reduced motion: just show a glow effect
  if (prefersReducedMotion.current) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="w-64 h-64 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)',
            }}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {particles.map((particle) => {
        const endX = particle.x + Math.cos(particle.angle) * (particle.velocity / 5);
        const endY = particle.y + Math.sin(particle.angle) * (particle.velocity / 5);

        return (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: particle.shape === 'circle' ? '50%' : '2px',
            }}
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              x: `${(endX - particle.x) * 5}vw`,
              y: `${(endY - particle.y) * 5}vh`,
              scale: [0, 1.5, 1, 0],
              opacity: [1, 1, 0.8, 0],
              rotate: [0, 180 + Math.random() * 360],
            }}
            transition={{
              duration: 2 + Math.random(),
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}
