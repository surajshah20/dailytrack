import { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';

export default function TaskModal({ isOpen, onClose, onSave, taskToEdit, categories, selectedDate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setError('');
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
        estimatedMinutes: parseInt(estimatedMinutes, 10) || 0,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the task. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onClose} className="btn-secondary">
        Cancel
      </button>
      <button type="submit" form="task-form" disabled={submitting} className="btn-primary">
        {submitting ? 'Saving…' : taskToEdit ? 'Save changes' : 'Create task'}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={taskToEdit ? 'Edit task' : 'New task'} footer={footer}>
      <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="alert-error">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="task-title" className="label">Title</label>
          <input
            id="task-title"
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Build authentication middleware"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="task-description" className="label">Notes</label>
          <textarea
            id="task-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Objectives, links…"
            className="input h-auto resize-y py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-category" className="label">Category</label>
            <select
              id="task-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-priority" className="label">Priority</label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="task-start" className="label">Start</label>
            <input
              id="task-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="task-end" className="label">End</label>
            <input
              id="task-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="task-minutes" className="label">Estimate (min)</label>
            <input
              id="task-minutes"
              type="number"
              min="0"
              step="5"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              className="input"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}