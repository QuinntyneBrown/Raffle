import React from 'react';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent-btn)] hover:bg-[var(--accent-btn-hover)] text-white shadow-md',
  secondary:
    'bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--fg-primary)] hover:border-[var(--fg-muted)]',
  danger:
    'bg-[var(--error)] hover:bg-red-700 text-white shadow-md',
  ghost:
    'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-secondary)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-6 py-3 text-[13px] rounded-full',
  md: 'px-6 py-3 text-sm rounded-full',
  lg: 'px-8 py-3.5 text-base rounded-full',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
}
