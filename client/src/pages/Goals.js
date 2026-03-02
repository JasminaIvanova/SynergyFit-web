import React, { useState, useEffect } from 'react';
import { goalService } from '../services';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    loadGoals();
  }, [filter]);

  const loadGoals = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;

      const res = await goalService.getGoals(params);
      setGoals(res.data.goals || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalService.deleteGoal(id);
        loadGoals();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
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

  const calculateProgress = (goal) => {
    if (!goal.target?.value || !goal.current?.value) return 0;
    return Math.min(100, Math.round((goal.current.value / goal.target.value) * 100));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Goals</h1>
        <p className="page-subtitle">Set and track your fitness objectives</p>
      </div>

      <div className="card mb-2">
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
            <div key={goal._id} className="card">
              <div className="flex-between mb-2">
                <div>
                  <h3>{goal.title}</h3>
                  <span className={`workout-badge ${
                    goal.status === 'completed' ? 'completed' : 'scheduled'
                  }`}>
                    {goal.status}
                  </span>
                  <span className="workout-badge scheduled" style={{ marginLeft: '5px' }}>
                    {goal.type}
                  </span>
                </div>
              </div>

              {goal.description && (
                <p className="text-muted mb-2">{goal.description}</p>
              )}

              {goal.target?.value && (
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span><strong>Progress:</strong> {calculateProgress(goal)}%</span>
                    <span>{goal.current?.value || 0} / {goal.target.value} {goal.target.unit}</span>
                  </div>
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
                      background: '#4c6ef5',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              )}

              {goal.targetDate && (
                <p><strong>Target Date:</strong> {new Date(goal.targetDate).toLocaleDateString()}</p>
              )}

              {goal.milestones && goal.milestones.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Milestones:</strong>
                  <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                    {goal.milestones.map((milestone, idx) => (
                      <li key={idx} style={{ 
                        textDecoration: milestone.isCompleted ? 'line-through' : 'none',
                        color: milestone.isCompleted ? '#868e96' : '#212529'
                      }}>
                        {milestone.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                {goal.status === 'active' && (
                  <>
                    <button 
                      className="btn btn-success"
                      onClick={() => handleStatusChange(goal._id, 'completed')}
                    >
                      Complete
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleStatusChange(goal._id, 'paused')}
                    >
                      Pause
                    </button>
                  </>
                )}
                {goal.status === 'paused' && (
                  <button 
                    className="btn btn-success"
                    onClick={() => handleStatusChange(goal._id, 'active')}
                  >
                    Resume
                  </button>
                )}
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDelete(goal._id)}
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

export default Goals;
