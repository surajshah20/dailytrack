import { useState, useEffect } from 'react';
import { getWeeklyReport, getMonthlyReport } from '../api/reports.js';
import { toISODateString, addDaysToDate, formatDuration } from '../utils/dateUtils.js';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  ChevronLeft, 
  ChevronRight, 
  BarChart3, 
  Flame, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';

export default function Reports() {
  const [tab, setTab] = useState('weekly'); // 'weekly' | 'monthly'

  // Weekly State
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    // Default to last Monday
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diff));
    return toISODateString(mon);
  });
  const [weeklyData, setWeeklyData] = useState(null);

  // Monthly State
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [monthlyData, setMonthlyData] = useState(null);

  const [loading, setLoading] = useState(true);

  // Load Weekly Data
  useEffect(() => {
    if (tab === 'weekly') {
      setLoading(true);
      getWeeklyReport(weekStart)
        .then((res) => {
          if (res.success) setWeeklyData(res.data);
        })
        .finally(() => setLoading(false));
    }
  }, [tab, weekStart]);

  // Load Monthly Data
  useEffect(() => {
    if (tab === 'monthly') {
      setLoading(true);
      getMonthlyReport(currentYear, currentMonth)
        .then((res) => {
          if (res.success) setMonthlyData(res.data);
        })
        .finally(() => setLoading(false));
    }
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Reports & Analytics</h1>
          <p className="text-sm text-gray-400">Review your planned vs actual execution trends.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-surface border border-border p-1 rounded-xl">
          <button
            onClick={() => setTab('weekly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'weekly' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Weekly Report
          </button>
          <button
            onClick={() => setTab('monthly')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'monthly' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly Report
          </button>
        </div>
      </div>

      {/* WEEKLY REPORT VIEW */}
      {tab === 'weekly' && (
        <div className="space-y-6">
          {/* Week Navigator */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">
              {weeklyData?.startDate} to {weeklyData?.endDate}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekStart(addDaysToDate(weekStart, -7))}
                className="p-1.5 rounded-lg bg-surface border border-border text-gray-300 hover:text-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setWeekStart(addDaysToDate(weekStart, 7))}
                className="p-1.5 rounded-lg bg-surface border border-border text-gray-300 hover:text-white cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface border border-border rounded-xl p-4">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Tasks Completed</span>
              <div className="text-2xl font-bold text-white">
                {weeklyData?.completedTasks || 0} / {weeklyData?.totalTasks || 0}
              </div>
              <span className="text-xs text-primary-400 font-medium">{weeklyData?.completionRate || 0}% Completion</span>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Actual Worked</span>
              <div className="text-2xl font-bold text-emerald-400">
                {formatDuration(weeklyData?.totalWorkedMinutes || 0)}
              </div>
              <span className="text-xs text-gray-400 font-medium">Planned: {formatDuration(weeklyData?.totalPlannedMinutes || 0)}</span>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Avg Daily Work</span>
              <div className="text-2xl font-bold text-blue-400">
                {formatDuration(weeklyData?.avgDailyWorkedMinutes || 0)}
              </div>
              <span className="text-xs text-gray-400">Across 7 Days</span>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Most Productive</span>
              <div className="text-2xl font-bold text-amber-400">
                {weeklyData?.mostProductiveDay || 'N/A'}
              </div>
              <span className="text-xs text-gray-400">Peak Work Output</span>
            </div>
          </div>

          {/* Chart 1: Planned vs Actual Hours */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Planned vs Actual Work Hours (Hours)
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData?.days || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="dayName" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.75rem' }}
                    itemStyle={{ color: '#F3F4F6', fontSize: '12px' }}
                  />
                  <Legend />
                  <Bar dataKey="plannedHours" name="Planned (h)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actualHours" name="Actual Worked (h)" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Tasks Completed & Productivity Trend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Tasks Completed Per Day
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData?.days || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="dayName" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.75rem' }}
                      itemStyle={{ color: '#F3F4F6', fontSize: '12px' }}
                    />
                    <Bar dataKey="completedTasks" name="Completed Tasks" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Daily Productivity Percentage (%)
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData?.days || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="dayName" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.75rem' }}
                      itemStyle={{ color: '#F3F4F6', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="productivityRate" name="Productivity %" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MONTHLY REPORT VIEW */}
      {tab === 'monthly' && (
        <div className="space-y-6">
          {/* Month Navigator */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">
              {monthNames[currentMonth - 1]} {currentYear}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMonthChange(-1)}
                className="p-1.5 rounded-lg bg-surface border border-border text-gray-300 hover:text-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleMonthChange(1)}
                className="p-1.5 rounded-lg bg-surface border border-border text-gray-300 hover:text-white cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface border border-border rounded-xl p-4">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Total Worked</span>
              <div className="text-2xl font-bold text-emerald-400">
                {formatDuration(monthlyData?.totalWorkedMinutes || 0)}
              </div>
              <span className="text-xs text-gray-400">This Month</span>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Tasks Completed</span>
              <div className="text-2xl font-bold text-white">
                {monthlyData?.completedTasks || 0} / {monthlyData?.totalTasks || 0}
              </div>
              <span className="text-xs text-primary-400 font-medium">{monthlyData?.completionRate || 0}% Completion</span>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Daily Average</span>
              <div className="text-2xl font-bold text-blue-400">
                {formatDuration(monthlyData?.avgDailyWorkedMinutes || 0)}
              </div>
              <span className="text-xs text-gray-400">Across Full Month</span>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1">Top Category</span>
              <div className="text-2xl font-bold text-primary-400 truncate">
                {monthlyData?.mostProductiveCategory || 'None'}
              </div>
              <span className="text-xs text-gray-400">Most Logged Hours</span>
            </div>
          </div>

          {/* Category Time Distribution */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Category Time Distribution
            </h3>

            {monthlyData?.categoryDistribution?.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No categorical work sessions recorded in {monthNames[currentMonth - 1]}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={monthlyData?.categoryDistribution || []}
                        dataKey="minutes"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                      >
                        {monthlyData?.categoryDistribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#6366F1'} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.75rem' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {monthlyData?.categoryDistribution?.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-white font-medium">{cat.name}</span>
                      </div>
                      <div className="text-gray-400 font-mono">
                        {cat.hours}h ({cat.percentage}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}