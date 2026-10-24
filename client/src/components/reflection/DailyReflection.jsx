import { useState, useEffect } from 'react';
import { getReflection, saveReflection } from '../../api/reflections.js';

const EMPTY = { accomplishments: '', challenges: '', tomorrowFocus: '', generalNotes: '' };

export default function DailyReflection({ selectedDate }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setError('');
    getReflection(selectedDate)
      .then((res) => {
        if (!active) return;
        if (res.success && res.data) {
          setForm({
            accomplishments: res.data.accomplishments || '',
            challenges: res.data.challenges || '',
            tomorrowFocus: res.data.tomorrow_focus || '',
            generalNotes: res.data.general_notes || '',
          });
        } else {
          setForm(EMPTY);
        }
      })
      .catch(() => {
        if (active) {
          setForm(EMPTY);
          setError('Could not load the reflection for this day.');
        }
      });
    return () => {
      active = false;
    };
  }, [selectedDate]);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await saveReflection(selectedDate, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card">
      <div className="border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-medium text-fg">Daily reflection</h2>
      </div>

      <form onSubmit={handleSave} className="space-y-4 p-5">
        {error && (
          <div role="alert" className="alert-error">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="ref-accomplished" className="label">What did you get done?</label>
            <textarea
              id="ref-accomplished"
              rows={4}
              value={form.accomplishments}
              onChange={update('accomplishments')}
              className="input h-auto resize-y py-2"
            />
          </div>
          <div>
            <label htmlFor="ref-challenges" className="label">What got in the way?</label>
            <textarea
              id="ref-challenges"
              rows={4}
              value={form.challenges}
              onChange={update('challenges')}
              className="input h-auto resize-y py-2"
            />
          </div>
          <div>
            <label htmlFor="ref-tomorrow" className="label">Focus for tomorrow</label>
            <textarea
              id="ref-tomorrow"
              rows={4}
              value={form.tomorrowFocus}
              onChange={update('tomorrowFocus')}
              className="input h-auto resize-y py-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="ref-notes" className="label">Notes</label>
          <input
            id="ref-notes"
            type="text"
            value={form.generalNotes}
            onChange={update('generalNotes')}
            placeholder="Links, ideas, anything else"
            className="input"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span role="status" className="text-sm text-success">
              Saved
            </span>
          )}
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save reflection'}
          </button>
        </div>
      </form>
    </section>
  );
}