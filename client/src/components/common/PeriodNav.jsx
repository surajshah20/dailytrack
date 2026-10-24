import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PeriodNav({ label, onPrev, onNext, prevLabel = 'Previous', nextLabel = 'Next' }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={onPrev} className="btn-icon" aria-label={prevLabel}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span
        className="min-w-[9rem] text-center text-sm font-medium tabular-nums text-fg"
        aria-live="polite"
      >
        {label}
      </span>
      <button type="button" onClick={onNext} className="btn-icon" aria-label={nextLabel}>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}