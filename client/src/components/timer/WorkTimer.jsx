import { useState } from 'react';
import { useTimer } from '../../context/TimerContext.jsx';

const formatTimerDisplay = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default function WorkTimer({ tasks = [], categories = [], onSessionFinished, onOpenManualModal }) {
  const { activeSession, elapsedSeconds, startTimer, stopTimer } = useTimer();
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isRunning = Boolean(activeSession?.is_running);

  const handleStart = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await startTimer({
        taskId: selectedTaskId || null,
        categoryId: selectedCategoryId || null,
        notes: sessionNotes,
      });
      setSessionNotes('');
    } catch {
      setError('Could not start the timer. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStop = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await stopTimer(sessionNotes);
      setSessionNotes('');
      if (onSessionFinished) onSessionFinished();
    } catch {
      setError('Could not stop the timer. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card p-5">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm text-fg-muted">
            <span
              className={`h-2 w-2 rounded-full ${isRunning ? 'bg-success' : 'bg-border-strong'}`}
              aria-hidden="true"
            />
            {isRunning ? 'Session in progress' : 'Timer stopped'}
          </p>

          <p
            className="mt-1 text-4xl font-semibold tracking-tight tabular-nums text-fg sm:text-5xl"
            role="timer"
            aria-label="Elapsed time"
          >
            {formatTimerDisplay(elapsedSeconds)}
          </p>

          {isRunning && activeSession?.task_title && (
            <p className="mt-1 text-sm text-fg-muted">{activeSession.task_title}</p>
          )}
        </div>

        {!isRunning ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <select
              aria-label="Link a task"
              value={selectedTaskId}
              onChange={(e) => {
                setSelectedTaskId(e.target.value);
                const matched = tasks.find((t) => String(t.id) === e.target.value);
                if (matched?.category_id) setSelectedCategoryId(matched.category_id);
              }}
              className="input sm:w-48"
            >
              <option value="">No task linked</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>

            <select
              aria-label="Category"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="input sm:w-40"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button type="button" onClick={handleStart} disabled={isSubmitting} className="btn-primary">
              Start
            </button>
            <button type="button" onClick={onOpenManualModal} className="btn-secondary">
              Log manually
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              aria-label="Session notes"
              placeholder="What did you work on?"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="input sm:w-64"
            />
            <button type="button" onClick={handleStop} disabled={isSubmitting} className="btn-primary">
              Finish session
            </button>
          </div>
        )}
      </div>

      {error && (
        <div role="alert" className="alert-error mt-4">
          {error}
        </div>
      )}
    </section>
  );
}