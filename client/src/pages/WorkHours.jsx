import { useState, useEffect } from 'react';
import { getSessions, deleteSession } from '../api/sessions.js';
import { getTasks } from '../api/tasks.js';
import { getCategories } from '../api/categories.js';
import { toISODateString, formatDisplayDate, addDaysToDate, formatDuration } from '../utils/dateUtils.js';
import WorkTimer from '../components/timer/WorkTimer.jsx';
import ManualSessionModal from '../components/timer/ManualSessionModal.jsx';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  CheckCircle2 
} from 'lucide-react';

export default function WorkHours() {
  const [selectedDate, setSelectedDate] = useState(toISODateString(new Date()));
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessRes, tasksRes, catsRes] = await Promise.all([
        getSessions(selectedDate),
        getTasks(selectedDate),
        getCategories()
      ]);
      if (sessRes.success) setSessions(sessRes.data);
      if (tasksRes.success) setTasks(tasksRes.data);
      if (catsRes.success) setCategories(catsRes.data);
    } catch (err) {
      console.error('Error fetching work hour data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Delete this work session?')) return;
    setSessions((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteSession(id);
      fetchData();
    } catch (err) {
      fetchData();
    }
  };

  // Planned vs. Actual Calculations (Section 6 of requirements)
  const plannedMinutes = tasks.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0);
  const workedMinutes = sessions.reduce((sum, s) => sum + Math.round((s.duration_seconds || 0) / 60), 0);
  const deltaMinutes = workedMinutes - plannedMinutes;
  const timeEfficiency = plannedMinutes > 0 ? Math.round((workedMinutes / plannedMinutes) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Date Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Work Hour Tracking</h1>
          <p className="text-sm text-gray-400">{formatDisplayDate(selectedDate)}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(addDaysToDate(selectedDate, -1))}
            className="p-2 rounded-lg bg-surface border border-border text-gray-300 hover:text-white cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedDate(toISODateString(new Date()))}
            className="px-3 py-2 rounded-lg bg-surface border border-border text-xs font-semibold text-gray-300 hover:text-white cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDate(addDaysToDate(selectedDate, 1))}
            className="p-2 rounded-lg bg-surface border border-border text-gray-300 hover:text-white cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Live Timer Widget */}
      <WorkTimer
        tasks={tasks}
        categories={categories}
        onSessionFinished={fetchData}
        onOpenManualModal={() => setIsManualModalOpen(true)}
      />

      {/* Planned vs. Actual Comparison Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Planned Work</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{formatDuration(plannedMinutes)}</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Actual Worked</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{formatDuration(workedMinutes)}</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Difference</span>
            {deltaMinutes >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className={`text-2xl font-bold ${deltaMinutes >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {deltaMinutes >= 0 ? `+${formatDuration(deltaMinutes)}` : `-${formatDuration(Math.abs(deltaMinutes))}`}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Time Efficiency</span>
            <span className="text-xs font-semibold text-primary-400">{timeEfficiency}%</span>
          </div>
          <div className="w-full bg-surface-elevated rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-primary-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, timeEfficiency)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recorded Work Sessions Timeline */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Recorded Sessions for this day ({sessions.length})
        </h2>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            No work sessions recorded for this day yet. Start the timer or log a manual session.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {sessions.map((s) => {
              const startStr = s.started_at ? new Date(s.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              const endStr = s.ended_at ? new Date(s.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now';
              const mins = Math.round((s.duration_seconds || 0) / 60);

              return (
                <div key={s.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-primary-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {s.task_title || s.notes || 'General Work Session'}
                        </span>
                        {s.category_name && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full border"
                            style={{
                              backgroundColor: `${s.category_color}15`,
                              borderColor: `${s.category_color}40`,
                              color: s.category_color
                            }}
                          >
                            {s.category_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">
                        {startStr} – {endStr} ({formatDuration(mins)})
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteSession(s.id)}
                    className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-surface-elevated rounded-lg transition-colors cursor-pointer"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Session Modal */}
      <ManualSessionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        selectedDate={selectedDate}
        tasks={tasks}
        categories={categories}
        onSessionSaved={fetchData}
      />
    </div>
  );
}