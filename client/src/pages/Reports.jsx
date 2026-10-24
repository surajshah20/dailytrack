import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getWeeklyReport, getMonthlyReport } from '../api/reports.js';
import { toISODateString, addDaysToDate, formatDuration } from '../utils/dateUtils.js';
import PageHeader from '../components/common/PageHeader.jsx';
import PeriodNav from '../components/common/PeriodNav.jsx';
import StatCard from '../components/common/StatCard.jsx';

// Recharts takes plain color values, so these mirror the theme tokens in index.css.
const COLORS = { accent: '#2563eb', neutral: '#cbd5e1', axis: '#6b7280', grid: '#e5e7eb' };
const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  boxShadow: 'none',
  fontSize: 12,
};
const axisProps = { stroke: COLORS.axis, fontSize: 12, tickLine: false, axisLine: false };
const chartMargin = { top: 8, right: 8, left: -16, bottom: 0 };

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatShort = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

function getMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  return toISODateString(d);
}

function ChartCard({ title, height = 'h-64', children }) {
  return (
    <section className="card p-5">
      <h2 className="mb-4 text-sm font-medium text-fg">{title}</h2>
      <div className={`${height} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default function Reports() {
  const [tab, setTab] = useState('weekly');

  const [weekStart, setWeekStart] = useState(() => getMonday());
  const [weeklyData, setWeeklyData] = useState(null);

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [monthlyData, setMonthlyData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tab !== 'weekly') return;
    let active = true;
    setLoading(true);
    setError('');
    getWeeklyReport(weekStart)
      .then((res) => {
        if (active && res.success) setWeeklyData(res.data);
      })
      .catch(() => {
        if (active) setError('Could not load the weekly report.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tab, weekStart]);

  useEffect(() => {
    if (tab !== 'monthly') return;
    let active = true;
    setLoading(true);
    setError('');
    getMonthlyReport(currentYear, currentMonth)
      .then((res) => {
        if (active && res.success) setMonthlyData(res.data);
      })
      .catch(() => {
        if (active) setError('Could not load the monthly report.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tab, currentYear, currentMonth]);

  const handleMonthChange = (offset) => {
    let nextMonth = currentMonth + offset;
    let nextYear = currentYear;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    } else if (nextMonth < 1) {
      nextMonth = 12;
      nextYear--;
    }
    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
  };

  const tabButton = (id, label) => (
    <button
      type="button"
      aria-pressed={tab === id}
      onClick={() => setTab(id)}
      className={`h-8 cursor-pointer rounded px-3 text-sm font-medium transition-colors ${
        tab === id ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
      }`}
    >
      {label}
    </button>
  );

  const days = weeklyData?.days ?? [];
  const categories = monthlyData?.categoryDistribution ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Planned time compared with what you actually did.">
        <div className="inline-flex rounded-md border border-border bg-muted p-0.5">
          {tabButton('weekly', 'Weekly')}
          {tabButton('monthly', 'Monthly')}
        </div>
      </PageHeader>

      {error && (
        <div role="alert" className="alert-error">
          {error}
        </div>
      )}

      {tab === 'weekly' && (
        <div className="space-y-6">
          <PeriodNav
            label={`${formatShort(weekStart)} – ${formatShort(addDaysToDate(weekStart, 6))}`}
            onPrev={() => setWeekStart(addDaysToDate(weekStart, -7))}
            onNext={() => setWeekStart(addDaysToDate(weekStart, 7))}
            prevLabel="Previous week"
            nextLabel="Next week"
          />

          {loading && !weeklyData ? (
            <p className="py-12 text-center text-sm text-fg-subtle">Loading…</p>
          ) : weeklyData ? (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatCard
                  label="Tasks done"
                  value={`${weeklyData.completedTasks} / ${weeklyData.totalTasks}`}
                  hint={`${weeklyData.completionRate}% complete`}
                />
                <StatCard
                  label="Worked"
                  value={formatDuration(weeklyData.totalWorkedMinutes)}
                  hint={`Planned ${formatDuration(weeklyData.totalPlannedMinutes)}`}
                />
                <StatCard
                  label="Daily average"
                  value={formatDuration(weeklyData.avgDailyWorkedMinutes)}
                  hint="Across 7 days"
                />
                <StatCard label="Best day" value={weeklyData.mostProductiveDay || '—'} hint="Most time worked" />
              </div>

              <ChartCard title="Planned vs actual hours" height="h-72">
                <BarChart data={days} margin={chartMargin}>
                  <CartesianGrid stroke={COLORS.grid} vertical={false} />
                  <XAxis dataKey="dayName" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f3f4f6' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="plannedHours" name="Planned (h)" fill={COLORS.neutral} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="actualHours" name="Worked (h)" fill={COLORS.accent} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ChartCard>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <ChartCard title="Tasks completed per day">
                  <BarChart data={days} margin={chartMargin}>
                    <CartesianGrid stroke={COLORS.grid} vertical={false} />
                    <XAxis dataKey="dayName" {...axisProps} />
                    <YAxis {...axisProps} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f3f4f6' }} />
                    <Bar dataKey="completedTasks" name="Completed" fill={COLORS.accent} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ChartCard>

                <ChartCard title="Daily productivity (%)">
                  <LineChart data={days} margin={chartMargin}>
                    <CartesianGrid stroke={COLORS.grid} vertical={false} />
                    <XAxis dataKey="dayName" {...axisProps} />
                    <YAxis {...axisProps} domain={[0, 100]} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="productivityRate"
                      name="Productivity %"
                      stroke={COLORS.accent}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ChartCard>
              </div>
            </>
          ) : null}
        </div>
      )}

      {tab === 'monthly' && (
        <div className="space-y-6">
          <PeriodNav
            label={`${MONTH_NAMES[currentMonth - 1]} ${currentYear}`}
            onPrev={() => handleMonthChange(-1)}
            onNext={() => handleMonthChange(1)}
            prevLabel="Previous month"
            nextLabel="Next month"
          />

          {loading && !monthlyData ? (
            <p className="py-12 text-center text-sm text-fg-subtle">Loading…</p>
          ) : monthlyData ? (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatCard
                  label="Total worked"
                  value={formatDuration(monthlyData.totalWorkedMinutes)}
                  hint="This month"
                />
                <StatCard
                  label="Tasks done"
                  value={`${monthlyData.completedTasks} / ${monthlyData.totalTasks}`}
                  hint={`${monthlyData.completionRate}% complete`}
                />
                <StatCard
                  label="Daily average"
                  value={formatDuration(monthlyData.avgDailyWorkedMinutes)}
                  hint="Across the full month"
                />
                <StatCard
                  label="Top category"
                  value={monthlyData.mostProductiveCategory || '—'}
                  hint="Most hours logged"
                />
              </div>

              <section className="card">
                <div className="border-b border-border px-5 py-3.5">
                  <h2 className="text-sm font-medium text-fg">Time by category</h2>
                </div>

                {categories.length === 0 ? (
                  <p className="py-12 text-center text-sm text-fg-muted">
                    No categorized sessions in {MONTH_NAMES[currentMonth - 1]}.
                  </p>
                ) : (
                  <ul className="space-y-4 p-5">
                    {categories.map((cat) => (
                      <li key={cat.name}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="flex min-w-0 items-center gap-2 text-fg">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: cat.color || COLORS.accent }}
                              aria-hidden="true"
                            />
                            <span className="truncate">{cat.name}</span>
                          </span>
                          <span className="shrink-0 tabular-nums text-fg-muted">
                            {cat.hours}h · {cat.percentage}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${cat.percentage}%`, backgroundColor: cat.color || COLORS.accent }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}