import React from 'react';

type BadgeVariant = 'active' | 'inactive' | 'warning' | 'error';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  active: 'bg-green-900/40 text-green-400 border-green-800',
  inactive: 'bg-gray-800/40 text-gray-400 border-gray-700',
  warning: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  error: 'bg-red-900/40 text-red-400 border-red-800',
};

export function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {variant === 'active' && (
        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
      )}
      {children}
    </span>
  );
}
