import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mealService, foodService } from '../services';

const MealCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState([]);
  
  const [mealData, setMealData] = useState({
    name: '',
    meal_type: 'breakfast',
    meal_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await foodService.searchFoods(searchQuery);
      setSearchResults(res.data.products || []);
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching for foods');
    } finally {
      setSearching(false);
    }
  };

  const calculateNutritionForQuantity = (product, quantity = 100) => {
    const multiplier = quantity / 100;
    return {
      calories: Math.round((product.nutrition.caloriesPer100g || 0) * multiplier),
      protein: Math.round((product.nutrition.proteinPer100g || 0) * multiplier * 10) / 10,
      carbs: Math.round((product.nutrition.carbsPer100g || 0) * multiplier * 10) / 10,
      fat: Math.round((product.nutrition.fatPer100g || 0) * multiplier * 10) / 10,
      fiber: Math.round((product.nutrition.fiberPer100g || 0) * multiplier * 10) / 10,
    };
  };

  const addFoodToMeal = (product) => {
    const newFood = {
      id: Date.now(),
      barcode: product.barcode,
      food_name: product.name,
      brand: product.brand,
      quantity: 100,
      unit: 'g',
      ...calculateNutritionForQuantity(product, 100),
      nutritionPer100g: product.nutrition,
    };
    setSelectedFoods([...selectedFoods, newFood]);
  };

  const updateFoodQuantity = (foodId, quantity) => {
    setSelectedFoods(selectedFoods.map(food => {
      if (food.id === foodId) {
        const parsedQuantity = parseFloat(quantity) || 0;
        return {
          ...food,
          quantity: parsedQuantity,
          ...calculateNutritionForQuantity({ nutrition: food.nutritionPer100g }, parsedQuantity),
        };
      }
      return food;
    }));
  };

  const removeFood = (foodId) => {
    setSelectedFoods(selectedFoods.filter(food => food.id !== foodId));
  };

  const calculateTotalNutrition = () => {
    return selectedFoods.reduce((totals, food) => ({
      calories: totals.calories + (food.calories || 0),
      protein: totals.protein + (food.protein || 0),
      carbs: totals.carbs + (food.carbs || 0),
      fat: totals.fat + (food.fat || 0),
      fiber: totals.fiber + (food.fiber || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!mealData.name.trim()) {
      alert('Please enter a meal name');
      return;
    }

    if (selectedFoods.length === 0) {
      alert('Please add at least one food item');
      return;
    }

    setLoading(true);
    try {
      const totalNutrition = calculateTotalNutrition();
      
      const mealPayload = {
        ...mealData,
        total_calories: totalNutrition.calories,
        total_protein: totalNutrition.protein,
        total_carbs: totalNutrition.carbs,
        total_fat: totalNutrition.fat,
        total_fiber: totalNutrition.fiber,
        foods: selectedFoods.map(food => ({
          food_name: food.food_name,
          brand: food.brand,
          barcode: food.barcode,
          quantity: food.quantity,
          unit: food.unit,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber,
        })),
      };

      await mealService.createMeal(mealPayload);
      alert('Meal logged successfully!');
      navigate('/meals');
    } catch (error) {
      console.error('Create meal error:', error);
      alert('Error creating meal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalNutrition = calculateTotalNutrition();

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Log New Meal</h1>
        <p className="page-subtitle">Search and add foods to track your nutrition</p>
      </div>

      {/* Meal Details */}
      <div className="card mb-2">
        <h2 className="mb-2">Meal Details</h2>
        <div className="form-group">
          <label>Meal Name *</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g., Breakfast, Post-workout meal"
            value={mealData.name}
            onChange={(e) => setMealData({ ...mealData, name: e.target.value })}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Meal Type *</label>
            <select
              className="form-control"
              value={mealData.meal_type}
              onChange={(e) => setMealData({ ...mealData, meal_type: e.target.value })}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              className="form-control"
              value={mealData.meal_date}
              onChange={(e) => setMealData({ ...mealData, meal_date: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Notes (optional)</label>
          <textarea
            className="form-control"
            placeholder="Add any notes about this meal..."
            rows="2"
            value={mealData.notes}
            onChange={(e) => setMealData({ ...mealData, notes: e.target.value })}
          />
        </div>
      </div>

      {/* Food Search */}
      <div className="card mb-2">
        <h2 className="mb-2">Search Foods</h2>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search for foods (e.g., chicken breast, apple, milk...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={searching || !searchQuery.trim()}
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {searchResults.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '10px' }}>Search Results</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {searchResults.map((product, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px',
                    borderBottom: '1px solid #e9ecef',
                    gap: '15px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1 }}>
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, marginBottom: '5px' }}>{product.name}</h4>
                      {product.brand && <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>{product.brand}</p>}
                      <div style={{ fontSize: '0.85rem', color: '#495057', marginTop: '5px' }}>
                        Per 100g: {Math.round(product.nutrition.caloriesPer100g)}kcal | 
                        P: {Math.round(product.nutrition.proteinPer100g)}g | 
                        C: {Math.round(product.nutrition.carbsPer100g)}g | 
                        F: {Math.round(product.nutrition.fatPer100g)}g
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => addFoodToMeal(product)}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Foods */}
      {selectedFoods.length > 0 && (
        <div className="card mb-2">
          <h2 className="mb-2">Selected Foods ({selectedFoods.length})</h2>
          <div>
            {selectedFoods.map((food) => (
              <div
                key={food.id}
                style={{
                  padding: '15px',
                  borderBottom: '1px solid #e9ecef',
                }}
              >
                <div className="flex-between" style={{ marginBottom: '10px' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{food.food_name}</h4>
                    {food.brand && <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>{food.brand}</p>}
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => removeFood(food.id)}
                  >
                    Remove
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ margin: 0 }}>Quantity:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={food.quantity}
                      onChange={(e) => updateFoodQuantity(food.id, e.target.value)}
                      min="0"
                      step="1"
                      style={{ width: '100px' }}
                    />
                    <span>{food.unit}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', fontSize: '0.9rem' }}>
                  <div><strong>Calories:</strong> {food.calories}kcal</div>
                  <div><strong>Protein:</strong> {food.protein}g</div>
                  <div><strong>Carbs:</strong> {food.carbs}g</div>
                  <div><strong>Fat:</strong> {food.fat}g</div>
                  {food.fiber > 0 && <div><strong>Fiber:</strong> {food.fiber}g</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Total Nutrition */}
          <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px', marginTop: '15px' }}>
            <h3 style={{ marginBottom: '15px' }}>Total Nutrition</h3>
            <div className="dashboard-grid">
              <div className="stat-card">
                <div className="value">{Math.round(totalNutrition.calories)}</div>
                <div className="label">Calories</div>
              </div>
              <div className="stat-card">
                <div className="value">{Math.round(totalNutrition.protein * 10) / 10}g</div>
                <div className="label">Protein</div>
              </div>
              <div className="stat-card">
                <div className="value">{Math.round(totalNutrition.carbs * 10) / 10}g</div>
                <div className="label">Carbs</div>
              </div>
              <div className="stat-card">
                <div className="value">{Math.round(totalNutrition.fat * 10) / 10}g</div>
                <div className="label">Fat</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex-between">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/meals')}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading || selectedFoods.length === 0 || !mealData.name.trim()}
        >
          {loading ? 'Saving...' : 'Log Meal'}
        </button>
      </div>
    </div>
  );
};

export default MealCreate;
