import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutService } from '../services';

const WorkoutCreate = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    workout_type: 'strength',
    scheduled_date: '',
    duration_minutes: '',
    calories_burned: '',
    notes: '',
    is_template: false,
    is_public: false,
  });

  const onChange = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      workout_type: form.workout_type || 'strength',
      scheduled_date: form.scheduled_date || null,
      duration_minutes: form.duration_minutes === '' ? null : Number(form.duration_minutes),
      calories_burned: form.calories_burned === '' ? null : Number(form.calories_burned),
      notes: form.notes || null,
      is_template: !!form.is_template,
      is_public: !!form.is_public,
      exercises: [],
    };

    try {
      setSubmitting(true);
      const res = await workoutService.createWorkout(payload);
      const created = res.data?.workout;
      if (created?.id) {
        navigate(`/workouts/${created.id}`);
      } else {
        navigate('/workouts');
      }
    } catch (err) {
      console.error('Error creating workout:', err);
      setError(err?.response?.data?.message || 'Failed to create workout.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <button className="btn btn-secondary mb-2" onClick={() => navigate('/workouts')}>
        ← Back to Workouts
      </button>

      <div className="card">
        <h1 className="mb-2">Create Workout</h1>

        {error && <p className="error mb-2">{error}</p>}

        <form onSubmit={onSubmit}>
          <div className="grid grid-2 mb-2">
            <div className="form-group">
              <label>Title *</label>
              <input
                className="form-control"
                value={form.title}
                onChange={onChange('title')}
                placeholder="e.g. Upper Body Strength"
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select className="form-control" value={form.workout_type} onChange={onChange('workout_type')}>
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="hiit">HIIT</option>
                <option value="flexibility">Flexibility</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.description}
              onChange={onChange('description')}
              placeholder="Optional"
            />
          </div>

          <div className="grid grid-3 mb-2">
            <div className="form-group">
              <label>Scheduled date</label>
              <input
                className="form-control"
                type="date"
                value={form.scheduled_date}
                onChange={onChange('scheduled_date')}
              />
            </div>

            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                className="form-control"
                type="number"
                min="0"
                value={form.duration_minutes}
                onChange={onChange('duration_minutes')}
                placeholder="e.g. 45"
              />
            </div>

            <div className="form-group">
              <label>Calories burned</label>
              <input
                className="form-control"
                type="number"
                min="0"
                value={form.calories_burned}
                onChange={onChange('calories_burned')}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.notes}
              onChange={onChange('notes')}
              placeholder="Optional"
            />
          </div>

          <div className="mb-2" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="checkbox" checked={form.is_template} onChange={onChange('is_template')} />
              Save as template
            </label>

            <label style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="checkbox" checked={form.is_public} onChange={onChange('is_public')} />
              Make public
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Workout'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => navigate('/workouts')} disabled={submitting}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutCreate;
