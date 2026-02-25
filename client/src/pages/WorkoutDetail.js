import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workoutService } from '../services';

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadWorkout();
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
            <h1>{workout.name}</h1>
            <p className="text-muted">{workout.description}</p>
          </div>
          <span className={`workout-badge ${workout.isCompleted ? 'completed' : 'scheduled'}`}>
            {workout.isCompleted ? 'Completed' : 'Scheduled'}
          </span>
        </div>

        <div className="grid grid-3 mb-3">
          <div>
            <strong>Category:</strong> {workout.category || 'N/A'}
          </div>
          <div>
            <strong>Difficulty:</strong> {workout.difficulty || 'N/A'}
          </div>
          <div>
            <strong>Duration:</strong> {workout.totalDuration || 0} min
          </div>
        </div>

        {workout.scheduledDate && (
          <p><strong>Scheduled:</strong> {new Date(workout.scheduledDate).toLocaleString()}</p>
        )}

        {workout.isCompleted && workout.completedAt && (
          <p><strong>Completed:</strong> {new Date(workout.completedAt).toLocaleString()}</p>
        )}

        {workout.rating && (
          <p><strong>Rating:</strong> {'⭐'.repeat(workout.rating)}</p>
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
                  {ex.duration && <div><strong>Duration:</strong> {ex.duration} min</div>}
                  {ex.restTime && <div><strong>Rest:</strong> {ex.restTime}s</div>}
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
