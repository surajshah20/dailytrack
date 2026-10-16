import { useState, useEffect } from 'react';
import { getReflection, saveReflection } from '../../api/reflections.js';
import { BookOpen, Check, Save } from 'lucide-react';

export default function DailyReflection({ selectedDate }) {
  const [accomplishments, setAccomplishments] = useState('');
  const [challenges, setChallenges] = useState('');
  const [tomorrowFocus, setTomorrowFocus] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getReflection(selectedDate).then((res) => {
      if (isMounted && res.success && res.data) {
        setAccomplishments(res.data.accomplishments || '');
        setChallenges(res.data.challenges || '');
        setTomorrowFocus(res.data.tomorrow_focus || '');
        setGeneralNotes(res.data.general_notes || '');
      } else if (isMounted) {
        setAccomplishments('');
        setChallenges('');
        setTomorrowFocus('');
        setGeneralNotes('');
      }
    });
    return () => { isMounted = false; };
  }, [selectedDate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await saveReflection(selectedDate, {
        accomplishments,
        challenges,
        tomorrowFocus,
        generalNotes
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
            Daily Reflection & Notes
          </h3>
        </div>

        {savedSuccess && (
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1">
              What did I accomplish?
            </label>
            <textarea
              rows="3"
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
              placeholder="Key achievements, completed modules, wins..."
              className="w-full bg-surface-elevated border border-border rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-rose-400 mb-1">
              What went wrong / bottlenecks?
            </label>
            <textarea
              rows="3"
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="Distractions, bugs, blockers, misestimates..."
              className="w-full bg-surface-elevated border border-border rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-blue-400 mb-1">
              What should I focus on tomorrow?
            </label>
            <textarea
              rows="3"
              value={tomorrowFocus}
              onChange={(e) => setTomorrowFocus(e.target.value)}
              placeholder="Top 1-3 priorities for the next day..."
              className="w-full bg-surface-elevated border border-border rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">
            General Notes
          </label>
          <input
            type="text"
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            placeholder="Links, meeting notes, ideas..."
            className="w-full bg-surface-elevated border border-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Reflection'}
          </button>
        </div>
      </form>
    </div>
  );
}