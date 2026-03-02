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
      
      // Load recent workouts
      const workoutsRes = await workoutService.getWorkouts({ 
        limit: 5,
        startDate: startOfWeek.toISOString()
      });
      setRecentWorkouts(workoutsRes.data.workouts || []);

      // Load today's meals
      const mealsRes = await mealService.getMeals({
        startDate: new Date().toISOString(),
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
          <div className="value">{recentWorkouts.filter(w => w.isCompleted).length}</div>
          <div className="label">workouts completed</div>
        </div>

        <div className="stat-card">
          <h3>Weight Progress</h3>
          <div className="value">
            {stats?.weightChange ? `${stats.weightChange > 0 ? '+' : ''}${stats.weightChange} kg` : 'N/A'}
          </div>
          <div className="label">last 30 days</div>
        </div>

        <div className="stat-card">
          <h3>Today's Calories</h3>
          <div className="value">
            {todayMeals.reduce((sum, meal) => sum + (meal.totalNutrition?.calories || 0), 0)}
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
                <div key={workout._id} style={{ padding: '15px', borderBottom: '1px solid #e9ecef' }}>
                  <div className="flex-between">
                    <div>
                      <h4>{workout.name}</h4>
                      <p className="text-muted">
                        {workout.exercises?.length || 0} exercises • {workout.totalDuration || 0} min
                      </p>
                    </div>
                    <span className={`workout-badge ${workout.isCompleted ? 'completed' : 'scheduled'}`}>
                      {workout.isCompleted ? 'Completed' : 'Scheduled'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex-between mb-2">
            <h2>Quick Actions</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/workouts" className="btn btn-primary">Log Workout</Link>
            <Link to="/meals" className="btn btn-primary">Log Meal</Link>
            <Link to="/progress" className="btn btn-primary">Update Progress</Link>
            <Link to="/social" className="btn btn-secondary">View Feed</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
