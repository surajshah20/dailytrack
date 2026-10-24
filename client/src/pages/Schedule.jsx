import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, toggleTaskStatus, deleteTask } from '../api/tasks.js';
import { getCategories } from '../api/categories.js';
import { toISODateString, formatDisplayDate, formatDuration } from '../utils/dateUtils.js';
import PageHeader from '../components/common/PageHeader.jsx';
import DateNavigator from '../components/common/DateNavigator.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import TaskItem from '../components/schedule/TaskItem.jsx';
import TaskModal from '../components/schedule/TaskModal.jsx';
import DailyReflection from '../components/reflection/DailyReflection.jsx';
import { useSearchParams } from 'react-router-dom';

export default function Schedule() {
  const [searchParams] = useSearchParams();
const [selectedDate, setSelectedDate] = useState(() => {
  const fromUrl = searchParams.get('date');
  return fromUrl && /^\d{4}-\d{2}-\d{2}$/.test(fromUrl) ? fromUrl : toISODateString(new Date());
});
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, catsRes] = await Promise.all([getTasks(selectedDate), getCategories()]);
      if (tasksRes.success) setTasks(tasksRes.data);
      if (catsRes.success) setCategories(catsRes.data);
      setError('');
    } catch (err) {
      console.error('Error fetching schedule data:', err);
      setError('Could not load tasks. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const openCreate = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const openEdit = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleToggle = async (taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t,
      ),
    );
    try {
      await toggleTaskStatus(taskId);
    } catch {
      fetchData();
    }
  };

  const handleSaveTask = async (payload) => {
    if (taskToEdit) {
      await updateTask(taskToEdit.id, payload);
    } else {
      await createTask(payload);
    }
    fetchData();
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await deleteTask(taskId);
    } catch {
      fetchData();
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const remainingTasks = totalTasks - completedTasks;
  const plannedMinutes = tasks.reduce((acc, t) => acc + (t.estimated_minutes || 0), 0);
  const completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Schedule" subtitle={formatDisplayDate(selectedDate)}>
        <DateNavigator value={selectedDate} onChange={setSelectedDate} />
        <button type="button" onClick={openCreate} className="btn-primary w-full sm:w-auto">
          Add task
        </button>
      </PageHeader>

      {error && (
        <div role="alert" className="alert-error">
          {error}
        </div>
      )}

      {totalTasks > 0 && (
        <div className="card p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm">
            <p>
              <span className="font-medium tabular-nums text-fg">
                {completedTasks} of {totalTasks}
              </span>{' '}
              <span className="text-fg-muted">tasks done</span>
            </p>
            <p className="text-fg-muted">{formatDuration(plannedMinutes)} planned</p>
          </div>
          <ProgressBar value={completion} label="Tasks completed" />
        </div>
      )}

      <section className="card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-medium text-fg">Tasks</h2>
          {totalTasks > 0 && <span className="text-sm text-fg-subtle">{remainingTasks} remaining</span>}
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-fg-subtle">Loading…</p>
        ) : totalTasks === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-fg-muted">No tasks for this day.</p>
            <button type="button" onClick={openCreate} className="btn-secondary mt-4">
              Add task
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </section>

      <DailyReflection selectedDate={selectedDate} />

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        categories={categories}
        selectedDate={selectedDate}
      />
    </div>
  );
}