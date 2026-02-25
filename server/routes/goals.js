const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const auth = require('../middleware/auth');

// @route   GET /api/goals
// @desc    Get user's goals
// @access  Private
router.get('/', auth, goalController.getGoals);

// @route   POST /api/goals
// @desc    Create new goal
// @access  Private
router.post('/', auth, goalController.createGoal);

// @route   GET /api/goals/:id
// @desc    Get goal by ID
// @access  Private
router.get('/:id', auth, goalController.getGoalById);

// @route   PUT /api/goals/:id
// @desc    Update goal
// @access  Private
router.put('/:id', auth, goalController.updateGoal);

// @route   DELETE /api/goals/:id
// @desc    Delete goal
// @access  Private
router.delete('/:id', auth, goalController.deleteGoal);

// @route   POST /api/goals/:id/milestone
// @desc    Complete milestone
// @access  Private
router.post('/:id/milestone', auth, goalController.completeMilestone);

module.exports = router;
