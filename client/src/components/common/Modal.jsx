import { useEffect, useId } from 'react';
import { X } from 'lucide-react';

/** Bottom sheet on mobile, centered dialog on sm and up. */
export default function Modal({ isOpen, onClose, title, children, footer }) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="animate-fade-in absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div className="animate-sheet-up relative flex max-h-[92dvh] w-full flex-col rounded-t-lg border border-border bg-surface shadow-lg sm:max-w-lg sm:rounded-lg">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <h2 id={titleId} className="truncate text-base font-semibold text-fg">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="btn-ghost -mr-2 h-8 w-8 px-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>

        {footer && (
          <div className="border-t border-border px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}