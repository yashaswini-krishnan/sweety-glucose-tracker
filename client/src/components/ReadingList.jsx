export default function ReadingList({ readings, onEdit, onDelete }) {
  if (!readings.length) {
    return <p className="empty-state">No readings yet. Add your first one above.</p>;
  }

  return (
    <section className="reading-list">
      {readings.map((reading) => (
        <article key={reading.id} className="reading-row">
          <div className="reading-main">
            <strong>{reading.date}</strong>
            <span>{reading.slotLabel}</span>
            <span>{reading.value} mg/dL</span>
          </div>

          <div className="reading-actions">
            <button type="button" className="secondary-button" onClick={() => onEdit(reading)}>
              Edit
            </button>
            <button type="button" className="danger-button" onClick={() => onDelete(reading.id)}>
              Delete
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
