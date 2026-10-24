import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { getSessions, deleteSession } from '../api/sessions.js';
import { getTasks } from '../api/tasks.js';
import { getCategories } from '../api/categories.js';
import { toISODateString, formatDisplayDate, formatDuration } from '../utils/dateUtils.js';
import PageHeader from '../components/common/PageHeader.jsx';
import DateNavigator from '../components/common/DateNavigator.jsx';
import StatCard from '../components/common/StatCard.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import WorkTimer from '../components/timer/WorkTimer.jsx';
import ManualSessionModal from '../components/timer/ManualSessionModal.jsx';

const timeOf = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function WorkHours() {
  const [selectedDate, setSelectedDate] = useState(toISODateString(new Date()));
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessRes, tasksRes, catsRes] = await Promise.all([
        getSessions(selectedDate),
        getTasks(selectedDate),
        getCategories(),
      ]);
      if (sessRes.success) setSessions(sessRes.data);
      if (tasksRes.success) setTasks(tasksRes.data);
      if (catsRes.success) setCategories(catsRes.data);
      setError('');
    } catch (err) {
      console.error('Error fetching work hour data:', err);
      setError('Could not load work hours. Please refresh.');
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
    } catch {
      setError('Could not delete the session.');
    }
    fetchData();
  };

  const plannedMinutes = tasks.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0);
  const workedMinutes = sessions.reduce((sum, s) => sum + Math.round((s.duration_seconds || 0) / 60), 0);
  const deltaMinutes = workedMinutes - plannedMinutes;
  const efficiency = plannedMinutes > 0 ? Math.round((workedMinutes / plannedMinutes) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Work hours" subtitle={formatDisplayDate(selectedDate)}>
        <DateNavigator value={selectedDate} onChange={setSelectedDate} />
      </PageHeader>

      {error && (
        <div role="alert" className="alert-error">
          {error}
        </div>
      )}

      <WorkTimer
        tasks={tasks}
        categories={categories}
        onSessionFinished={fetchData}
        onOpenManualModal={() => setIsManualModalOpen(true)}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Planned" value={formatDuration(plannedMinutes)} />
        <StatCard label="Worked" value={formatDuration(workedMinutes)} />
        <StatCard
          label="Difference"
          value={`${deltaMinutes >= 0 ? '+' : '-'}${formatDuration(Math.abs(deltaMinutes))}`}
          valueClass={deltaMinutes >= 0 ? 'text-success' : 'text-warning'}
        />
        <StatCard label="Time used" value={`${efficiency}%`}>
          <ProgressBar value={efficiency} label="Planned time used" />
        </StatCard>
      </div>

      <section className="card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-medium text-fg">Sessions</h2>
          {sessions.length > 0 && <span className="text-sm text-fg-subtle">{sessions.length} recorded</span>}
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-fg-subtle">Loading…</p>
        ) : sessions.length === 0 ? (
          <p className="py-12 text-center text-sm text-fg-muted">
            No sessions for this day. Start the timer or log one manually.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {sessions.map((s) => {
              const start = s.started_at ? timeOf(s.started_at) : '';
              const end = s.ended_at ? timeOf(s.ended_at) : 'now';
              const mins = Math.round((s.duration_seconds || 0) / 60);
              const label = s.task_title || s.notes || 'General work';

              return (
                <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-fg">{label}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-subtle">
                      <span className="tabular-nums">
                        {start} – {end} · {formatDuration(mins)}
                      </span>
                      {s.category_name && (
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: s.category_color || 'currentColor' }}
                            aria-hidden="true"
                          />
                          {s.category_name}
                        </span>
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSession(s.id)}
                    aria-label={`Delete session "${label}"`}
                    title="Delete"
                    className="btn-ghost h-8 w-8 shrink-0 px-0 hover:!text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

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