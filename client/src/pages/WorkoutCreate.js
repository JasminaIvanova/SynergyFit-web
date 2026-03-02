import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutService, exerciseDbService, exerciseService } from '../services';

const WorkoutCreate = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Exercise browser
  const [showExerciseBrowser, setShowExerciseBrowser] = useState(false);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);

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

  const loadExercises = async () => {
    setLoadingExercises(true);
    try {
      const res = searchQuery 
        ? await exerciseDbService.searchExercises(searchQuery)
        : await exerciseDbService.getExercises({ limit: 50 });
      
      const data = res.data;
      const list = data?.data || data?.exercises || data;
      setAvailableExercises(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error loading exercises:', error);
      setAvailableExercises([]);
    } finally {
      setLoadingExercises(false);
    }
  };

  useEffect(() => {
    if (showExerciseBrowser) {
      loadExercises();
    }
  }, [showExerciseBrowser, searchQuery]);

  const addExercise = (exercise) => {
    const newExercise = {
      id: Date.now().toString(),
      exerciseId: exercise.exerciseId || exercise.id,
      name: exercise.name,
      category: exercise.category,
      muscleGroup: exercise.muscleGroup || exercise.muscle_group || exercise.primaryMuscles?.[0] || 'general',
      difficulty: exercise.difficulty || 'intermediate',
      equipment: exercise.equipment,
      sets: 3,
      reps: 10,
      weight: 0,
      order_index: selectedExercises.length + 1
    };
    setSelectedExercises([...selectedExercises, newExercise]);
    setShowExerciseBrowser(false);
  };

  const removeExercise = (id) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.id !== id));
  };

  const updateExercise = (id, field, value) => {
    setSelectedExercises(selectedExercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    try {
      setSubmitting(true);

      // First, create exercises in database if needed
      const exercisesWithIds = await Promise.all(
        selectedExercises.map(async (ex) => {
          try {
            const exercisePayload = {
              name: ex.name,
              category: ex.category || 'other',
              muscle_group: ex.muscleGroup || ex.category || 'general',
              difficulty_level: ex.difficulty || 'intermediate',
              description: `Exercise from ExerciseDB`,
              is_custom: true
            };

            const res = await exerciseService.createExercise(exercisePayload);
            return {
              ...ex,
              dbExerciseId: res.data.exercise.id
            };
          } catch (error) {
            console.error('Error creating exercise:', error);
            return ex;
          }
        })
      );

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
        exercises: exercisesWithIds
          .filter(ex => ex.dbExerciseId)
          .map((ex, idx) => ({
            exercise_id: ex.dbExerciseId,
            sets: ex.sets || 3,
            reps: ex.reps || 10,
            weight: ex.weight || 0,
            order_index: idx + 1,
            notes: `${ex.sets} sets x ${ex.reps} reps x ${ex.weight}kg`
          }))
      };

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

          {/* Exercises Section */}
          <div className="card mb-2" style={{ background: 'var(--gray-darker)', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Exercises ({selectedExercises.length})</h3>
              <button 
                type="button"
                className="btn btn-primary"
                onClick={() => setShowExerciseBrowser(true)}
              >
                + Add Exercise
              </button>
            </div>

            {selectedExercises.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
                No exercises added yet. Click "Add Exercise" to get started.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {selectedExercises.map((exercise, idx) => (
                  <div key={exercise.id} className="card" style={{ margin: 0, padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ margin: 0, marginBottom: '4px' }}>
                          {idx + 1}. {exercise.name}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                          {exercise.category} {exercise.muscleGroup && `• ${exercise.muscleGroup}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => removeExercise(exercise.id)}
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                          Sets
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 1)}
                          className="form-control"
                          style={{ padding: '8px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                          Reps
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value) || 1)}
                          className="form-control"
                          style={{ padding: '8px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={exercise.weight}
                          onChange={(e) => updateExercise(exercise.id, 'weight', parseFloat(e.target.value) || 0)}
                          className="form-control"
                          style={{ padding: '8px' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      {/* Exercise Browser Modal */}
      {showExerciseBrowser && (
        <div className="modal-overlay" onClick={() => setShowExerciseBrowser(false)}>
          <div 
            className="modal" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px' }}
          >
            <div className="modal-header">
              <h2>Add Exercise</h2>
              <button className="modal-close" onClick={() => setShowExerciseBrowser(false)}>
                ×
              </button>
            </div>

            <div className="form-group">
              <input
                className="form-control"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {loadingExercises ? (
              <div className="spinner" style={{ margin: '40px auto' }}></div>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {availableExercises.length === 0 ? (
                  <p className="text-center text-muted">No exercises found</p>
                ) : (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {availableExercises.map((exercise) => (
                      <div
                        key={exercise.exerciseId || exercise.id}
                        onClick={() => addExercise(exercise)}
                        style={{
                          padding: '16px',
                          border: '2px solid var(--gray-dark)',
                          borderRadius: 'var(--radius)',
                          cursor: 'pointer',
                          transition: 'var(--transition)',
                          background: 'var(--gray-darker)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary-color)';
                          e.currentTarget.style.background = 'var(--card-bg)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--gray-dark)';
                          e.currentTarget.style.background = 'var(--gray-darker)';
                        }}
                      >
                        <h4 style={{ marginBottom: '4px', color: 'var(--white)' }}>{exercise.name}</h4>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                          {exercise.category && <span>{exercise.category}</span>}
                          {exercise.difficulty && <span>Difficulty: {exercise.difficulty}</span>}
                          {exercise.muscleGroup && <span>{exercise.muscleGroup}</span>}
                          {exercise.equipment && <span>{exercise.equipment}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutCreate;
