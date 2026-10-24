import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useTimer } from '../context/TimerContext.jsx';
import { getDashboardSummary } from '../api/reports.js';
import { createTask, toggleTaskStatus } from '../api/tasks.js';
import { toISODateString, formatDisplayDate, formatDuration } from '../utils/dateUtils.js';
import PageHeader from '../components/common/PageHeader.jsx';
import StatCard from '../components/common/StatCard.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';

const days = (n) => `${n} ${n === 1 ? 'day' : 'days'}`;

export default function Dashboard() {
  const { activeSession } = useTimer();
  const [summary, setSummary] = useState(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    try {
      const res = await getDashboardSummary();
      if (res.success) setSummary(res.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Could not load your summary. Please refresh.');
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
    setError('');
    try {
      await createTask({
        title: quickTitle.trim(),
        taskDate: toISODateString(new Date()),
        estimatedMinutes: 30,
        priority: 'medium',
      });
      setQuickTitle('');
      fetchSummary();
    } catch (err) {
      console.error('Failed to quick add task:', err);
      setError('Could not add the task. Try again.');
    }
  };

  const handleToggleTask = async (taskId) => {
    setError('');
    try {
      await toggleTaskStatus(taskId);
      fetchSummary();
    } catch (err) {
      console.error('Failed to toggle task:', err);
      setError('Could not update the task. Try again.');
    }
  };

  const todayStr = toISODateString(new Date());
  const tasks = summary?.tasks ?? [];
  const running = Boolean(activeSession?.is_running);
  const productivity = summary?.productivityRate || 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Today" subtitle={formatDisplayDate(todayStr)}>
        <p className="text-sm text-fg-muted">
          Streak{' '}
          <span className="font-medium text-fg">{days(summary?.currentStreak || 0)}</span>
          <span className="text-fg-subtle"> · Longest {days(summary?.longestStreak || 0)}</span>
        </p>
      </PageHeader>

      {error && (
        <div role="alert" className="alert-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Planned" value={formatDuration(summary?.plannedMinutes || 0)} />
        <StatCard label="Worked" value={formatDuration(summary?.workedMinutes || 0)} />
        <StatCard
          label="Tasks done"
          value={`${summary?.completedTasks || 0} / ${summary?.totalTasks || 0}`}
        />
        <StatCard label="Productivity" value={`${productivity}%`}>
          <ProgressBar value={productivity} label="Productivity" />
        </StatCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-medium text-fg">Today's tasks</h2>
            <Link to="/schedule" className="link text-sm">
              Open schedule
            </Link>
          </div>

          <div className="p-5">
            <form onSubmit={handleQuickAdd} className="flex gap-2">
              <input
                type="text"
                aria-label="New task"
                placeholder="Add a task for today"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="input min-w-0 flex-1"
              />
              <button type="submit" disabled={!quickTitle.trim()} className="btn-primary shrink-0">
                Add
              </button>
            </form>

            {loading ? (
              <p className="py-8 text-center text-sm text-fg-subtle">Loading…</p>
            ) : tasks.length === 0 ? (
              <p className="py-8 text-center text-sm text-fg-subtle">No tasks for today yet.</p>
            ) : (
              <ul className="mt-2 divide-y divide-border">
                {tasks.map((t) => {
                  const done = t.status === 'completed';
                  return (
                    <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={done}
                          aria-label={`Mark "${t.title}" as ${done ? 'not done' : 'done'}`}
                          onClick={() => handleToggleTask(t.id)}
                          className={`flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors ${
                            done
                              ? 'border-accent bg-accent text-accent-fg'
                              : 'border-border-strong bg-surface hover:border-accent'
                          }`}
                        >
                          {done && <Check className="h-3 w-3" strokeWidth={3} />}
                        </button>
                        <span className={`truncate text-sm ${done ? 'text-fg-subtle line-through' : 'text-fg'}`}>
                          {t.title}
                        </span>
                      </div>
                      <span className="shrink-0 text-xs tabular-nums text-fg-subtle">
                        {formatDuration(t.estimated_minutes)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="card self-start p-5">
          <h2 className="text-sm font-medium text-fg">Work timer</h2>
          {running ? (
            <p className="mt-1 flex items-center gap-2 text-sm text-fg-muted">
              <span className="h-2 w-2 shrink-0 rounded-full bg-success" aria-hidden="true" />
              <span className="truncate">{activeSession.task_title || 'Unlinked session'}</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-fg-muted">No session running.</p>
          )}
          <Link to="/timer" className="btn-primary mt-4 w-full">
            {running ? 'Open timer' : 'Start timer'}
          </Link>
          <Link to="/reports" className="link mt-3 inline-block text-sm">
            View reports
          </Link>
        </section>
      </div>
    </div>
  );
}