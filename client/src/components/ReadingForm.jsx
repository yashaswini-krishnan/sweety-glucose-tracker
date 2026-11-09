const SLOT_OPTIONS = [
  { value: 'morning_fasting', label: 'Morning (fasting)' },
  { value: 'after_breakfast', label: 'After breakfast' },
  { value: 'after_lunch', label: 'After lunch' },
  { value: 'after_dinner', label: 'After dinner' },
];

function todayIsoLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ReadingForm({
  form,
  onChange,
  onSubmit,
  onCancelEdit,
  error,
  submitting,
  isEditing,
}) {
  return (
    <section className="card readings-card">
      <h2>{isEditing ? 'Edit reading' : 'Add a reading'}</h2>
      {error && (
        <div className="error-box" role="alert">
          {error}
        </div>
      )}

      <form className="reading-form" onSubmit={onSubmit}>
        <label>
          Date
          <input
            type="date"
            value={form.date}
            max={todayIsoLocal()}
            onChange={(event) => onChange('date', event.target.value)}
            required
          />
        </label>

        <label>
          Time slot
          <select
            value={form.slot}
            onChange={(event) => onChange('slot', event.target.value)}
            required
          >
            {SLOT_OPTIONS.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Value (mg/dL)
          <input
            type="number"
            min="40"
            max="600"
            step="1"
            value={form.value}
            onChange={(event) => onChange('value', event.target.value)}
            placeholder="e.g. 120"
            required
          />
        </label>

        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? (isEditing ? 'Saving...' : 'Adding...') : isEditing ? 'Save changes' : 'Add reading'}
          </button>

          {isEditing && (
            <button type="button" className="secondary-button" onClick={onCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
