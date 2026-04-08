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

const variantStyles: Record<ToastVariant, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-green-950/90',
    border: 'border-green-800',
    icon: 'text-green-400',
  },
  error: {
    bg: 'bg-red-950/90',
    border: 'border-red-800',
    icon: 'text-red-400',
  },
  warning: {
    bg: 'bg-yellow-950/90',
    border: 'border-yellow-800',
    icon: 'text-yellow-400',
  },
};

const icons: Record<ToastVariant, string> = {
  success: '\u2713',
  error: '\u2717',
  warning: '!',
};

export function Toast({ toast, onClose }: ToastProps) {
  const style = variantStyles[toast.variant];

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg
        ${style.bg} ${style.border}
        animate-[slideIn_0.3s_ease-out]
      `}
      role="alert"
    >
      <span className={`text-lg font-bold ${style.icon}`}>
        {icons[toast.variant]}
      </span>
      <p className="flex-1 text-sm text-[var(--fg-primary)]">{toast.message}</p>
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
