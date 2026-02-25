const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const auth = require('../middleware/auth');

// @route   GET /api/workouts
// @desc    Get user's workouts
// @access  Private
router.get('/', auth, workoutController.getWorkouts);

// @route   POST /api/workouts
// @desc    Create new workout
// @access  Private
router.post('/', auth, workoutController.createWorkout);

// @route   GET /api/workouts/:id
// @desc    Get workout by ID
// @access  Private
router.get('/:id', auth, workoutController.getWorkoutById);

// @route   PUT /api/workouts/:id
// @desc    Update workout
// @access  Private
router.put('/:id', auth, workoutController.updateWorkout);

// @route   DELETE /api/workouts/:id
// @desc    Delete workout
// @access  Private
router.delete('/:id', auth, workoutController.deleteWorkout);

// @route   POST /api/workouts/:id/complete
// @desc    Mark workout as completed
// @access  Private
router.post('/:id/complete', auth, workoutController.completeWorkout);

// @route   GET /api/workouts/templates/public
// @desc    Get public workout templates
// @access  Public
router.get('/templates/public', workoutController.getPublicTemplates);

module.exports = router;
