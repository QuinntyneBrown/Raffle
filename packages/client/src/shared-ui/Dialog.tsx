import React, { useCallback, useEffect, useRef } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function Dialog({ open, onClose, title, description, icon, children, actions }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      // Focus the dialog after render
      requestAnimationFrame(() => {
        const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        firstFocusable?.focus();
      });
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? 'dialog-description' : undefined}
        className="relative z-10 w-full max-w-[480px] rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.38),0_0_100px_rgba(168,85,247,0.06)]"
      >
        {icon && <div className="mb-5">{icon}</div>}

        <h2
          id="dialog-title"
          className="font-geist text-lg font-bold text-[var(--fg-primary)]"
        >
          {title}
        </h2>

        {description && (
          <p
            id="dialog-description"
            className="font-geist mt-2 text-sm text-[var(--fg-secondary)]"
          >
            {description}
          </p>
        )}

        {children && <div className="mt-4">{children}</div>}

        {actions && (
          <div className="mt-6 flex justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
