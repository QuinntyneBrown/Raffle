import React from 'react';

type BadgeVariant = 'active' | 'inactive' | 'warning' | 'error';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  active: 'bg-[var(--success-light)] text-[var(--success)]',
  inactive: 'bg-[var(--bg-tertiary)] text-[var(--fg-muted)]',
  warning: 'bg-[var(--warning-light)] text-[var(--warning)]',
  error: 'bg-[var(--error-light)] text-[var(--error)]',
};

export function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {variant === 'active' && (
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
      )}
      {variant === 'inactive' && (
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--fg-muted)]" />
      )}
      {children}
    </span>
  );
}
