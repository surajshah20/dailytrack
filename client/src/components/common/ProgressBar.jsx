export default function ProgressBar({ value = 0, label = 'Progress' }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
    >
      <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${pct}%` }} />
    </div>
  );
}