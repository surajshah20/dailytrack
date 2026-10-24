export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center text-lg font-semibold tracking-tight text-fg">
          DailyTrack
        </div>

        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight text-fg">{title}</h1>
          {subtitle && <p className="mt-1 mb-6 text-sm text-fg-muted">{subtitle}</p>}
          {children}
        </div>

        {footer && <p className="mt-6 text-center text-sm text-fg-muted">{footer}</p>}
      </div>
    </div>
  );
}