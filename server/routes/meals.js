const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const auth = require('../middleware/auth');

// @route   GET /api/meals
// @desc    Get user's meals
// @access  Private
router.get('/', auth, mealController.getMeals);

// @route   POST /api/meals
// @desc    Log new meal
// @access  Private
router.post('/', auth, mealController.createMeal);

// @route   GET /api/meals/:id
// @desc    Get meal by ID
// @access  Private
router.get('/:id', auth, mealController.getMealById);

// @route   PUT /api/meals/:id
// @desc    Update meal
// @access  Private
router.put('/:id', auth, mealController.updateMeal);

// @route   DELETE /api/meals/:id
// @desc    Delete meal
// @access  Private
router.delete('/:id', auth, mealController.deleteMeal);

// @route   GET /api/meals/stats/daily
// @desc    Get daily nutrition stats
// @access  Private
router.get('/stats/daily', auth, mealController.getDailyStats);

module.exports = router;
