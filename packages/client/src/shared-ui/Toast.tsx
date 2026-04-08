import React from 'react';

export type ToastVariant = 'success' | 'error' | 'warning';

export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const borderColors: Record<ToastVariant, string> = {
  success: 'border-[var(--success)]',
  error: 'border-[var(--error)]',
  warning: 'border-[var(--warning)]',
};

const iconColors: Record<ToastVariant, string> = {
  success: 'text-[var(--success)]',
  error: 'text-[var(--error)]',
  warning: 'text-[var(--warning)]',
};

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const iconClass = iconColors[variant];
  if (variant === 'success') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  }
  if (variant === 'error') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
      <line x1="10" x2="14" y1="2" y2="2" />
      <line x1="12" x2="15" y1="14" y2="11" />
      <circle cx="12" cy="14" r="8" />
    </svg>
  );
}

export function Toast({ toast, onClose }: ToastProps) {
  return (
    <div
      className={`
        flex items-center gap-3 px-[18px] py-[14px] rounded-xl border shadow-[0_8px_20px_rgba(0,0,0,0.25)]
        bg-[var(--bg-secondary)] ${borderColors[toast.variant]}
        animate-[slideIn_0.3s_ease-out]
      `}
      role="alert"
    >
      <ToastIcon variant={toast.variant} />
      <p className="flex-1 font-geist text-sm text-[var(--fg-primary)]">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors"
        aria-label="Close notification"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
