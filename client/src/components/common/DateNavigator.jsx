import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toISODateString, addDaysToDate } from '../../utils/dateUtils.js';

export default function DateNavigator({ value, onChange }) {
  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <button type="button" onClick={() => onChange(addDaysToDate(value, -1))} className="btn-icon" aria-label="Previous day">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <input
        type="date"
        aria-label="Date"
        value={value}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="input min-w-0 flex-1 text-center sm:w-40 sm:flex-none"
      />
      <button type="button" onClick={() => onChange(addDaysToDate(value, 1))} className="btn-icon" aria-label="Next day">
        <ChevronRight className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => onChange(toISODateString(new Date()))} className="btn-secondary">
        Today
      </button>
    </div>
  );
}