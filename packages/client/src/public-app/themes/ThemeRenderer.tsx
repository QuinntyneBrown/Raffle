import { useEffect } from 'react';
import type { Theme } from '@raffle/shared';

interface ThemeRendererProps {
  theme: Theme;
}

const themeDefinitions: Record<Theme, Record<string, string>> = {
  cosmic: {
    '--bg-primary': '#0A0A0A',
    '--bg-secondary': '#1A1A2E',
    '--fg-primary': '#FFFFFF',
    '--fg-secondary': '#E2E8F0',
    '--fg-muted': '#94A3B8',
    '--accent': '#A855F7',
    '--accent-hover': '#9333EA',
    '--accent-light': 'rgba(168, 85, 247, 0.15)',
    '--border': '#2D2D44',
    '--success': '#22C55E',
    '--error': '#EF4444',
    '--warning': '#F59E0B',
  },
  festive: {
    '--bg-primary': '#1A0A0A',
    '--bg-secondary': '#2E1A1A',
    '--fg-primary': '#FFFFFF',
    '--fg-secondary': '#FDE8E8',
    '--fg-muted': '#D4A0A0',
    '--accent': '#EF4444',
    '--accent-hover': '#DC2626',
    '--accent-light': 'rgba(239, 68, 68, 0.15)',
    '--border': '#44202D',
    '--success': '#22C55E',
    '--error': '#F87171',
    '--warning': '#F59E0B',
  },
  corporate: {
    '--bg-primary': '#0A0A1A',
    '--bg-secondary': '#111827',
    '--fg-primary': '#FFFFFF',
    '--fg-secondary': '#D1D5DB',
    '--fg-muted': '#6B7280',
    '--accent': '#3B82F6',
    '--accent-hover': '#2563EB',
    '--accent-light': 'rgba(59, 130, 246, 0.15)',
    '--border': '#1F2937',
    '--success': '#22C55E',
    '--error': '#EF4444',
    '--warning': '#F59E0B',
  },
};

export function ThemeRenderer({ theme }: ThemeRendererProps) {
  useEffect(() => {
    const root = document.documentElement;
    const vars = themeDefinitions[theme];

    root.setAttribute('data-theme', theme);

    for (const [prop, value] of Object.entries(vars)) {
      root.style.setProperty(prop, value);
    }

    return () => {
      root.removeAttribute('data-theme');
      for (const prop of Object.keys(vars)) {
        root.style.removeProperty(prop);
      }
    };
  }, [theme]);

  return null;
}
