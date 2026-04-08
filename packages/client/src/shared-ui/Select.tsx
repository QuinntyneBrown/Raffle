import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  fullWidth = true,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-[var(--fg-secondary)] mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full px-3 py-2 rounded-lg appearance-none
          bg-[var(--bg-secondary)] border text-[var(--fg-primary)]
          focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
          transition-colors duration-200 cursor-pointer
          ${error ? 'border-[var(--error)]' : 'border-[var(--border)]'}
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-[var(--error)]">{error}</p>
      )}
    </div>
  );
}
