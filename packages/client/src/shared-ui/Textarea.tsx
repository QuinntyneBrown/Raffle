import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Textarea({
  label,
  error,
  fullWidth = true,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-[13px] font-medium text-[var(--fg-secondary)] mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`
          w-full px-3.5 py-2.5 rounded-lg resize-y min-h-[100px]
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
        <p className="mt-1.5 text-xs text-[var(--error)]">{error}</p>
      )}
    </div>
  );
}
