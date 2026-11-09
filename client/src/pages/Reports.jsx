import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../api/client';
import ReportSection from '../components/ReportSection';

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const REPORT_TYPES = [
  { key: 'daily', label: 'Daily', path: '/reports/daily' },
  { key: 'monthToDate', label: 'Month-to-date', path: '/reports/month-to-date' },
  { key: 'monthly', label: 'Monthly', path: '/reports/monthly' },
];

export default function Reports() {
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [reports, setReports] = useState({
    daily: null,
    monthToDate: null,
    monthly: null,
  });
  const [loading, setLoading] = useState({
    daily: false,
    monthToDate: false,
    monthly: false,
  });
  const [error, setError] = useState({
    daily: '',
    monthToDate: '',
    monthly: '',
  });

  async function fetchReport(type, path) {
    setLoading((current) => ({ ...current, [type]: true }));
    setError((current) => ({ ...current, [type]: '' }));

    try {
      const response = await api.get(path, {
        params: { date: selectedDate },
      });

      setReports((current) => ({ ...current, [type]: response.data }));
    } catch (err) {
      setError((current) => ({ ...current, [type]: apiErrorMessage(err) }));
      setReports((current) => ({ ...current, [type]: null }));
    } finally {
      setLoading((current) => ({ ...current, [type]: false }));
    }
  }

  useEffect(() => {
    REPORT_TYPES.forEach(({ key, path }) => fetchReport(key, path));
  }, [selectedDate]);

  return (
    <section className="reports-page">
      <h1>Reports</h1>

      <label className="report-date-picker">
        Date
        <input
          type="date"
          value={selectedDate}
          max={todayString()}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </label>

      <div className="report-sections">
        {REPORT_TYPES.map(({ key, label, path }) => (
          <ReportSection
            key={key}
            title={label}
            report={reports[key]}
            loading={loading[key]}
            error={error[key]}
          />
        ))}
      </div>
    </section>
  );
}
