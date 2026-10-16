import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSave, taskToEdit, categories, selectedDate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setCategoryId(taskToEdit.category_id || '');
      setPriority(taskToEdit.priority || 'medium');
      setStartTime(taskToEdit.start_time || '');
      setEndTime(taskToEdit.end_time || '');
      setEstimatedMinutes(taskToEdit.estimated_minutes || 0);
    } else {
      setTitle('');
      setDescription('');
      setCategoryId(categories[0]?.id || '');
      setPriority('medium');
      setStartTime('');
      setEndTime('');
      setEstimatedMinutes(30);
    }
  }, [taskToEdit, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        taskDate: selectedDate,
        categoryId: categoryId || null,
        priority,
        startTime: startTime || null,
        endTime: endTime || null,
        estimatedMinutes: parseInt(estimatedMinutes, 10) || 0
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          <h3 className="text-lg font-bold text-white">
            {taskToEdit ? 'Edit Task' : 'New Planned Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Title *</label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build authentication middleware"
              className="w-full bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Description / Notes</label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key objectives or links..."
              className="w-full bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Estimated (Mins)</label>
              <input
                type="number"
                min="0"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-surface-elevated transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-medium rounded-lg px-5 py-2 text-sm transition-colors cursor-pointer"
            >
              {submitting ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}