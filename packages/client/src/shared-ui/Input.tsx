import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  fullWidth = true,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--fg-secondary)] mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3 py-2 rounded-lg
          bg-[var(--bg-secondary)] border text-[var(--fg-primary)]
          placeholder:text-[var(--fg-muted)]
          focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
          transition-colors duration-200
          ${error ? 'border-[var(--error)]' : 'border-[var(--border)]'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[var(--error)]">{error}</p>
      )}
    </div>
  );
}
