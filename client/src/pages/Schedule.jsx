import { useState, useEffect } from 'react';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  toggleTaskStatus, 
  deleteTask 
} from '../api/tasks.js';
import { getCategories } from '../api/categories.js';
import { 
  toISODateString, 
  formatDisplayDate, 
  addDaysToDate, 
  formatDuration 
} from '../utils/dateUtils.js';
import TaskItem from '../components/schedule/TaskItem.jsx';
import TaskModal from '../components/schedule/TaskModal.jsx';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  ListTodo 
} from 'lucide-react';

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(toISODateString(new Date()));
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Load tasks and categories when the selected date changes
  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, catsRes] = await Promise.all([
        getTasks(selectedDate),
        getCategories()
      ]);
      if (tasksRes.success) setTasks(tasksRes.data);
      if (catsRes.success) setCategories(catsRes.data);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // Task Mutations
  const handleToggle = async (taskId) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      )
    );
    try {
      await toggleTaskStatus(taskId);
    } catch (error) {
      fetchData(); // Rollback if network fails
    }
  };

  const handleSaveTask = async (taskPayload) => {
    if (taskToEdit) {
      await updateTask(taskToEdit.id, taskPayload);
    } else {
      await createTask(taskPayload);
    }
    fetchData();
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await deleteTask(taskId);
    } catch (error) {
      fetchData();
    }
  };

  // Calculations for top metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const remainingTasks = totalTasks - completedTasks;
  const plannedMinutes = tasks.reduce((acc, t) => acc + (t.estimated_minutes || 0), 0);
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Date Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Daily Schedule</h1>
          <p className="text-sm text-gray-400">{formatDisplayDate(selectedDate)}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(addDaysToDate(selectedDate, -1))}
            className="p-2 rounded-lg bg-surface border border-border text-gray-300 hover:text-white hover:bg-surface-elevated transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(toISODateString(new Date()))}
            className="px-3 py-2 rounded-lg bg-surface border border-border text-xs font-semibold text-gray-300 hover:text-white hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            Today
          </button>

          <button
            onClick={() => setSelectedDate(addDaysToDate(selectedDate, 1))}
            className="p-2 rounded-lg bg-surface border border-border text-gray-300 hover:text-white hover:bg-surface-elevated transition-colors cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-surface border border-border rounded-lg px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-primary-500 cursor-pointer"
            />
          </div>

          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg px-4 py-2 text-sm shadow-lg shadow-primary-600/20 transition-all cursor-pointer ml-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Daily Snapshot Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Tasks</span>
            <ListTodo className="w-4 h-4 text-primary-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalTasks}</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{completedTasks}</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Planned Work</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{formatDuration(plannedMinutes)}</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Progress</span>
            <span className="text-xs font-semibold text-primary-400">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-surface-elevated rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-primary-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tasks List Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Tasks for this day ({remainingTasks} remaining)
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400">Loading daily tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-surface/30">
            <CalendarIcon className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-white mb-1">No tasks planned for this day</h3>
            <p className="text-xs text-gray-400 mb-4 max-w-sm mx-auto">
              Design your schedule by adding your planned tasks and estimated hours.
            </p>
            <button
              onClick={() => {
                setTaskToEdit(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-elevated border border-border text-xs font-medium text-white hover:border-primary-500 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-primary-400" />
              Add First Task
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={(task) => {
                  setTaskToEdit(task);
                  setIsModalOpen(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Create / Edit Modal */}
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