import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workoutService } from '../services';

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showExerciseInfo, setShowExerciseInfo] = useState(null);

  useEffect(() => {
    if (id && id !== 'new') {
      loadWorkout();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (loading) {
    return <div className="page"><div className="spinner"></div></div>;
  }

  if (!workout) {
    return (
      <div className="page">
        <div className="card text-center">
          <p>Workout not found</p>
          <button className="btn btn-primary mt-2" onClick={() => navigate('/workouts')}>
            Back to Workouts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <button className="btn btn-secondary mb-2" onClick={() => navigate('/workouts')}>
        ← Back to Workouts
      </button>

      <div className="card">
        <div className="flex-between mb-2">
          <div>
            <h1>{workout.title}</h1>
            <p className="text-muted">{workout.description}</p>
          </div>
          <span className={`workout-badge ${workout.completed_date ? 'completed' : 'scheduled'}`}>
            {workout.completed_date ? 'Completed' : 'Scheduled'}
          </span>
        </div>

        <div className="grid grid-3 mb-3">
          <div>
            <strong>Type:</strong> {workout.workout_type || 'N/A'}
          </div>
          <div>
            <strong>Template:</strong> {workout.is_template ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Duration:</strong> {workout.duration_minutes || 0} min
          </div>
        </div>

        {workout.scheduled_date && (
          <p><strong>Scheduled:</strong> {new Date(workout.scheduled_date).toLocaleString()}</p>
        )}

        {workout.completed_date && (
          <p><strong>Completed:</strong> {new Date(workout.completed_date).toLocaleString()}</p>
        )}

        {workout.calories_burned && (
          <p><strong>Calories burned:</strong> {workout.calories_burned}</p>
        )}
      </div>

      <div className="card">
        <h2 className="mb-2">Exercises ({workout.exercises?.length || 0})</h2>
        
        {workout.exercises && workout.exercises.length > 0 ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            {workout.exercises.map((ex, index) => (
              <div 
                key={index} 
                className="card" 
                style={{ 
                  margin: 0,
                  padding: '20px',
                  background: 'var(--gray-darker)',
                  border: '2px solid var(--gray-dark)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, marginBottom: '8px', color: 'var(--white)' }}>
                      {index + 1}. {ex.exercise?.name || 'Unknown Exercise'}
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {ex.exercise?.category && (
                        <span style={{ 
                          padding: '4px 10px', 
                          background: 'rgba(0, 229, 255, 0.1)', 
                          borderRadius: '4px',
                          border: '1px solid rgba(0, 229, 255, 0.3)'
                        }}>
                          {ex.exercise.category}
                        </span>
                      )}
                      {ex.exercise?.muscle_group && (
                        <span style={{ 
                          padding: '4px 10px', 
                          background: 'rgba(0, 229, 255, 0.1)', 
                          borderRadius: '4px',
                          border: '1px solid rgba(0, 229, 255, 0.3)'
                        }}>
                          {ex.exercise.muscle_group}
                        </span>
                      )}
                      {ex.exercise?.difficulty_level && (
                        <span style={{ 
                          padding: '4px 10px', 
                          background: 'rgba(0, 229, 255, 0.1)', 
                          borderRadius: '4px',
                          border: '1px solid rgba(0, 229, 255, 0.3)'
                        }}>
                          {ex.exercise.difficulty_level}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowExerciseInfo(ex.exercise)}
                    className="btn btn-outline"
                    style={{ padding: '8px 16px', fontSize: '0.9rem', flexShrink: 0 }}
                  >
                    Info
                  </button>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                  gap: '12px',
                  padding: '16px',
                  background: 'var(--card-bg)',
                  borderRadius: '8px',
                  marginTop: '12px'
                }}>
                  {ex.sets && (
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Sets
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                        {ex.sets}
                      </div>
                    </div>
                  )}
                  {ex.reps && (
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Reps
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                        {ex.reps}
                      </div>
                    </div>
                  )}
                  {ex.weight !== undefined && ex.weight !== null && (
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Weight
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                        {ex.weight} kg
                      </div>
                    </div>
                  )}
                  {ex.duration_seconds && (
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Duration
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                        {Math.round(ex.duration_seconds / 60)} min
                      </div>
                    </div>
                  )}
                  {ex.rest_seconds && (
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Rest
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                        {ex.rest_seconds}s
                      </div>
                    </div>
                  )}
                </div>

                {ex.notes && (
                  <div style={{ 
                    marginTop: '12px', 
                    padding: '12px', 
                    background: 'var(--card-bg)', 
                    borderRadius: '6px',
                    borderLeft: '3px solid var(--primary-color)'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Notes:
                    </div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {ex.notes}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: 'var(--text-secondary)'
          }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No exercises added yet</p>
            <p style={{ fontSize: '0.9rem' }}>Add exercises when creating or editing this workout</p>
          </div>
        )}
      </div>

      {workout.notes && (
        <div className="card">
          <h2 className="mb-2">Notes</h2>
          <p>{workout.notes}</p>
        </div>
      )}

      {/* Exercise Info Modal */}
      {showExerciseInfo && (
        <div className="modal-overlay" onClick={() => setShowExerciseInfo(null)}>
          <div 
            className="modal" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '700px', maxHeight: '85vh', overflow: 'auto' }}
          >
            <div className="modal-header">
              <h2>{showExerciseInfo.name}</h2>
              <button className="modal-close" onClick={() => setShowExerciseInfo(null)}>
                ×
              </button>
            </div>

            <div style={{ padding: '0 20px 20px' }}>
              {/* Exercise Details */}
              <div style={{ marginBottom: '20px' }}>
                {showExerciseInfo.category && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Category:</strong> {showExerciseInfo.category}
                  </div>
                )}
                {showExerciseInfo.muscle_group && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Muscle Group:</strong> {showExerciseInfo.muscle_group}
                  </div>
                )}
                {showExerciseInfo.difficulty_level && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Difficulty:</strong> {showExerciseInfo.difficulty_level}
                  </div>
                )}
                {showExerciseInfo.equipment && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Equipment:</strong> {showExerciseInfo.equipment}
                  </div>
                )}
              </div>

              {showExerciseInfo.description && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>Description</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {showExerciseInfo.description}
                  </p>
                </div>
              )}

              {showExerciseInfo.instructions && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>Instructions</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {showExerciseInfo.instructions}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowExerciseInfo(null)}
                >
                  Close
                </button>
                {showExerciseInfo.id && (
                  <Link
                    to={`/exercises/${showExerciseInfo.id}`}
                    className="btn btn-primary"
                    style={{ textDecoration: 'none' }}
                    onClick={() => setShowExerciseInfo(null)}
                  >
                    View Full Details
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutDetail;
