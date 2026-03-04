import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { goalService } from '../services';

const Goals = () => {
  const location = useLocation();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [deleteConfirmGoal, setDeleteConfirmGoal] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    goal_type: 'weight',
    target_value: '',
    current_value: '',
    unit: '',
    target_date: ''
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Reload goals when filter changes OR when navigating to this page
  useEffect(() => {
    loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, location.pathname]);

  // Reload goals when page becomes visible (e.g., after navigating from Progress page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadGoals();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also reload when window gains focus
    window.addEventListener('focus', loadGoals);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', loadGoals);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for goals refresh signal from other pages (e.g., Progress page)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'goalsNeedRefresh') {
        console.log('Goals refresh signal received, reloading...');
        loadGoals();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check on interval in case storage event doesn't fire
    const interval = setInterval(() => {
      const lastRefresh = localStorage.getItem('goalsNeedRefresh');
      if (lastRefresh && Date.now() - parseInt(lastRefresh) < 5000) {
        console.log('Periodic check: refreshing goals');
        loadGoals();
        localStorage.removeItem('goalsNeedRefresh');
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadGoals = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      
      // Add timestamp to prevent caching
      params._t = Date.now();

      const res = await goalService.getGoals(params);
      console.log('Goals loaded:', res.data.goals?.length || 0, 'goals');
      setGoals(res.data.goals || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await goalService.deleteGoal(id);
      showNotification('Goal deleted successfully!', 'success');
      setDeleteConfirmGoal(null);
      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      showNotification('Error deleting goal', 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await goalService.updateGoal(id, { status: newStatus });
      loadGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      showNotification('Please enter a goal title', 'error');
      return;
    }

    const data = {
      title: form.title,
      description: form.description || undefined,
      goal_type: form.goal_type,
      target_value: form.target_value ? parseFloat(form.target_value) : undefined,
      current_value: form.current_value ? parseFloat(form.current_value) : 0,
      unit: form.unit || undefined,
      target_date: form.target_date || undefined,
      status: 'active'
    };

    // Remove undefined values
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    try {
      await goalService.createGoal(data);
      showNotification('Goal created successfully!', 'success');
      setShowForm(false);
      setForm({
        title: '',
        description: '',
        goal_type: 'weight',
        target_value: '',
        current_value: '',
        unit: '',
        target_date: ''
      });
      loadGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      showNotification('Error creating goal', 'error');
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-set unit based on goal type
    if (field === 'goal_type') {
      let defaultUnit = '';
      switch(value) {
        case 'weight':
          defaultUnit = 'kg';
          break;
        case 'strength':
          defaultUnit = 'kg';
          break;
        case 'endurance':
          defaultUnit = 'km';
          break;
        case 'flexibility':
          defaultUnit = 'cm';
          break;
        case 'habit':
          defaultUnit = 'days';
          break;
        default:
          defaultUnit = '';
      }
      
      setForm(prev => ({
        ...prev,
        unit: defaultUnit,
        goal_type: value
      }));
    }
  };

  const getGoalTypeConfig = () => {
    const configs = {
      weight: {
        targetLabel: 'Target Weight',
        currentLabel: 'Current Weight',
        targetPlaceholder: 'e.g. 75',
        currentPlaceholder: 'e.g. 85',
        unit: 'kg',
        showTarget: true,
        showCurrent: true
      },
      strength: {
        targetLabel: 'Target Weight/Reps',
        currentLabel: 'Current Weight/Reps',
        targetPlaceholder: 'e.g. 100',
        currentPlaceholder: 'e.g. 80',
        unit: 'kg',
        showTarget: true,
        showCurrent: true
      },
      endurance: {
        targetLabel: 'Target Distance/Time',
        currentLabel: 'Current Distance/Time',
        targetPlaceholder: 'e.g. 10',
        currentPlaceholder: 'e.g. 5',
        unit: 'km',
        showTarget: true,
        showCurrent: true
      },
      flexibility: {
        targetLabel: 'Target Range',
        currentLabel: 'Current Range',
        targetPlaceholder: 'e.g. 30',
        currentPlaceholder: 'e.g. 15',
        unit: 'cm',
        showTarget: true,
        showCurrent: true
      },
      habit: {
        targetLabel: 'Target Days',
        currentLabel: 'Days Completed',
        targetPlaceholder: 'e.g. 30',
        currentPlaceholder: 'e.g. 0',
        unit: 'days',
        showTarget: true,
        showCurrent: true
      },
      custom: {
        targetLabel: 'Target Value',
        currentLabel: 'Current Value',
        targetPlaceholder: 'Enter target',
        currentPlaceholder: 'Enter current',
        unit: '',
        showTarget: true,
        showCurrent: true
      }
    };
    
    return configs[form.goal_type] || configs.custom;
  };

  const calculateProgress = (goal) => {
    if (!goal.target_value) return 0;
    if (!goal.current_value) return 0;

    const current = parseFloat(goal.current_value);
    const target = parseFloat(goal.target_value);
    
    // If already at target
    if (current === target) return 100;
    
    // For standard goals (strength, endurance, habit) - more is better
    // Progress = (current / target) * 100
    return Math.min(100, Math.max(0, Math.round((current / target) * 100)));
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
          backgroundColor: notification.type === 'success' ? 'rgba(0, 229, 255, 0.95)' : 'rgba(255, 75, 75, 0.95)',
          color: notification.type === 'success' ? '#121212' : '#fff',
          padding: '15px 25px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          fontWeight: '600',
          fontSize: '1rem',
          minWidth: '250px'
        }}>
          {notification.message}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ marginBottom: '8px' }}>My Goals</h1>
          <p className="page-subtitle">Set and track your fitness objectives</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{ 
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            minWidth: '140px'
          }}
        >
          {showForm ? 'Cancel' : '+ Add Goal'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-2">
          <h2 className="mb-2" style={{ fontSize: '1.3rem' }}>Create New Goal</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Goal Type *</label>
              <select 
                className="form-control"
                value={form.goal_type}
                onChange={handleChange('goal_type')}
                required
              >
                <option value="weight">Weight Loss/Gain</option>
                <option value="strength">Strength</option>
                <option value="endurance">Endurance</option>
                <option value="flexibility">Flexibility</option>
                <option value="habit">Habit Building</option>
                <option value="custom">Custom</option>
              </select>
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                {form.goal_type === 'weight' && 'Track your weight changes over time • Auto-syncs with Progress Tracking'}
                {form.goal_type === 'strength' && 'Measure strength gains in weight or reps'}
                {form.goal_type === 'endurance' && 'Improve stamina and distance'}
                {form.goal_type === 'flexibility' && 'Enhance flexibility and range of motion • Auto-syncs with body measurements'}
                {form.goal_type === 'habit' && 'Build consistent fitness habits'}
                {form.goal_type === 'custom' && 'Create your own custom goal'}
              </small>
            </div>

            <div className="form-group">
              <label>Goal Title *</label>
              <input
                type="text"
                className="form-control"
                value={form.title}
                onChange={handleChange('title')}
                placeholder={
                  form.goal_type === 'weight' ? 'e.g. Lose 10kg' :
                  form.goal_type === 'strength' ? 'e.g. Bench press 100kg' :
                  form.goal_type === 'endurance' ? 'e.g. Run 10km' :
                  form.goal_type === 'flexibility' ? 'e.g. Touch toes' :
                  form.goal_type === 'habit' ? 'e.g. Exercise 30 days' :
                  'e.g. Your goal'
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Describe your goal and motivation"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              {getGoalTypeConfig().showTarget && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>{getGoalTypeConfig().targetLabel}</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={form.target_value}
                    onChange={handleChange('target_value')}
                    placeholder={getGoalTypeConfig().targetPlaceholder}
                  />
                </div>
              )}

              {getGoalTypeConfig().showCurrent && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>{getGoalTypeConfig().currentLabel}</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={form.current_value}
                    onChange={handleChange('current_value')}
                    placeholder={getGoalTypeConfig().currentPlaceholder}
                  />
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Unit {form.goal_type !== 'custom' && '(Auto)'}</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.unit}
                  onChange={handleChange('unit')}
                  placeholder={form.goal_type === 'custom' ? 'Enter unit' : getGoalTypeConfig().unit}
                  readOnly={form.goal_type !== 'custom'}
                  style={{ 
                    backgroundColor: form.goal_type !== 'custom' ? 'var(--gray-darker)' : 'var(--dark)',
                    cursor: form.goal_type !== 'custom' ? 'not-allowed' : 'text'
                  }}
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                  {form.goal_type !== 'custom' ? `Auto-set: ${getGoalTypeConfig().unit}` : 'Enter your preferred unit'}
                </small>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Target Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.target_date}
                  onChange={handleChange('target_date')}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Create Goal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card mb-2" style={{ 
        padding: '12px 16px', 
        backgroundColor: 'var(--card-bg)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: '16px' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span><strong>Auto-Sync:</strong> Weight and measurement goals automatically update when you log progress entries.</span>
        </p>
      </div>

      <div className="card mb-2" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button 
            className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={`btn ${filter === 'paused' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('paused')}
          >
            Paused
          </button>
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : goals.length === 0 ? (
        <div className="card text-center">
          <p className="text-muted">No goals found. Set your first goal to get started!</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {goals.map((goal) => (
            <div key={goal.id} className="card">
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ marginBottom: '10px' }}>{goal.title}</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={`workout-badge ${
                    goal.status === 'completed' ? 'completed' : 'scheduled'
                  }`}>
                    {goal.status.toUpperCase()}
                  </span>
                  <span className="workout-badge scheduled">
                    {goal.goal_type.toUpperCase()}
                  </span>
                </div>
              </div>

              {goal.description && (
                <p className="text-muted mb-2">{goal.description}</p>
              )}

              {goal.target_value && (
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', alignItems: 'center' }}>
                    {goal.goal_type === 'weight' ? (
                      <>
                        <span><strong>Current:</strong> {goal.current_value || 0} {goal.unit}</span>
                        <span><strong>Target:</strong> {goal.target_value} {goal.unit}</span>
                        <span style={{ 
                          color: parseFloat(goal.current_value) === parseFloat(goal.target_value) ? '#10B981' : 
                                parseFloat(goal.current_value) > parseFloat(goal.target_value) ? 'var(--danger-color)' : 
                                'var(--warning-color)',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {parseFloat(goal.current_value) === parseFloat(goal.target_value) ? (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              <span>Reached!</span>
                            </>
                          ) :
                           Math.abs(parseFloat(goal.current_value) - parseFloat(goal.target_value)).toFixed(1) + ' ' + goal.unit + ' to go'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span><strong>Progress:</strong> {calculateProgress(goal)}%</span>
                        <span>{goal.current_value || 0} / {goal.target_value} {goal.unit}</span>
                      </>
                    )}
                  </div>
                  {goal.goal_type !== 'weight' && (
                    <div style={{ 
                      width: '100%', 
                      height: '10px', 
                      background: '#e9ecef', 
                      borderRadius: '5px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${calculateProgress(goal)}%`, 
                        height: '100%', 
                        background: 'var(--primary-color)',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  )}
                </div>
              )}

              {goal.target_date && (
                <p><strong>Target Date:</strong> {new Date(goal.target_date).toLocaleDateString()}</p>
              )}

              {(goal.goal_type === 'weight' || goal.goal_type === 'flexibility') && (
                <div style={{ 
                  backgroundColor: 'rgba(0, 229, 255, 0.1)', 
                  padding: '10px', 
                  borderRadius: '6px',
                  marginTop: '10px',
                  border: '1px solid rgba(0, 229, 255, 0.3)'
                }}>
                  <small style={{ color: 'var(--primary-color)', fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: '14px', marginTop: '2px' }}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>
                      <strong>Auto-synced with Progress:</strong> This goal automatically updates when you log progress in the Progress Tracking page.
                      {goal.goal_type === 'weight' && ' Add weight entries to track your progress.'}
                      {goal.goal_type === 'flexibility' && ' Add body measurements to track your progress.'}
                    </span>
                  </small>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                {goal.status === 'active' && (
                  <>
                    <button 
                      className="btn btn-success"
                      onClick={() => handleStatusChange(goal.id, 'completed')}
                    >
                      Complete
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleStatusChange(goal.id, 'paused')}
                    >
                      Pause
                    </button>
                  </>
                )}
                {goal.status === 'paused' && (
                  <button 
                    className="btn btn-success"
                    onClick={() => handleStatusChange(goal.id, 'active')}
                  >
                    Resume
                  </button>
                )}
                <button 
                  className="btn btn-danger"
                  onClick={() => setDeleteConfirmGoal(goal.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmGoal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{
            maxWidth: '400px',
            margin: '20px',
            padding: '24px'
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Delete Goal?</h3>
            <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
              Are you sure you want to delete this goal? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirmGoal)}
                style={{ flex: 1, padding: '10px', fontWeight: '600' }}
              >
                Delete
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setDeleteConfirmGoal(null)}
                style={{ flex: 1, padding: '10px', fontWeight: '600' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
