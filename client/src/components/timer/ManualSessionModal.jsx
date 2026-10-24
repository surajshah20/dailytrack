import { useState } from 'react';
import Modal from '../common/Modal.jsx';
import { logManualSession } from '../../api/sessions.js';

export default function ManualSessionModal({ isOpen, onClose, selectedDate, tasks, categories, onSessionSaved }) {
  const [taskId, setTaskId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleTimeChange = (start, end) => {
    setStartTime(start);
    setEndTime(end);
    if (start && end) {
      const [sH, sM] = start.split(':').map(Number);
      const [eH, eM] = end.split(':').map(Number);
      let diff = eH * 60 + eM - (sH * 60 + sM);
      if (diff < 0) diff += 24 * 60;
      setDurationMinutes(diff);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await logManualSession({
        sessionDate: selectedDate,
        taskId: taskId || null,
        categoryId: categoryId || null,
        startTime,
        endTime,
        durationMinutes: parseInt(durationMinutes, 10) || 0,
        notes: notes.trim(),
      });
      onSessionSaved();
      setNotes('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the session. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onClose} className="btn-secondary">
        Cancel
      </button>
      <button type="submit" form="manual-session-form" disabled={submitting} className="btn-primary">
        {submitting ? 'Saving…' : 'Save session'}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log work session" footer={footer}>
      <form id="manual-session-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="alert-error">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="ms-task" className="label">Task</label>
          <select
            id="ms-task"
            value={taskId}
            onChange={(e) => {
              setTaskId(e.target.value);
              const t = tasks.find((item) => String(item.id) === e.target.value);
              if (t?.category_id) setCategoryId(t.category_id);
            }}
            className="input"
          >
            <option value="">No task linked</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ms-category" className="label">Category</label>
          <select
            id="ms-category"
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="ms-start" className="label">Start</label>
            <input
              id="ms-start"
              type="time"
              value={startTime}
              onChange={(e) => handleTimeChange(e.target.value, endTime)}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="ms-end" className="label">End</label>
            <input
              id="ms-end"
              type="time"
              value={endTime}
              onChange={(e) => handleTimeChange(startTime, e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="ms-duration" className="label">Duration (min)</label>
          <input
            id="ms-duration"
            type="number"
            min="1"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="ms-notes" className="label">Notes</label>
          <input
            id="ms-notes"
            type="text"
            placeholder="e.g. Debugged token expiration"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input"
          />
        </div>
      </form>
    </Modal>
  );
}