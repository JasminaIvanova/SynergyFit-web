import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workoutService } from '../services';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

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

  const handleDeleteClick = (id, name) => {
    setDeleteConfirm({ show: true, id, name });
  };

  const confirmDelete = async () => {
    try {
      await workoutService.deleteWorkout(deleteConfirm.id);
      showNotification('Workout deleted successfully', 'success');
      loadWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
      showNotification('Error deleting workout', 'error');
    } finally {
      setDeleteConfirm({ show: false, id: null, name: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: null, name: '' });
  };

  return (
    <div className="page">
      {/* Toast Notification */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: notification.type === 'success' ? 'rgba(0, 229, 255, 0.95)' : 
                          notification.type === 'error' ? 'rgba(255, 75, 75, 0.95)' : 
                          'rgba(255, 193, 7, 0.95)',
          color: notification.type === 'success' ? '#121212' : '#fff',
          padding: '15px 25px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          fontWeight: '600',
          fontSize: '1rem',
          minWidth: '250px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {notification.message}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '2px solid var(--primary-color)',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '450px',
            width: '100%',
            boxShadow: '0 10px 40px rgba(0, 229, 255, 0.3)'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#fff' }}>Delete Workout?</h3>
            <p style={{ marginBottom: '25px', color: '#ccc', fontSize: '1rem' }}>
              Are you sure you want to delete <strong style={{ color: 'var(--primary-color)' }}>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={cancelDelete}
                style={{ minWidth: '100px' }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDelete}
                style={{ minWidth: '100px' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
                  onClick={() => handleDeleteClick(workout.id, workout.title)}
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
