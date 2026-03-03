import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mealService } from '../services';

const Meals = () => {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [dailyStats, setDailyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' });
  const [editingFood, setEditingFood] = useState({ mealId: null, foodIndex: null });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

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

  const handleDeleteClick = (id, name) => {
    setDeleteConfirm({ show: true, id, name });
  };

  const confirmDelete = async () => {
    try {
      await mealService.deleteMeal(deleteConfirm.id);
      showNotification('Meal deleted successfully', 'success');
      loadMeals();
      loadDailyStats();
    } catch (error) {
      console.error('Error deleting meal:', error);
      showNotification('Error deleting meal', 'error');
    } finally {
      setDeleteConfirm({ show: false, id: null, name: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: null, name: '' });
  };

  const handleDeleteFood = async (mealId, foodIndex, foodName) => {
    const meal = meals.find(m => (m.id || m._id) === mealId);
    if (!meal || !meal.foods) return;

    const updatedFoods = meal.foods.filter((_, idx) => idx !== foodIndex);
    
    // If no foods left, delete the entire meal
    if (updatedFoods.length === 0) {
      handleDeleteClick(mealId, foodName);
      return;
    }

    // Recalculate totals
    const totals = updatedFoods.reduce((sum, food) => ({
      calories: sum.calories + (food.calories || 0),
      protein: sum.protein + (food.protein || 0),
      carbs: sum.carbs + (food.carbs || 0),
      fat: sum.fat + (food.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    try {
      await mealService.updateMeal(mealId, {
        ...meal,
        foods: updatedFoods,
        total_calories: totals.calories,
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_fat: totals.fat
      });
      showNotification('Food removed', 'success');
      loadMeals();
      loadDailyStats();
    } catch (error) {
      console.error('Error removing food:', error);
      showNotification('Error removing food', 'error');
    }
  };

  const handleUpdateFoodQuantity = async (mealId, foodIndex, newQuantity) => {
    const meal = meals.find(m => (m.id || m._id) === mealId);
    if (!meal || !meal.foods || !meal.foods[foodIndex]) return;

    const food = meal.foods[foodIndex];
    const oldQuantity = food.quantity || 100;
    const ratio = newQuantity / oldQuantity;
    
    const updatedFood = {
      ...food,
      quantity: newQuantity,
      calories: Math.round(food.calories * ratio),
      protein: Math.round(food.protein * ratio * 10) / 10,
      carbs: Math.round(food.carbs * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10
    };

    const updatedFoods = [...meal.foods];
    updatedFoods[foodIndex] = updatedFood;

    // Recalculate totals
    const totals = updatedFoods.reduce((sum, f) => ({
      calories: sum.calories + (f.calories || 0),
      protein: sum.protein + (f.protein || 0),
      carbs: sum.carbs + (f.carbs || 0),
      fat: sum.fat + (f.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    try {
      await mealService.updateMeal(mealId, {
        ...meal,
        foods: updatedFoods,
        total_calories: totals.calories,
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_fat: totals.fat
      });
      showNotification('Quantity updated', 'success');
      loadMeals();
      loadDailyStats();
      setEditingFood({ mealId: null, foodIndex: null });
    } catch (error) {
      console.error('Error updating food:', error);
      showNotification('Error updating quantity', 'error');
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
          minWidth: '250px'
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
            <h3 style={{ marginBottom: '15px', color: '#fff' }}>Delete Meal?</h3>
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
        <div>
          <h1 className="page-title" style={{ marginBottom: '8px' }}>Nutrition Tracking</h1>
          <p className="page-subtitle">Track your daily calories and macros</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/meals/create')}
          style={{ 
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            minWidth: '140px'
          }}
        >
          + Log Meal
        </button>
      </div>

      <div className="card mb-2" style={{ padding: '12px 16px' }}>
        <div className="form-group" style={{ marginBottom: '0' }}>
          <label style={{ marginBottom: '6px', fontSize: '0.85rem' }}>Select Date</label>
          <input
            type="date"
            className="form-control"
            style={{ padding: '8px 12px' }}
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
                      justifyContent: 'space-between',
                      marginBottom: '15px',
                      paddingBottom: '10px',
                      borderBottom: '2px solid var(--primary-color)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ 
                          fontSize: '1.3rem', 
                          fontWeight: '600',
                          margin: 0, 
                          textTransform: 'uppercase',
                          color: 'var(--primary-color)'
                        }}>
                          {mealTypeLabels[mealType]}
                        </h3>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.9rem' }}>
                        <span style={{ color: '#ccc' }}>
                          <strong style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>
                            {Math.round(stats.calories)}
                          </strong> kcal
                        </span>
                        <span style={{ color: '#999' }}>|</span>
                        <span style={{ color: '#ccc' }}>
                          P: <strong>{Math.round(stats.protein)}</strong>g
                        </span>
                        <span style={{ color: '#ccc' }}>
                          C: <strong>{Math.round(stats.carbs)}</strong>g
                        </span>
                        <span style={{ color: '#ccc' }}>
                          F: <strong>{Math.round(stats.fat)}</strong>g
                        </span>
                      </div>
                    </div>

                    {mealsOfType.map((meal, mealIdx) => (
                      <div 
                        key={meal.id || meal._id} 
                        style={{ 
                          marginBottom: mealIdx === mealsOfType.length - 1 ? '0' : '15px',
                          paddingBottom: mealIdx === mealsOfType.length - 1 ? '0' : '15px',
                          borderBottom: mealIdx === mealsOfType.length - 1 ? 'none' : '1px solid rgba(0, 229, 255, 0.15)'
                        }}
                      >
                        {meal.foods && meal.foods.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {meal.foods.map((food, idx) => {
                              const isEditing = editingFood.mealId === (meal.id || meal._id) && editingFood.foodIndex === idx;
                              
                              return (
                                <div 
                                  key={idx} 
                                  style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '20px',
                                    padding: '10px 12px',
                                    backgroundColor: 'rgba(0, 229, 255, 0.03)',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(0, 229, 255, 0.1)',
                                    position: 'relative',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(0, 229, 255, 0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.3)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(0, 229, 255, 0.03)';
                                    e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.1)';
                                  }}
                                >
                                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                      <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '500' }}>
                                        {food.food_name || food.name}
                                      </span>
                                      {food.brand && (
                                        <span style={{ color: '#999', fontSize: '0.85rem', marginLeft: '8px' }}>
                                          ({food.brand})
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* Editable Quantity */}
                                    <div 
                                      style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '6px',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => setEditingFood({ mealId: meal.id || meal._id, foodIndex: idx })}
                                    >
                                      {isEditing ? (
                                        <input
                                          type="number"
                                          defaultValue={food.quantity}
                                          onBlur={(e) => {
                                            const newQty = parseFloat(e.target.value);
                                            if (newQty > 0) {
                                              handleUpdateFoodQuantity(meal.id || meal._id, idx, newQty);
                                            } else {
                                              setEditingFood({ mealId: null, foodIndex: null });
                                            }
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.target.blur();
                                            }
                                            if (e.key === 'Escape') {
                                              setEditingFood({ mealId: null, foodIndex: null });
                                            }
                                          }}
                                          autoFocus
                                          style={{
                                            width: '60px',
                                            padding: '4px 8px',
                                            fontSize: '0.85rem',
                                            backgroundColor: 'var(--card-bg)',
                                            color: 'var(--primary-color)',
                                            border: '1px solid var(--primary-color)',
                                            borderRadius: '4px',
                                            textAlign: 'center'
                                          }}
                                        />
                                      ) : (
                                        <span 
                                          style={{ 
                                            color: 'var(--primary-color)', 
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            minWidth: '50px',
                                            textAlign: 'right',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: 'rgba(0, 229, 255, 0.1)'
                                          }}
                                          title="Click to edit"
                                        >
                                          {food.quantity}g
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    gap: '15px',
                                    fontSize: '0.85rem',
                                    color: '#ccc'
                                  }}>
                                    <span><strong style={{ color: 'var(--primary-color)' }}>{food.calories}</strong> kcal</span>
                                    <span>P: {Math.round(food.protein)}g</span>
                                    <span>C: {Math.round(food.carbs)}g</span>
                                    <span>F: {Math.round(food.fat)}g</span>
                                    
                                    {/* Delete button */}
                                    <button
                                      onClick={() => handleDeleteFood(meal.id || meal._id, idx, food.food_name || food.name)}
                                      style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: 'none',
                                        borderRadius: '6px',
                                        width: '26px',
                                        height: '26px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        padding: '0',
                                        marginLeft: '8px',
                                        transition: 'all 0.2s ease'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#EF4444';
                                        e.currentTarget.querySelector('svg').style.stroke = 'white';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                        e.currentTarget.querySelector('svg').style.stroke = '#EF4444';
                                      }}
                                      title="Delete this food"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.2s ease' }}>
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
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
