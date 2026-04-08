import React from 'react';

interface StatsPillsProps {
  totalCount: number;
  remainingCount: number;
  drawnCount: number;
}

function Pill({ emoji, label }: { emoji: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-1.5 font-geist text-sm text-[var(--fg-secondary)]">
      <span aria-hidden="true">{emoji}</span>
      <span>{label}</span>
    </span>
  );
}

export function StatsPills({ totalCount, remainingCount, drawnCount }: StatsPillsProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="hidden sm:flex flex-wrap items-center justify-center gap-3 sm:mb-12"
    >
      <Pill emoji="👥" label={`${totalCount} registered`} />
      <Pill emoji="🎯" label={`${remainingCount} remaining`} />
      <Pill emoji="🏆" label={`${drawnCount} winners`} />
    </div>
  );
}
