import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mealService, foodService } from '../services';

const MealCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [popularFoods, setPopularFoods] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchIsOffline, setSearchIsOffline] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [showMealForm, setShowMealForm] = useState(false);
  const [error, setError] = useState(null);
  
  const [mealData, setMealData] = useState({
    name: '',
    meal_type: 'breakfast',
    meal_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    // Show offline data immediately, then try to update with online data
    loadPopularFoods();
  }, []);

  const loadPopularFoods = async () => {
    // Start with offline fallback data immediately
    const offlineData = [
      { barcode: '0000000000000', name: 'Chicken Breast (Raw)', brand: 'Generic', nutrition: { caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, fiberPer100g: 0 } },
      { barcode: '0000000000001', name: 'Banana', brand: 'Generic', nutrition: { caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, fiberPer100g: 2.6 } },
      { barcode: '0000000000002', name: 'Brown Rice (Cooked)', brand: 'Generic', nutrition: { caloriesPer100g: 112, proteinPer100g: 2.6, carbsPer100g: 24, fatPer100g: 0.9, fiberPer100g: 1.8 } },
      { barcode: '0000000000003', name: 'Whole Eggs', brand: 'Generic', nutrition: { caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, fiberPer100g: 0 } },
      { barcode: '0000000000004', name: 'Salmon (Raw)', brand: 'Generic', nutrition: { caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, fiberPer100g: 0 } },
      { barcode: '0000000000005', name: 'Broccoli (Raw)', brand: 'Generic', nutrition: { caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, fiberPer100g: 2.6 } },
      { barcode: '0000000000006', name: 'Sweet Potato', brand: 'Generic', nutrition: { caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1, fiberPer100g: 3 } },
      { barcode: '0000000000007', name: 'Greek Yogurt (Plain)', brand: 'Generic', nutrition: { caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 0 } },
      { barcode: '0000000000008', name: 'Oats (Dry)', brand: 'Generic', nutrition: { caloriesPer100g: 389, proteinPer100g: 17, carbsPer100g: 66, fatPer100g: 7, fiberPer100g: 11 } },
      { barcode: '0000000000009', name: 'Almonds', brand: 'Generic', nutrition: { caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, fiberPer100g: 12 } },
      { barcode: '0000000000010', name: 'Apple', brand: 'Generic', nutrition: { caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, fiberPer100g: 2.4 } },
      { barcode: '0000000000011', name: 'Whole Milk', brand: 'Generic', nutrition: { caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3, fiberPer100g: 0 } }
    ];
    
    setPopularFoods(offlineData);
    
    // Try to fetch from API in the background (non-blocking)
    try {
      const res = await foodService.getPopularFoods();
      if (res.data.products?.length > 0 && res.data.products[0].imageUrl !== null) {
        // Only update if we got real online data (not the same fallback)
        setPopularFoods(res.data.products);
        console.log('Updated with online food data');
      }
    } catch (error) {
      console.log('Using offline food database (API unavailable)');
      // Keep offline data - already set above
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError(null);
    setSearchIsOffline(false);
    try {
      const res = await foodService.searchFoods(searchQuery);
      setSearchResults(res.data.products || []);
      setSearchIsOffline(res.data.offline || false);
      if (res.data.products.length === 0) {
        setError('No foods found. Try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(error.response?.data?.message || 'Error searching for foods. Please try again.');
      setSearchResults([]);
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
    setShowMealForm(true); // Open meal details immediately
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

  // Food card component for cleaner rendering
  const FoodCard = ({ product, onAdd }) => (
    <div style={{
      border: '1px solid rgba(0, 229, 255, 0.3)',
      borderRadius: '12px',
      padding: '15px',
      backgroundColor: 'var(--card-bg)',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      boxShadow: '0 2px 8px rgba(0, 229, 255, 0.1)',
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 229, 255, 0.25)';
      e.currentTarget.style.borderColor = 'var(--primary-color)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 229, 255, 0.1)';
      e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.3)';
    }}
    >
      
      <div style={{ flex: 1 }}>
        <h4 style={{ 
          margin: 0, 
          marginBottom: '4px', 
          fontSize: '0.95rem', 
          fontWeight: '600',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.3',
          color: '#fff'
        }}>
          {product.name}
        </h4>
        
        {product.brand && (
          <p style={{ 
            margin: 0, 
            marginBottom: '8px', 
            fontSize: '0.8rem', 
            color: '#999',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {product.brand}
          </p>
        )}
        
        {product.nutriScore && (
          <span style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            backgroundColor: product.nutriScore === 'a' ? '#4CAF50' : 
                           product.nutriScore === 'b' ? '#8BC34A' :
                           product.nutriScore === 'c' ? '#FFC107' :
                           product.nutriScore === 'd' ? '#FF9800' : '#FF5722',
            color: '#fff',
            marginBottom: '8px'
          }}>
            NUTRI-SCORE {product.nutriScore?.toUpperCase()}
          </span>
        )}
        
        <div style={{ 
          fontSize: '0.8rem', 
          color: '#ccc',
          marginTop: '8px',
          padding: '8px',
          backgroundColor: 'rgba(0, 229, 255, 0.05)',
          borderRadius: '6px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--primary-color)' }}>Per 100g:</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
            <div>{Math.round(product.nutrition.caloriesPer100g)} kcal</div>
            <div>{Math.round(product.nutrition.proteinPer100g)}g protein</div>
            <div>{Math.round(product.nutrition.carbsPer100g)}g carbs</div>
            <div>{Math.round(product.nutrition.fatPer100g)}g fat</div>
          </div>
        </div>
      </div>
      
      <button
        className="btn btn-primary"
        onClick={(e) => {
          e.stopPropagation();
          onAdd(product);
        }}
        style={{ 
          marginTop: '12px',
          width: '100%',
          padding: '10px',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}
      >
        + Add to Meal
      </button>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1 className="page-title">Log New Meal</h1>
            <p className="page-subtitle">Search and add foods from Open Food Facts database</p>
          </div>
          {selectedFoods.length > 0 && (
            <button
              className="btn btn-primary"
              onClick={() => setShowMealForm(true)}
              style={{ fontSize: '0.9rem' }}
            >
              Review & Save ({selectedFoods.length} items)
            </button>
          )}
        </div>
      </div>

      {/* Search Bar - Prominent at top */}
      <div className="card mb-2" style={{ position: 'sticky', top: '10px', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search foods... (e.g., chicken breast, banana, whole milk)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  flex: 1,
                  paddingLeft: '15px',
                  height: '50px',
                  fontSize: '1rem',
                  borderRadius: '8px'
                }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={searching || !searchQuery.trim()}
              style={{ 
                height: '50px',
                minWidth: '120px',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '8px'
              }}
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
        
        {error && (
          <div style={{ 
            marginTop: '15px', 
            padding: '12px', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffc107',
            borderRadius: '6px',
            color: '#856404',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="card mb-2">
          <h2 className="mb-2">Search Results ({searchResults.length})</h2>
          {searchIsOffline && (
            <p style={{ color: '#ff9800', marginBottom: '15px', fontSize: '0.9rem' }}>
              Showing offline results - Open Food Facts API is currently unavailable
            </p>
          )}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
            gap: '20px' 
          }}>
            {searchResults.map((product, idx) => (
              <FoodCard key={idx} product={product} onAdd={addFoodToMeal} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Foods - Show when no search results */}
      {searchResults.length === 0 && !searching && popularFoods.length > 0 && (
        <div className="card mb-2">
          <h2 className="mb-2">Common Foods</h2>
          <p style={{ color: '#999', marginBottom: '15px', fontSize: '0.9rem' }}>
            Browse common foods below or use the search bar above to find specific foods from Open Food Facts
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
            gap: '20px' 
          }}>
            {popularFoods.map((product, idx) => (
              <FoodCard key={idx} product={product} onAdd={addFoodToMeal} />
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {searchResults.length === 0 && !searching && popularFoods.length === 0 && !error && (
        <div className="card mb-2" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h3 style={{ marginBottom: '10px' }}>Start by searching for foods</h3>
          <p style={{ color: '#999', fontSize: '0.95rem' }}>
            Use the search bar above to find foods from the Open Food Facts database.
            <br />
            Try searching for foods like "chicken breast", "banana", "brown rice", etc.
          </p>
        </div>
      )}

      {/* Meal Form Modal/View */}
      {showMealForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--primary-color)',
            borderRadius: '12px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '30px',
            boxShadow: '0 10px 40px rgba(0, 229, 255, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#fff' }}>Meal Details</h2>
              <button
                onClick={() => setShowMealForm(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '5px 10px',
                  color: 'var(--primary-color)'
                }}
              >
                ✕
              </button>
            </div>

            {/* Meal Form */}
            <div className="form-group">
              <label>Meal Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Breakfast, Post-workout meal, Lunch"
                value={mealData.name}
                onChange={(e) => setMealData({ ...mealData, name: e.target.value })}
                style={{ height: '45px', fontSize: '1rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Meal Type *</label>
                <select
                  className="form-control"
                  value={mealData.meal_type}
                  onChange={(e) => setMealData({ ...mealData, meal_type: e.target.value })}
                  style={{ height: '45px', fontSize: '1rem' }}
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
                  style={{ height: '45px', fontSize: '1rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea
                className="form-control"
                placeholder="Add any notes about this meal..."
                rows="3"
                value={mealData.notes}
                onChange={(e) => setMealData({ ...mealData, notes: e.target.value })}
                style={{ fontSize: '1rem' }}
              />
            </div>

            <hr style={{ margin: '20px 0' }} />
            <hr style={{ margin: '20px 0' }} />

            {/* Selected Foods Review */}
            <h3 style={{ marginBottom: '15px', color: '#fff' }}>Selected Foods ({selectedFoods.length})</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
              {selectedFoods.map((food) => (
                <div
                  key={food.id}
                  style={{
                    padding: '15px',
                    border: '1px solid rgba(0, 229, 255, 0.3)',
                    backgroundColor: 'rgba(0, 229, 255, 0.05)',
                    marginBottom: '10px',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{food.food_name}</h4>
                      {food.brand && <p style={{ color: '#999', margin: 0, fontSize: '0.85rem' }}>{food.brand}</p>}
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => removeFood(food.id)}
                      style={{ padding: '5px 12px', fontSize: '0.85rem' }}
                    >
                      Remove
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <label style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>Quantity:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={food.quantity}
                      onChange={(e) => updateFoodQuantity(food.id, e.target.value)}
                      min="0"
                      step="1"
                      style={{ width: '100px', height: '35px' }}
                    />
                    <span style={{ fontSize: '0.9rem' }}>{food.unit}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#ccc' }}>
                    <span><strong style={{ color: 'var(--primary-color)' }}>{food.calories}</strong> kcal</span>
                    <span>P: <strong>{food.protein}g</strong></span>
                    <span>C: <strong>{food.carbs}g</strong></span>
                    <span>F: <strong>{food.fat}g</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Nutrition Summary */}
            <div style={{ backgroundColor: 'rgba(0, 229, 255, 0.1)', border: '1px solid var(--primary-color)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, marginBottom: '15px', color: 'var(--primary-color)' }}>Total Nutrition</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {Math.round(totalNutrition.calories)}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#999' }}>Calories</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>
                    {Math.round(totalNutrition.protein)}g
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#999' }}>Protein</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>
                    {Math.round(totalNutrition.carbs)}g
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#999' }}>Carbs</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>
                    {Math.round(totalNutrition.fat)}g
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#999' }}>Fat</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowMealForm(false)}
                disabled={loading}
                style={{ flex: 1, height: '48px', fontSize: '1rem' }}
              >
                ← Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading || selectedFoods.length === 0 || !mealData.name.trim()}
                style={{ flex: 2, height: '48px', fontSize: '1rem', fontWeight: '600' }}
              >
                {loading ? 'Saving...' : 'Save Meal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealCreate;
