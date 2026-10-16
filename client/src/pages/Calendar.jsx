import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCalendarData } from '../api/calendar.js';
import { formatDuration } from '../utils/dateUtils.js';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  ArrowRight 
} from 'lucide-react';

const TIER_COLORS = {
  high: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:border-emerald-400',
  average: 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:border-amber-400',
  low: 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:border-rose-400',
  none: 'bg-surface border-border text-gray-500 hover:border-gray-500'
};

const TIER_DOTS = {
  high: 'bg-emerald-400',
  average: 'bg-amber-400',
  low: 'bg-rose-400',
  none: 'bg-transparent'
};

export default function Calendar() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await getCalendarData(currentYear, currentMonth);
      if (res.success) setCalendarData(res.data.days);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate day-of-week offset for the 1st day of the month
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Productivity Calendar</h1>
          <p className="text-sm text-gray-400">Monthly overview with visual productivity tiers.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-3 text-xs text-gray-400 bg-surface border border-border px-3 py-1.5 rounded-xl">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> High (≥80%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Avg (50-79%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Low (&lt;50%)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMonthChange(-1)}
              className="p-2 rounded-lg bg-surface border border-border text-gray-300 hover:text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-white px-2">
              {monthNames[currentMonth - 1]} {currentYear}
            </span>
            <button
              onClick={() => handleMonthChange(1)}
              className="p-2 rounded-lg bg-surface border border-border text-gray-300 hover:text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty padding cells for start of month */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-28 rounded-xl bg-surface/20 border border-transparent" />
        ))}

        {calendarData.map((d) => (
          <div
            key={d.date}
            onClick={() => navigate(`/schedule`)}
            className={`h-28 rounded-xl p-2.5 border transition-all flex flex-col justify-between cursor-pointer group ${
              TIER_COLORS[d.productivityTier]
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white group-hover:text-primary-400">
                {d.day}
              </span>
              <span className={`w-2 h-2 rounded-full ${TIER_DOTS[d.productivityTier]}`} />
            </div>

            <div className="space-y-1 text-[11px]">
              {d.totalTasks > 0 && (
                <div className="flex items-center gap-1 text-gray-300 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-primary-400" />
                  <span>{d.completedTasks}/{d.totalTasks} tasks</span>
                </div>
              )}

              {d.workedMinutes > 0 && (
                <div className="flex items-center gap-1 text-emerald-400 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(d.workedMinutes)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}