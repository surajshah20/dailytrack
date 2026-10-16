import { Check, Clock, Trash2, Edit2 } from 'lucide-react';
import { formatDuration } from '../../utils/dateUtils.js';

const PRIORITY_BADGES = {
  urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  high: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  medium: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  low: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const isCompleted = task.status === 'completed';

  return (
    <div className={`group flex items-start justify-between p-4 rounded-xl border transition-all ${
      isCompleted 
        ? 'bg-surface/40 border-border/40 opacity-70' 
        : 'bg-surface border-border hover:border-border/80 shadow-sm'
    }`}>
      {/* Checkbox & Task Information */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
            isCompleted
              ? 'bg-primary-600 border-primary-500 text-white'
              : 'border-gray-500 hover:border-primary-400 bg-surface-elevated'
          }`}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className={`text-sm font-medium tracking-tight ${
              isCompleted ? 'line-through text-gray-400' : 'text-white'
            }`}>
              {task.title}
            </h4>

            {/* Category Pill */}
            {task.category_name && (
              <span 
                className="text-[11px] font-medium px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${task.category_color}15`,
                  borderColor: `${task.category_color}40`,
                  color: task.category_color
                }}
              >
                {task.category_name}
              </span>
            )}

            {/* Priority Badge */}
            <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border tracking-wider ${
              PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium
            }`}>
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>
          )}

          {/* Time Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            {task.estimated_minutes > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                Est: {formatDuration(task.estimated_minutes)}
              </span>
            )}

            {(task.start_time || task.end_time) && (
              <span className="text-gray-400 font-mono">
                {task.start_time || '--:--'} – {task.end_time || '--:--'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3 shrink-0">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-surface-elevated rounded-lg transition-colors cursor-pointer"
          title="Edit Task"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-surface-elevated rounded-lg transition-colors cursor-pointer"
          title="Delete Task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}