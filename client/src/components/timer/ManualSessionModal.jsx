import { useState } from 'react';
import { X } from 'lucide-react';
import { logManualSession } from '../../api/sessions.js';

export default function ManualSessionModal({ isOpen, onClose, selectedDate, tasks, categories, onSessionSaved }) {
  const [taskId, setTaskId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTimeChange = (start, end) => {
    setStartTime(start);
    setEndTime(end);
    if (start && end) {
      const [sH, sM] = start.split(':').map(Number);
      const [eH, eM] = end.split(':').map(Number);
      let diff = (eH * 60 + eM) - (sH * 60 + sM);
      if (diff < 0) diff += 24 * 60;
      setDurationMinutes(diff);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await logManualSession({
        sessionDate: selectedDate,
        taskId: taskId || null,
        categoryId: categoryId || null,
        startTime,
        endTime,
        durationMinutes: parseInt(durationMinutes, 10) || 0,
        notes: notes.trim()
      });
      onSessionSaved();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          <h3 className="text-lg font-bold text-white">Log Work Session</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Link to Task</label>
            <select
              value={taskId}
              onChange={(e) => {
                setTaskId(e.target.value);
                const t = tasks.find((item) => item.id === e.target.value);
                if (t?.category_id) setCategoryId(t.category_id);
              }}
              className="w-full bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">No Task Linked</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => handleTimeChange(e.target.value, endTime)}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => handleTimeChange(startTime, e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Duration (Minutes)</label>
            <input
              type="number"
              min="1"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Session Notes</label>
            <input
              type="text"
              placeholder="e.g. Debugged token expiration"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-medium rounded-lg px-5 py-2 text-sm transition-colors cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Record Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}