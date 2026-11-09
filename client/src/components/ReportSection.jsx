export default function ReportSection({ title, report, loading, error }) {
  if (loading) {
    return <p className="status">Loading {title.toLowerCase()} report...</p>;
  }

  if (error) {
    return <div className="error-box">{error}</div>;
  }

  if (!report || report.count === 0) {
    return (
      <section className="report-panel">
        <h3>{title}</h3>
        <p className="empty-state">No readings for this period yet.</p>
      </section>
    );
  }

  return (
    <section className="report-panel">
      <h3>{title}</h3>
      <p className="report-range">
        {report.label}: {report.from} to {report.to}
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Highest</span>
          <strong>{report.highest} mg/dL</strong>
        </div>
        <div className="stat-card">
          <span>Lowest</span>
          <strong>{report.lowest} mg/dL</strong>
        </div>
        <div className="stat-card">
          <span>Average</span>
          <strong>{Number(report.average).toFixed(1)} mg/dL</strong>
        </div>
        <div className="stat-card">
          <span>Count</span>
          <strong>{report.count}</strong>
        </div>
      </div>

      {report.readings && report.readings.length > 0 && (
        <div className="daily-readings">
          <h4>Readings</h4>
          <ul>
            {report.readings.map((reading) => (
              <li key={reading.id}>
                <span>{reading.date}</span>
                <span>{reading.slotLabel}</span>
                <strong>{reading.value} mg/dL</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
