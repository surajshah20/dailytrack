import { Check, Pencil, Trash2 } from 'lucide-react';
import { formatDuration } from '../../utils/dateUtils.js';

const PRIORITY_BADGE = {
  urgent: 'badge badge-danger',
  high: 'badge badge-warning',
};

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const done = task.status === 'completed';
  const hasTime = task.start_time || task.end_time;

  return (
    <li className="group flex items-start justify-between gap-3 px-5 py-3.5">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={`Mark "${task.title}" as ${done ? 'not done' : 'done'}`}
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors ${
            done
              ? 'border-accent bg-accent text-accent-fg'
              : 'border-border-strong bg-surface hover:border-accent'
          }`}
        >
          {done && <Check className="h-3 w-3" strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`text-sm font-medium ${done ? 'text-fg-subtle line-through' : 'text-fg'}`}>
              {task.title}
            </span>
            {PRIORITY_BADGE[task.priority] && (
              <span className={`${PRIORITY_BADGE[task.priority]} capitalize`}>{task.priority}</span>
            )}
          </div>

          {task.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-fg-muted">{task.description}</p>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-subtle">
            {task.category_name && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: task.category_color || 'currentColor' }}
                  aria-hidden="true"
                />
                {task.category_name}
              </span>
            )}
            {task.estimated_minutes > 0 && (
              <span className="tabular-nums">{formatDuration(task.estimated_minutes)}</span>
            )}
            {hasTime && (
              <span className="tabular-nums">
                {task.start_time || '--:--'} – {task.end_time || '--:--'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
          title="Edit"
          className="btn-ghost h-8 w-8 px-0"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete "${task.title}"`}
          title="Delete"
          className="btn-ghost h-8 w-8 px-0 hover:!text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}