import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../api/client';
import ReadingForm from '../components/ReadingForm';
import ReadingList from '../components/ReadingList';

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function emptyForm() {
  return {
    date: todayString(),
    slot: 'morning_fasting',
    value: '',
  };
}

export default function Readings() {
  const [readings, setReadings] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadReadings() {
    try {
      const response = await api.get('/readings');
      const sorted = [...response.data].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
      setReadings(sorted);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReadings();
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      date: form.date,
      slot: form.slot,
      value: Number(form.value),
    };

    try {
      if (editingId) {
        await api.put(`/readings/${editingId}`, payload);
      } else {
        await api.post('/readings', payload);
      }

      resetForm();
      await loadReadings();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this reading?');
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/readings/${id}`);
      if (editingId === id) {
        resetForm();
      }
      await loadReadings();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  function handleEdit(reading) {
    setEditingId(reading.id);
    setForm({
      date: reading.date,
      slot: reading.slot,
      value: String(reading.value),
    });
    setError('');
  }

  return (
    <section className="readings-page">
      <h1>Readings</h1>

      <ReadingForm
        form={form}
        onChange={updateForm}
        onSubmit={handleSubmit}
        onCancelEdit={() => resetForm()}
        error={error}
        submitting={submitting}
        isEditing={Boolean(editingId)}
      />

      {loading ? (
        <p className="status">Loading readings...</p>
      ) : (
        <ReadingList readings={readings} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </section>
  );
}
