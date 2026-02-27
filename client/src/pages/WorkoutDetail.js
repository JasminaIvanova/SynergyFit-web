import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutService } from '../services';

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && id !== 'new') {
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
        <h2 className="mb-2">Exercises</h2>
        
        {workout.exercises && workout.exercises.length > 0 ? (
          <div>
            {workout.exercises.map((ex, index) => (
              <div key={index} style={{ padding: '15px', borderBottom: '1px solid #e9ecef' }}>
                <h3>{ex.exercise?.name || 'Unknown Exercise'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
                  {ex.sets && <div><strong>Sets:</strong> {ex.sets}</div>}
                  {ex.reps && <div><strong>Reps:</strong> {ex.reps}</div>}
                  {ex.weight && <div><strong>Weight:</strong> {ex.weight} kg</div>}
                  {ex.duration_seconds && <div><strong>Duration:</strong> {Math.round(ex.duration_seconds / 60)} min</div>}
                  {ex.rest_seconds && <div><strong>Rest:</strong> {ex.rest_seconds}s</div>}
                </div>
                {ex.notes && <p className="text-muted mt-1"><em>{ex.notes}</em></p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">No exercises added yet</p>
        )}
      </div>

      {workout.notes && (
        <div className="card">
          <h2 className="mb-2">Notes</h2>
          <p>{workout.notes}</p>
        </div>
      )}
    </div>
  );
};

export default WorkoutDetail;
