import { useState } from 'react';
import { useTimer } from '../../context/TimerContext.jsx';
import { Play, Square, PlusCircle } from 'lucide-react';

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

  const isRunning = Boolean(activeSession?.is_running);

  const handleStart = async () => {
    setIsSubmitting(true);
    try {
      await startTimer({
        taskId: selectedTaskId || null,
        categoryId: selectedCategoryId || null,
        notes: sessionNotes
      });
      setSessionNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStop = async () => {
    setIsSubmitting(true);
    try {
      await stopTimer(sessionNotes);
      setSessionNotes('');
      if (onSessionFinished) onSessionFinished();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {isRunning && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-gray-500'}`} />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {isRunning ? 'Work Session In Progress' : 'Work Hour Tracker'}
            </span>
          </div>

          <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-white my-2">
            {formatTimerDisplay(elapsedSeconds)}
          </div>

          {isRunning && activeSession?.task_title && (
            <p className="text-xs text-primary-400 font-medium">
              Task: <span className="text-white">{activeSession.task_title}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {!isRunning ? (
            <>
              <select
                value={selectedTaskId}
                onChange={(e) => {
                  setSelectedTaskId(e.target.value);
                  const matched = tasks.find((t) => t.id === e.target.value);
                  if (matched?.category_id) setSelectedCategoryId(matched.category_id);
                }}
                className="bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary-500"
              >
                <option value="">Link a Task (Optional)</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary-500"
              >
                <option value="">Category (Optional)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleStart}
                disabled={isSubmitting}
                className="bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl px-5 py-2.5 text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-600/25 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Work</span>
              </button>

              <button
                type="button"
                onClick={onOpenManualModal}
                className="p-2.5 bg-surface-elevated hover:bg-border text-gray-300 hover:text-white rounded-xl border border-border transition-colors cursor-pointer"
                title="Add manual session"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="What did you work on? (Notes)"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="bg-surface-elevated border border-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 w-full sm:w-64"
              />

              <button
                onClick={handleStop}
                disabled={isSubmitting}
                className="bg-rose-600 hover:bg-rose-500 text-white font-medium rounded-xl px-5 py-2.5 text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 transition-all cursor-pointer whitespace-nowrap"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Finish Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}