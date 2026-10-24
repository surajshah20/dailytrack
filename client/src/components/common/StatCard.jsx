// `icon` is accepted but ignored, so pages that still pass it won't break.
export default function StatCard({ label, value, valueClass = 'text-fg', hint, children }) {
  return (
    <div className="card min-w-0 p-4">
      <p className="truncate text-sm text-fg-muted">{label}</p>
      <p className={`mt-1 truncate text-2xl font-semibold tracking-tight tabular-nums ${valueClass}`}>
        {value}
      </p>
      {hint && <p className="mt-0.5 truncate text-xs text-fg-subtle">{hint}</p>}
      {children}
    </div>
  );
}