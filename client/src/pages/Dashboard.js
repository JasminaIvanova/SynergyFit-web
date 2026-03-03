import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workoutService, mealService, progressService } from '../services';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [todayMeals, setTodayMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Load recent workouts
      const workoutsRes = await workoutService.getWorkouts({ 
        limit: 5,
        startDate: startOfWeek.toISOString()
      });
      setRecentWorkouts(workoutsRes.data.workouts || []);

      // Load today's meals
      const mealsRes = await mealService.getMeals({
        startDate: todayDate,
        endDate: todayDate
      });
      setTodayMeals(mealsRes.data.meals || []);

      // Load progress stats
      const progressRes = await progressService.getStats(30);
      setStats(progressRes.data.stats);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name}!</h1>
        <p className="page-subtitle">Here's your fitness overview</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Workout Streak</h3>
          <div className="value">{user?.streaks?.currentWorkoutStreak || 0}</div>
          <div className="label">days in a row</div>
        </div>

        <div className="stat-card">
          <h3>This Week</h3>
          <div className="value">{recentWorkouts.filter(w => w.completed_date).length}</div>
          <div className="label">workouts completed</div>
        </div>

        <div className="stat-card">
          <h3>Weight Progress</h3>
          <div className="value">
            {stats?.weightChange !== null && stats?.weightChange !== undefined ? `${stats.weightChange > 0 ? '+' : ''}${Number(stats.weightChange).toFixed(1)} kg` : 'N/A'}
          </div>
          <div className="label">last 30 days</div>
        </div>

        <div className="stat-card">
          <h3>Today's Calories</h3>
          <div className="value">
            {Math.round(todayMeals.reduce((sum, meal) => sum + (meal.total_calories || 0), 0))}
          </div>
          <div className="label">calories logged</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="flex-between mb-2">
            <h2>Recent Workouts</h2>
            <Link to="/workouts" className="btn btn-primary">View All</Link>
          </div>
          
          {recentWorkouts.length === 0 ? (
            <p className="text-muted">No workouts yet. Start your fitness journey!</p>
          ) : (
            <div>
              {recentWorkouts.map((workout) => (
                <Link 
                  key={workout.id} 
                  to={`/workouts/${workout.id}`}
                  style={{ 
                    display: 'block',
                    padding: '15px', 
                    borderBottom: '1px solid var(--gray-dark)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-darker)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="flex-between">
                    <div>
                      <h4 style={{ margin: 0, marginBottom: '4px' }}>{workout.title || 'Untitled Workout'}</h4>
                      <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                        {workout.exercises?.length || 0} exercises • {workout.duration_minutes || 0} min
                      </p>
                    </div>
                    <span className={`workout-badge ${workout.completed_date ? 'completed' : 'scheduled'}`}>
                      {workout.completed_date ? 'Completed' : 'Scheduled'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex-between mb-2">
            <h2>Quick Actions</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/workouts/session" className="btn btn-primary">Start Workout</Link>
            <Link to="/meals/create" className="btn btn-primary">Log Meal</Link>
            <Link to="/progress" className="btn btn-primary">Update Progress</Link>
            <Link to="/social" className="btn btn-secondary">View Feed</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
