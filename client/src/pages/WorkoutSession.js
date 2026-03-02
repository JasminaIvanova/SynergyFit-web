import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { workoutService, exerciseDbService, exerciseService } from '../services';

const WorkoutSession = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(new Date());
  
  // Exercises in the workout session
  const [sessionExercises, setSessionExercises] = useState([]);
  
  // Exercise browser
  const [showExerciseBrowser, setShowExerciseBrowser] = useState(false);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingExercises, setLoadingExercises] = useState(false);

  useEffect(() => {
    if (id) {
      loadWorkout();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadWorkout = async () => {
    try {
      const res = await workoutService.getWorkoutById(id);
      setWorkout(res.data.workout);
    } catch (error) {
      console.error('Error loading workout:', error);
    } finally {
      setLoading(false);
    }
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

  const addExerciseToSession = (exercise) => {
    const newExercise = {
      id: Date.now().toString(),
      exerciseId: exercise.exerciseId || exercise.id,
      name: exercise.name,
      category: exercise.category,
      muscleGroup: exercise.muscleGroup || exercise.muscle_group || exercise.primaryMuscles?.[0] || 'general',
      difficulty: exercise.difficulty || 'intermediate',
      sets: [
        { id: 1, reps: 10, weight: 0, completed: false, rest: 90 }
      ]
    };
    setSessionExercises([...sessionExercises, newExercise]);
    setShowExerciseBrowser(false);
  };

  const removeExercise = (exerciseId) => {
    setSessionExercises(sessionExercises.filter(ex => ex.id !== exerciseId));
  };

  const addSet = (exerciseId) => {
    setSessionExercises(sessionExercises.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              id: ex.sets.length + 1,
              reps: lastSet?.reps || 10,
              weight: lastSet?.weight || 0,
              completed: false,
              rest: lastSet?.rest || 90
            }
          ]
        };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId, setId) => {
    setSessionExercises(sessionExercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.filter(s => s.id !== setId)
        };
      }
      return ex;
    }));
  };

  const updateSet = (exerciseId, setId, field, value) => {
    setSessionExercises(sessionExercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id === setId) {
              return { ...s, [field]: value };
            }
            return s;
          })
        };
      }
      return ex;
    }));
  };

  const toggleSetCompleted = (exerciseId, setId) => {
    setSessionExercises(sessionExercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id === setId) {
              return { ...s, completed: !s.completed };
            }
            return s;
          })
        };
      }
      return ex;
    }));
  };

  const calculateDuration = () => {
    const now = new Date();
    const diff = Math.floor((now - startTime) / 1000 / 60);
    return diff;
  };

  const finishWorkout = async () => {
    if (sessionExercises.length === 0) {
      alert('Add at least one exercise to finish the workout!');
      return;
    }

    const duration = calculateDuration();
    const totalSets = sessionExercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const completedSets = sessionExercises.reduce(
      (sum, ex) => sum + ex.sets.filter(s => s.completed).length, 
      0
    );

    try {
      // First, create exercises in our database from ExerciseDB data
      const exercisesWithIds = await Promise.all(
        sessionExercises.map(async (ex) => {
          try {
            // Try to create exercise (will be custom exercise from ExerciseDB)
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
            // If exercise creation fails, we'll skip it or use exercise name
            console.error('Error creating exercise:', error);
            return ex;
          }
        })
      );

      const payload = {
        title: workout?.title || `Workout - ${new Date().toLocaleDateString()}`,
        description: `${sessionExercises.length} exercises, ${completedSets}/${totalSets} sets completed`,
        workout_type: workout?.workout_type || 'strength',
        duration_minutes: duration,
        completed_date: new Date().toISOString(),
        notes: `Started: ${startTime.toLocaleTimeString()}\nFinished: ${new Date().toLocaleTimeString()}`,
        exercises: exercisesWithIds
          .filter(ex => ex.dbExerciseId) // Only include exercises that were created successfully
          .map((ex, idx) => ({
            exercise_id: ex.dbExerciseId,
            sets: ex.sets.length,
            reps: Math.round(ex.sets.reduce((sum, s) => sum + (s.reps || 0), 0) / ex.sets.length),
            weight: Math.round(ex.sets.reduce((sum, s) => sum + (s.weight || 0), 0) / ex.sets.length),
            order_index: idx + 1,
            notes: `Sets: ${ex.sets.map(s => `${s.weight}kg x ${s.reps}${s.completed ? '✓' : ''}`).join(', ')}`
          }))
      };

      const res = await workoutService.createWorkout(payload);
      alert('Workout saved successfully!');
      navigate('/workouts');
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Failed to save workout: ' + (error?.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <div className="page"><div className="spinner"></div></div>;
  }

  return (
    <div className="page" style={{ maxWidth: '1000px', paddingBottom: '40px' }}>
      <div className="flex-between mb-2">
        <button className="btn btn-secondary" onClick={() => navigate('/workouts')}>
          ← Cancel
        </button>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Duration: {calculateDuration()} min
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Started: {startTime.toLocaleTimeString()}
            </div>
          </div>
          <button 
            className="btn btn-success"
            onClick={finishWorkout}
            disabled={sessionExercises.length === 0}
            style={{ padding: '12px 28px', fontSize: '1rem' }}
          >
            ✓ Finish Workout
          </button>
        </div>
      </div>

      <div className="card mb-2">
        <h1 style={{ marginBottom: '8px' }}>🏋️ Active Workout</h1>
        <p className="text-muted" style={{ marginBottom: '20px' }}>
          {workout?.title || 'New Workout Session'}
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
          gap: '16px',
          maxWidth: '600px'
        }}>
          <div className="card" style={{ background: 'var(--gray-darker)', margin: 0, padding: '16px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Exercises</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--primary-color)' }}>
              {sessionExercises.length}
            </div>
          </div>
          <div className="card" style={{ background: 'var(--gray-darker)', margin: 0, padding: '16px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Sets</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--primary-color)' }}>
              {sessionExercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
            </div>
          </div>
          <div className="card" style={{ background: 'var(--gray-darker)', margin: 0, padding: '16px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Completed</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--success-color)' }}>
              {sessionExercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div>
        {sessionExercises.map((exercise, exIdx) => (
          <div key={exercise.id} className="card" style={{ marginBottom: '20px' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '4px', color: 'var(--white)' }}>
                  {exIdx + 1}. {exercise.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {exercise.category}
                </p>
              </div>
              <button 
                className="btn btn-danger"
                onClick={() => removeExercise(exercise.id)}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                🗑️ Remove
              </button>
            </div>

            {/* Sets Table */}
            <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--gray-dark)' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>SET</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>WEIGHT (kg)</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>REPS</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>REST (s)</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>✓</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {exercise.sets.map((set) => (
                    <tr key={set.id} style={{ 
                      borderBottom: '1px solid var(--gray-dark)',
                      background: set.completed ? 'rgba(0, 229, 255, 0.1)' : 'transparent'
                    }}>
                      <td style={{ padding: '12px 8px', fontWeight: '600' }}>{set.id}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={set.weight}
                          onChange={(e) => updateSet(exercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                          style={{
                            width: '70px',
                            padding: '6px 8px',
                            border: '2px solid var(--gray-dark)',
                            borderRadius: '6px',
                            background: 'var(--gray-darker)',
                            color: 'var(--white)',
                            textAlign: 'center',
                            fontSize: '0.95rem'
                          }}
                          disabled={set.completed}
                        />
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          value={set.reps}
                          onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                          style={{
                            width: '60px',
                            padding: '6px 8px',
                            border: '2px solid var(--gray-dark)',
                            borderRadius: '6px',
                            background: 'var(--gray-darker)',
                            color: 'var(--white)',
                            textAlign: 'center',
                            fontSize: '0.95rem'
                          }}
                          disabled={set.completed}
                        />
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          step="15"
                          value={set.rest}
                          onChange={(e) => updateSet(exercise.id, set.id, 'rest', parseInt(e.target.value) || 0)}
                          style={{
                            width: '60px',
                            padding: '6px 8px',
                            border: '2px solid var(--gray-dark)',
                            borderRadius: '6px',
                            background: 'var(--gray-darker)',
                            color: 'var(--white)',
                            textAlign: 'center',
                            fontSize: '0.95rem'
                          }}
                          disabled={set.completed}
                        />
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <button
                          onClick={() => toggleSetCompleted(exercise.id, set.id)}
                          style={{
                            padding: '8px 12px',
                            border: '2px solid',
                            borderColor: set.completed ? 'var(--primary-color)' : 'var(--gray-dark)',
                            borderRadius: '6px',
                            background: set.completed ? 'var(--primary-color)' : 'transparent',
                            color: set.completed ? 'var(--dark)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '700'
                          }}
                        >
                          {set.completed ? '✓' : '○'}
                        </button>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <button
                          onClick={() => removeSet(exercise.id, set.id)}
                          style={{
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '6px',
                            background: 'transparent',
                            color: 'var(--danger-color)',
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                          }}
                          disabled={exercise.sets.length === 1}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className="btn btn-outline"
              onClick={() => addSet(exercise.id)}
              style={{ 
                width: '100%',
                padding: '8px 16px',
                fontSize: '0.9rem'
              }}
            >
              ➕ Add Set
            </button>
          </div>
        ))}

        {sessionExercises.length === 0 && (
          <div className="card text-center" style={{ padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💪</div>
            <h3 style={{ marginBottom: '8px' }}>No exercises yet</h3>
            <p className="text-muted">Add your first exercise to start the workout</p>
          </div>
        )}
      </div>

      {/* Add Exercise Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
        <button 
          className="btn btn-primary"
          onClick={() => setShowExerciseBrowser(true)}
          style={{ padding: '14px 40px', fontSize: '1.05rem' }}
        >
          ➕ Add Exercise
        </button>
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
                        onClick={() => addExerciseToSession(exercise)}
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
                          {exercise.category && <span>📁 {exercise.category}</span>}
                          {exercise.difficulty && <span>⚡ {exercise.difficulty}</span>}
                          {exercise.muscleGroup && <span>💪 {exercise.muscleGroup}</span>}
                          {exercise.equipment && <span>🏋️ {exercise.equipment}</span>}
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

export default WorkoutSession;
