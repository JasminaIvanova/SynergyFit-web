import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workoutService } from '../services';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadWorkouts();
  }, [filter]);

  const loadWorkouts = async () => {
    try {
      const params = {};
      if (filter === 'completed') params.isCompleted = 'true';
      if (filter === 'scheduled') params.isCompleted = 'false';
      if (filter === 'templates') params.isTemplate = 'true';

      const res = await workoutService.getWorkouts(params);
      setWorkouts(res.data.workouts || []);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await workoutService.completeWorkout(id, { rating: 5 });
      loadWorkouts();
    } catch (error) {
      console.error('Error completing workout:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await workoutService.deleteWorkout(id);
        loadWorkouts();
      } catch (error) {
        console.error('Error deleting workout:', error);
      }
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">My Workouts</h1>
            <p className="page-subtitle">Track your training sessions</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/workouts/session" className="btn btn-success" style={{ fontSize: '1.1rem', padding: '14px 28px' }}>
              Start Workout
            </Link>
            <Link to="/workouts/new" className="btn btn-secondary">
              Create Plan
            </Link>
          </div>
        </div>
      </div>

      <div className="card mb-2">
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`btn ${filter === 'scheduled' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('scheduled')}
          >
            Scheduled
          </button>
          <button 
            className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={`btn ${filter === 'templates' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('templates')}
          >
            Templates
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : workouts.length === 0 ? (
        <div className="card text-center">
          <p className="text-muted">No workouts found. Create your first workout!</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {workouts.map((workout) => (
            <div key={workout.id} className="workout-card">
              <div className="workout-card-header">
                <div>
                  <h3>{workout.title}</h3>
                  <p className="text-muted">{workout.description}</p>
                </div>
                <span className={`workout-badge ${workout.completed_date ? 'completed' : 'scheduled'}`}>
                  {workout.completed_date ? 'Completed' : 'Scheduled'}
                </span>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p><strong>Exercises:</strong> {workout.exercises?.length || 0}</p>
                <p><strong>Duration:</strong> {workout.duration_minutes || 0} minutes</p>
                {workout.calories_burned && <p><strong>Calories:</strong> {workout.calories_burned}</p>}
                {workout.scheduled_date && (
                  <p><strong>Scheduled:</strong> {new Date(workout.scheduled_date).toLocaleDateString()}</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link to={`/workouts/${workout.id}`} className="btn btn-secondary">
                  View Details
                </Link>
                {!workout.completed_date && (
                  <Link 
                    to={`/workouts/session/${workout.id}`}
                    className="btn btn-primary"
                  >
                    Start Session
                  </Link>
                )}
                {!workout.completed_date && (
                  <button 
                    className="btn btn-outline"
                    onClick={() => handleComplete(workout.id)}
                  >
                    Mark Complete
                  </button>
                )}
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDelete(workout.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workouts;
