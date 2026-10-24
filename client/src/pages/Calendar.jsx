import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCalendarData } from '../api/calendar.js';
import { toISODateString, formatDuration } from '../utils/dateUtils.js';
import PageHeader from '../components/common/PageHeader.jsx';
import PeriodNav from '../components/common/PeriodNav.jsx';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TIER = {
  high: { cell: 'border-success/30 bg-success-subtle', dot: 'bg-success' },
  average: { cell: 'border-warning/30 bg-warning-subtle', dot: 'bg-warning' },
  low: { cell: 'border-danger/30 bg-danger-subtle', dot: 'bg-danger' },
  none: { cell: 'border-border bg-surface', dot: 'bg-transparent' },
};

export default function Calendar() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getCalendarData(currentYear, currentMonth)
      .then((res) => {
        if (active && res.success) setCalendarData(res.data.days);
      })
      .catch(() => {
        if (active) setError('Could not load the calendar. Please refresh.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentYear, currentMonth]);

  const handleMonthChange = (offset) => {
    let nextM = currentMonth + offset;
    let nextY = currentYear;
    if (nextM > 12) {
      nextM = 1;
      nextY++;
    } else if (nextM < 1) {
      nextM = 12;
      nextY--;
    }
    setCurrentMonth(nextM);
    setCurrentYear(nextY);
  };

  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();
  const todayStr = toISODateString(new Date());

  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" subtitle="Tasks and work hours for each day.">
        <PeriodNav
          label={`${MONTH_NAMES[currentMonth - 1]} ${currentYear}`}
          onPrev={() => handleMonthChange(-1)}
          onNext={() => handleMonthChange(1)}
          prevLabel="Previous month"
          nextLabel="Next month"
        />
      </PageHeader>

      {error && (
        <div role="alert" className="alert-error">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-fg-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" /> 80% or more
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" /> 50–79%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-danger" aria-hidden="true" /> Under 50%
        </span>
      </div>

      <div>
        <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-xs text-fg-subtle sm:gap-2">
          {WEEKDAYS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className={`grid grid-cols-7 gap-1.5 sm:gap-2 ${loading ? 'opacity-60' : ''}`}>
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} aria-hidden="true" />
          ))}

          {calendarData.map((d) => {
            const tier = TIER[d.productivityTier] ?? TIER.none;
            const isToday = d.date === todayStr;

            return (
              <button
                key={d.date}
                type="button"
                onClick={() => navigate(`/schedule?date=${d.date}`)}
                aria-label={`${MONTH_NAMES[currentMonth - 1]} ${d.day}: ${d.completedTasks} of ${d.totalTasks} tasks done, ${formatDuration(d.workedMinutes)} worked`}
                className={`flex min-h-16 cursor-pointer flex-col justify-between rounded-md border p-1.5 text-left transition-colors hover:border-border-strong sm:min-h-24 sm:p-2.5 ${tier.cell} ${
                  isToday ? 'ring-1 ring-accent' : ''
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="text-sm font-medium tabular-nums text-fg">{d.day}</span>
                  <span className={`h-2 w-2 rounded-full ${tier.dot}`} aria-hidden="true" />
                </span>

                <span className="hidden space-y-0.5 text-xs text-fg-muted sm:block">
                  {d.totalTasks > 0 && (
                    <span className="block tabular-nums">
                      {d.completedTasks}/{d.totalTasks} tasks
                    </span>
                  )}
                  {d.workedMinutes > 0 && (
                    <span className="block tabular-nums">{formatDuration(d.workedMinutes)}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}