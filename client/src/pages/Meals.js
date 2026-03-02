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

  // Group meals by meal type
  const groupMealsByType = () => {
    const grouped = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };
    
    meals.forEach(meal => {
      const mealType = (meal.meal_type || 'snack').toLowerCase();
      if (grouped[mealType]) {
        grouped[mealType].push(meal);
      }
    });
    
    return grouped;
  };

  // Calculate totals for a meal type
  const calculateMealTypeStats = (mealTypeArray) => {
    return mealTypeArray.reduce((totals, meal) => ({
      calories: totals.calories + (meal.total_calories || 0),
      protein: totals.protein + (meal.total_protein || 0),
      carbs: totals.carbs + (meal.total_carbs || 0),
      fat: totals.fat + (meal.total_fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const mealTypeLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snacks'
  };

  const groupedMeals = groupMealsByType();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Nutrition Tracking</h1>
          <p className="page-subtitle">Track your daily calories and macros</p>
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

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div>
          <h2 className="mb-2" style={{ fontSize: '1.5rem', fontWeight: '600' }}>
            Meals for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
          </h2>
          
          {meals.length === 0 ? (
            <div className="card">
              <p className="text-muted text-center">No meals logged for this date</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {Object.entries(groupedMeals).map(([mealType, mealsOfType]) => {
                if (mealsOfType.length === 0) return null;
                
                const stats = calculateMealTypeStats(mealsOfType);
                
                return (
                  <div key={mealType} className="card">
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px',
                      marginBottom: '15px',
                      paddingBottom: '10px',
                      borderBottom: '2px solid var(--primary-color)'
                    }}>
                      <h3 style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: '600',
                        margin: 0, 
                        textTransform: 'uppercase',
                        color: 'var(--primary-color)'
                      }}>
                        {mealTypeLabels[mealType]}
                      </h3>
                      <span className="workout-badge scheduled" style={{ 
                        fontSize: '0.8rem',
                        padding: '3px 10px'
                      }}>
                        {stats.calories} kcal
                      </span>
                    </div>

                    {mealsOfType.map((meal) => (
                      <div 
                        key={meal.id || meal._id} 
                        style={{ 
                          marginBottom: '15px',
                          paddingBottom: '15px',
                          borderBottom: mealsOfType[mealsOfType.length - 1] === meal ? 'none' : '1px solid rgba(0, 229, 255, 0.1)'
                        }}
                      >
                        <div className="flex-between" style={{ marginBottom: '10px' }}>
                          <h4 style={{ 
                            fontSize: '1.1rem', 
                            fontWeight: '500',
                            margin: 0,
                            color: '#fff'
                          }}>
                            {meal.name || meal.meal_name || 'Meal'}
                          </h4>
                          <button 
                            className="btn btn-danger"
                            onClick={() => handleDelete(meal.id || meal._id)}
                            style={{ padding: '6px 15px', fontSize: '0.9rem' }}
                          >
                            Delete
                          </button>
                        </div>
                        
                        {meal.foods && meal.foods.length > 0 && (
                          <div style={{ marginBottom: '10px' }}>
                            <strong style={{ color: 'var(--primary-color)', fontSize: '0.95rem' }}>Foods:</strong>
                            <ul style={{ 
                              marginLeft: '20px', 
                              marginTop: '8px',
                              listStyleType: 'disc',
                              color: '#ccc'
                            }}>
                              {meal.foods.map((food, idx) => (
                                <li key={idx} style={{ marginBottom: '5px' }}>
                                  {food.food_name || food.name} - {food.calories} kcal
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
                          gap: '15px',
                          padding: '12px',
                          backgroundColor: 'rgba(0, 229, 255, 0.05)',
                          borderRadius: '8px'
                        }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '3px' }}>Calories</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                              {Math.round(meal.total_calories || 0)}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '3px' }}>Protein</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff' }}>
                              {Math.round(meal.total_protein || 0)}g
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '3px' }}>Carbs</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff' }}>
                              {Math.round(meal.total_carbs || 0)}g
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '3px' }}>Fats</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff' }}>
                              {Math.round(meal.total_fat || 0)}g
                            </div>
                          </div>
                        </div>
                        
                        {meal.notes && (
                          <p className="text-muted mt-1" style={{ 
                            fontSize: '0.9rem',
                            fontStyle: 'italic',
                            marginTop: '10px',
                            marginBottom: 0
                          }}>
                            {meal.notes}
                          </p>
                        )}
                      </div>
                    ))}

                    {/* Meal type totals */}
                    <div style={{
                      marginTop: '15px',
                      paddingTop: '15px',
                      borderTop: '1px solid rgba(0, 229, 255, 0.3)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                      gap: '15px'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '3px' }}>Total Calories</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                          {Math.round(stats.calories)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '3px' }}>Total Protein</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>
                          {Math.round(stats.protein)}g
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '3px' }}>Total Carbs</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>
                          {Math.round(stats.carbs)}g
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '3px' }}>Total Fats</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>
                          {Math.round(stats.fat)}g
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Meals;
