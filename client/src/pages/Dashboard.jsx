import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTimer } from '../context/TimerContext.jsx';
import { getDashboardSummary } from '../api/reports.js';
import { createTask, toggleTaskStatus } from '../api/tasks.js';
import { toISODateString, formatDisplayDate, formatDuration } from '../utils/dateUtils.js';
import { 
  Flame, 
  Target, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Play, 
  Check 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { activeSession, elapsedSeconds } = useTimer();
  const [summary, setSummary] = useState(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const res = await getDashboardSummary();
      if (res.success) setSummary(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    try {
      await createTask({
        title: quickTitle.trim(),
        taskDate: toISODateString(new Date()),
        estimatedMinutes: 30,
        priority: 'medium'
      });
      setQuickTitle('');
      fetchSummary();
    } catch (err) {
      console.error('Failed to quick add task:', err);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      await toggleTaskStatus(taskId);
      fetchSummary();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const todayStr = toISODateString(new Date());

  return (
    <div className="space-y-6">
      {/* Welcome & Streak Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
            Good day, {user?.display_name || 'Productivity Champ'}
          </h1>
          <p className="text-sm text-gray-400">{formatDisplayDate(todayStr)}</p>
        </div>

        {/* Streak Counter Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl text-amber-400">
            <Flame className="w-5 h-5 fill-amber-400 animate-pulse" />
            <div>
              <span className="text-base font-bold">{summary?.currentStreak || 0}</span>
              <span className="text-xs text-amber-300/80 ml-1.5 font-medium">Day Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Work Session Banner (if running) */}
      {activeSession?.is_running && (
        <div className="bg-gradient-to-r from-primary-900/40 via-surface to-surface border border-primary-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-400">Work Session Active</span>
              <p className="text-sm font-medium text-white">{activeSession.task_title || 'Unlinked Session'}</p>
            </div>
          </div>
          <Link
            to="/timer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-medium transition-colors"
          >
            Open Timer <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Planned Work</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatDuration(summary?.plannedMinutes || 0)}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Actual Worked</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {formatDuration(summary?.workedMinutes || 0)}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Tasks Done</span>
            <CheckCircle2 className="w-4 h-4 text-primary-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {summary?.completedTasks || 0} / {summary?.totalTasks || 0}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Productivity</span>
            <span className="text-xs font-bold text-primary-400">{summary?.productivityRate || 0}%</span>
          </div>
          <div className="w-full bg-surface-elevated rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-primary-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${summary?.productivityRate || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Add Task & Today's Schedule Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Add & Tasks List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Quick Add Task for Today
            </h2>

            <form onSubmit={handleQuickAdd} className="flex gap-2">
              <input
                type="text"
                placeholder="What needs to get done today?"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="flex-1 bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl px-5 py-2.5 text-sm flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Today's Planned Tasks
              </h2>
              <Link to="/schedule" className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1">
                View Full Schedule <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading today's schedule...</div>
            ) : summary?.tasks?.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No tasks planned for today yet. Use quick add above or head to your Daily Schedule.
              </div>
            ) : (
              <div className="space-y-2">
                {summary?.tasks?.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTask(t.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${
                          t.status === 'completed'
                            ? 'bg-primary-600 border-primary-500 text-white'
                            : 'border-gray-500 bg-surface'
                        }`}
                      >
                        {t.status === 'completed' && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <span className={`text-sm ${t.status === 'completed' ? 'line-through text-gray-400' : 'text-white'}`}>
                        {t.title}
                      </span>
                    </div>

                    <span className="text-xs text-gray-400 font-mono">
                      {formatDuration(t.estimated_minutes)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Actions & Streak Stats */}
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/timer"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated border border-border text-xs text-white hover:border-primary-500 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>Start Work Timer</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>

              <Link
                to="/reports"
                className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated border border-border text-xs text-white hover:border-primary-500 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span>View Weekly Analytics</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Streak Milestone</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Current Streak:</span>
                <span className="font-bold text-amber-400">{summary?.currentStreak || 0} days</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Longest Streak:</span>
                <span className="font-bold text-white">{summary?.longestStreak || 0} days</span>
              </div>
              <p className="text-[11px] text-gray-500 pt-2 border-t border-border">
                Tip: Complete at least 1 task or log 1 work session each day to maintain your streak.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}