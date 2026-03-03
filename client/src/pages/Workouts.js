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
          top: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: notification.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 
                          notification.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 
                          'rgba(245, 158, 11, 0.95)',
          backdropFilter: 'blur(12px)',
          color: '#fff',
          padding: '14px 22px',
          borderRadius: '10px',
          boxShadow: notification.type === 'success' ? '0 4px 12px rgba(16, 185, 129, 0.4)' :
                     notification.type === 'error' ? '0 4px 12px rgba(239, 68, 68, 0.4)' :
                     '0 4px 12px rgba(245, 158, 11, 0.4)',
          fontWeight: '500',
          fontSize: '0.95rem',
          minWidth: '240px',
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
          backgroundColor: 'rgba(10, 10, 11, 0.9)',
          backdropFilter: 'blur(8px)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'rgba(26, 26, 29, 0.95)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '420px',
            width: '100%'
          }}>
            <h3 style={{ marginBottom: '12px', color: '#fff', fontSize: '1.4rem', fontWeight: '600' }}>Delete Workout?</h3>
            <p style={{ marginBottom: '24px', color: '#A1A1AA', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong style={{ color: '#8B5CF6' }}>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={cancelDelete}
                style={{ minWidth: '90px' }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmDelete}
                style={{ minWidth: '90px' }}
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
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link to="/workouts/new" className="btn btn-secondary">
              Create Plan
            </Link>
            <Link to="/workouts/session" className="btn btn-success" style={{ fontSize: '1rem', fontWeight: '600' }}>
              Start Workout
            </Link>
          </div>
        </div>
      </div>

      <div className="card mb-2">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          >
            All
          </button>
          <button 
            className={`btn ${filter === 'scheduled' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('scheduled')}
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          >
            Scheduled
          </button>
          <button 
            className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('completed')}
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          >
            Completed
          </button>
          <button 
            className={`btn ${filter === 'templates' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('templates')}
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
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
                <div style={{ flex: 1 }}>
                  <h3>{workout.title}</h3>
                  <p className="text-muted">{workout.description}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span className={`workout-badge ${workout.completed_date ? 'completed' : 'scheduled'}`}>
                    {workout.completed_date ? 'Completed' : 'Scheduled'}
                  </span>
                  <button 
                    className="btn-icon-danger"
                    onClick={() => handleDeleteClick(workout.id, workout.title)}
                    title="Delete workout"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      borderRadius: '8px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#EF4444',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#EF4444';
                      e.target.querySelector('svg').style.stroke = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.target.querySelector('svg').style.stroke = '#EF4444';
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.2s ease' }}>
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Exercises:</strong> {workout.exercises?.length || 0}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Duration:</strong> {workout.duration_minutes || 0} min
                </p>
                {workout.calories_burned && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Calories:</strong> {workout.calories_burned}
                  </p>
                )}
                {workout.scheduled_date && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Scheduled:</strong> {new Date(workout.scheduled_date).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {!workout.completed_date ? (
                  <>
                    <Link 
                      to={`/workouts/session/${workout.id}`}
                      className="btn btn-primary"
                      style={{ flex: '1', minWidth: '120px' }}
                    >
                      Start Session
                    </Link>
                    <Link 
                      to={`/workouts/${workout.id}`} 
                      className="btn btn-secondary"
                      style={{ flex: '0 0 auto' }}
                    >
                      Details
                    </Link>
                    <button 
                      className="btn btn-outline"
                      onClick={() => handleComplete(workout.id)}
                      style={{ flex: '0 0 auto', fontSize: '0.85rem', padding: '8px 14px', gap: '4px' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Complete</span>
                    </button>
                  </>
                ) : (
                  <Link 
                    to={`/workouts/${workout.id}`} 
                    className="btn btn-primary"
                    style={{ flex: '1' }}
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workouts;
