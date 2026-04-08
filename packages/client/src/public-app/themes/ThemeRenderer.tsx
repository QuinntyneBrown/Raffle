import { useEffect } from 'react';
import type { Theme } from '@raffle/shared';

interface ThemeRendererProps {
  theme: Theme;
}

const themeDefinitions: Record<Theme, Record<string, string>> = {
  cosmic: {
    '--bg-primary': '#0A0A0A',
    '--bg-secondary': '#1A1A1A',
    '--bg-tertiary': '#2A2A2A',
    '--fg-primary': '#FFFFFF',
    '--fg-secondary': '#A1A1AA',
    '--fg-muted': '#71717A',
    '--accent': '#A855F7',
    '--accent-hover': '#9333EA',
    '--accent-light': 'rgba(168, 85, 247, 0.125)',
    '--border': '#27272A',
    '--border-focus': '#A855F7',
    '--success': '#22C55E',
    '--error': '#EF4444',
    '--warning': '#F59E0B',
    '--accent-glow-soft': 'rgba(168, 85, 247, 0.35)',
    '--accent-glow-strong': 'rgba(168, 85, 247, 0.7)',
    '--winner-gradient-from': '#F59E0B',
    '--winner-gradient-via': '#EC4899',
    '--winner-gradient-to': '#8B5CF6',
  },
  festive: {
    '--bg-primary': '#1A0A0A',
    '--bg-secondary': '#2E1A1A',
    '--bg-tertiary': '#3E2A2A',
    '--fg-primary': '#FFFFFF',
    '--fg-secondary': '#FDE8E8',
    '--fg-muted': '#D4A0A0',
    '--accent': '#EF4444',
    '--accent-hover': '#DC2626',
    '--accent-light': 'rgba(239, 68, 68, 0.15)',
    '--border': '#44202D',
    '--border-focus': '#EF4444',
    '--success': '#22C55E',
    '--error': '#F87171',
    '--warning': '#F59E0B',
    '--accent-glow-soft': 'rgba(239, 68, 68, 0.35)',
    '--accent-glow-strong': 'rgba(239, 68, 68, 0.7)',
    '--winner-gradient-from': '#FCD34D',
    '--winner-gradient-via': '#FB923C',
    '--winner-gradient-to': '#EF4444',
  },
  corporate: {
    '--bg-primary': '#0A0A1A',
    '--bg-secondary': '#111827',
    '--bg-tertiary': '#1F2937',
    '--fg-primary': '#FFFFFF',
    '--fg-secondary': '#D1D5DB',
    '--fg-muted': '#6B7280',
    '--accent': '#3B82F6',
    '--accent-hover': '#2563EB',
    '--accent-light': 'rgba(59, 130, 246, 0.15)',
    '--border': '#1F2937',
    '--border-focus': '#3B82F6',
    '--success': '#22C55E',
    '--error': '#EF4444',
    '--warning': '#F59E0B',
    '--accent-glow-soft': 'rgba(59, 130, 246, 0.35)',
    '--accent-glow-strong': 'rgba(59, 130, 246, 0.7)',
    '--winner-gradient-from': '#60A5FA',
    '--winner-gradient-via': '#A78BFA',
    '--winner-gradient-to': '#34D399',
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
