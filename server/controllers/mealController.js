const { supabaseAdmin } = require('../config/supabase');

// @desc    Get user's meals
exports.getMeals = async (req, res) => {
  try {
    const { startDate, endDate, mealType } = req.query;
    
    let query = supabaseAdmin
      .from('meals')
      .select('*')
      .eq('user_id', req.userId);
    
    if (startDate) {
      query = query.gte('meal_date', startDate);
    }
    if (endDate) {
      query = query.lte('meal_date', endDate);
    }
    if (mealType) {
      query = query.eq('meal_type', mealType);
    }

    const { data: meals, error } = await query.order('meal_date', { ascending: false });

    if (error) {
      throw error;
    }

    // Get foods for each meal
    for (let meal of meals || []) {
      const { data: foods } = await supabaseAdmin
        .from('meal_foods')
        .select('*')
        .eq('meal_id', meal.id);
      
      meal.foods = foods || [];
    }

    res.json({ meals: meals || [] });
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Log new meal
exports.createMeal = async (req, res) => {
  try {
    const { foods, ...mealData } = req.body;
    
    const mealInsert = {
      ...mealData,
      user_id: req.userId,
    };

    const { data: meal, error: mealError } = await supabaseAdmin
      .from('meals')
      .insert([mealInsert])
      .select()
      .single();

    if (mealError) {
      throw mealError;
    }

    // Insert meal foods if provided
    if (foods && foods.length > 0) {
      const mealFoodsData = foods.map(food => ({
        meal_id: meal.id,
        food_name: food.food_name || food.name,
        quantity: food.quantity,
        unit: food.unit,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat
      }));

      const { data: insertedFoods, error: foodsError } = await supabaseAdmin
        .from('meal_foods')
        .insert(mealFoodsData)
        .select();

      if (foodsError) {
        throw foodsError;
      }

      meal.foods = insertedFoods;
    } else {
      meal.foods = [];
    }

    res.status(201).json({ 
      message: 'Meal logged successfully', 
      meal 
    });
  } catch (error) {
    console.error('Create meal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get meal by ID
exports.getMealById = async (req, res) => {
  try {
    const { data: meal, error } = await supabaseAdmin
      .from('meals')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    // Check if user owns the meal
    if (meal.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to view this meal' });
    }

    // Get meal foods
    const { data: foods } = await supabaseAdmin
      .from('meal_foods')
      .select('*')
      .eq('meal_id', meal.id);

    meal.foods = foods || [];

    res.json({ meal });
  } catch (error) {
    console.error('Get meal by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update meal
exports.updateMeal = async (req, res) => {
  try {
    // First check if meal exists and user owns it
    const { data: existingMeal } = await supabaseAdmin
      .from('meals')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (!existingMeal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    // Check if user owns the meal
    if (existingMeal.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this meal' });
    }

    const { foods, ...mealData } = req.body;

    // Update meal
    const { data: meal, error: updateError } = await supabaseAdmin
      .from('meals')
      .update(mealData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Update foods if provided
    if (foods) {
      // Delete existing foods
      await supabaseAdmin
        .from('meal_foods')
        .delete()
        .eq('meal_id', req.params.id);

      // Insert new foods
      if (foods.length > 0) {
        const mealFoodsData = foods.map(food => ({
          meal_id: meal.id,
          food_name: food.food_name || food.name,
          quantity: food.quantity,
          unit: food.unit,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat
        }));

        const { data: insertedFoods } = await supabaseAdmin
          .from('meal_foods')
          .insert(mealFoodsData)
          .select();

        meal.foods = insertedFoods;
      } else {
        meal.foods = [];
      }
    } else {
      // Get existing foods
      const { data: existingFoods } = await supabaseAdmin
        .from('meal_foods')
        .select('*')
        .eq('meal_id', meal.id);
      
      meal.foods = existingFoods || [];
    }

    res.json({ 
      message: 'Meal updated successfully', 
      meal 
    });
  } catch (error) {
    console.error('Update meal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete meal
exports.deleteMeal = async (req, res) => {
  try {
    // First check if meal exists and user owns it
    const { data: meal } = await supabaseAdmin
      .from('meals')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    // Check if user owns the meal
    if (meal.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this meal' });
    }

    // Delete meal (meal_foods will be deleted by CASCADE)
    const { error } = await supabaseAdmin
      .from('meals')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get daily nutrition stats
exports.getDailyStats = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const dateString = date.toISOString().split('T')[0];

    const { data: meals, error } = await supabaseAdmin
      .from('meals')
      .select('total_calories, total_protein, total_carbs, total_fat')
      .eq('user_id', req.userId)
      .eq('meal_date', dateString);

    if (error) {
      throw error;
    }

    const stats = (meals || []).reduce((totals, meal) => {
      return {
        calories: (totals.calories || 0) + (meal.total_calories || 0),
        protein: (totals.protein || 0) + (meal.total_protein || 0),
        carbs: (totals.carbs || 0) + (meal.total_carbs || 0),
        fats: (totals.fats || 0) + (meal.total_fat || 0),
      };
    }, {});

    res.json({ stats, mealsCount: meals?.length || 0 });
  } catch (error) {
    console.error('Get daily stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
