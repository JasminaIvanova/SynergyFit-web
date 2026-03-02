import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mealService } from '../services';

const Meals = () => {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [dailyStats, setDailyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadMeals();
    loadDailyStats();
  }, [selectedDate]);

  const loadMeals = async () => {
    try {
      const res = await mealService.getMeals({
        startDate: new Date(selectedDate).toISOString(),
        endDate: new Date(new Date(selectedDate).setHours(23, 59, 59)).toISOString(),
      });
      setMeals(res.data.meals || []);
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyStats = async () => {
    try {
      const res = await mealService.getDailyStats(selectedDate);
      setDailyStats(res.data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await mealService.deleteMeal(id);
        loadMeals();
        loadDailyStats();
      } catch (error) {
        console.error('Error deleting meal:', error);
      }
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Nutrition Tracking</h1>
          <p className="page-subtitle">Log and monitor your meals</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/meals/create')}
        >
          + Log Meal
        </button>
      </div>

      <div className="card mb-2">
        <div className="form-group">
          <label>Select Date</label>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {dailyStats && (
        <div className="dashboard-grid">
          <div className="stat-card">
            <h3>Calories</h3>
            <div className="value">{Math.round(dailyStats.calories || 0)}</div>
            <div className="label">kcal</div>
          </div>
          <div className="stat-card">
            <h3>Protein</h3>
            <div className="value">{Math.round(dailyStats.protein || 0)}</div>
            <div className="label">grams</div>
          </div>
          <div className="stat-card">
            <h3>Carbs</h3>
            <div className="value">{Math.round(dailyStats.carbs || 0)}</div>
            <div className="label">grams</div>
          </div>
          <div className="stat-card">
            <h3>Fats</h3>
            <div className="value">{Math.round(dailyStats.fats || 0)}</div>
            <div className="label">grams</div>
          </div>
        </div>
      )}

      <div className="card mb-2">
        <h2 className="mb-2">Meals for {new Date(selectedDate).toLocaleDateString()}</h2>
        
        {loading ? (
          <div className="spinner"></div>
        ) : meals.length === 0 ? (
          <p className="text-muted text-center">No meals logged for this date</p>
        ) : (
          <div>
            {meals.map((meal) => (
              <div key={meal.id || meal._id} style={{ padding: '15px', borderBottom: '1px solid #e9ecef' }}>
                <div className="flex-between">
                  <div>
                    <h3>{meal.name || meal.meal_name || 'Meal'}</h3>
                    <span className="workout-badge scheduled">{meal.meal_type || meal.mealType || 'meal'}</span>
                  </div>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(meal.id || meal._id)}
                  >
                    Delete
                  </button>
                </div>
                
                {meal.foods && meal.foods.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Foods:</strong>
                    <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                      {meal.foods.map((food, idx) => (
                        <li key={idx}>{food.food_name || food.name} - {food.calories} kcal</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {(meal.totalNutrition || meal.total_calories) && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginTop: '10px' }}>
                    <div><strong>Calories:</strong> {Math.round(meal.totalNutrition?.calories || meal.total_calories || 0)}</div>
                    <div><strong>Protein:</strong> {Math.round(meal.totalNutrition?.protein || meal.total_protein || 0)}g</div>
                    <div><strong>Carbs:</strong> {Math.round(meal.totalNutrition?.carbs || meal.total_carbs || 0)}g</div>
                    <div><strong>Fats:</strong> {Math.round(meal.totalNutrition?.fats || meal.total_fat || 0)}g</div>
                  </div>
                )}
                
                {meal.notes && <p className="text-muted mt-1"><em>{meal.notes}</em></p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Meals;
