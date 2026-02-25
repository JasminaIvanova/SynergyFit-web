const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const auth = require('../middleware/auth');

// @route   GET /api/exercises
// @desc    Get all exercises
// @access  Public
router.get('/', exerciseController.getExercises);

// @route   POST /api/exercises
// @desc    Create custom exercise
// @access  Private
router.post('/', auth, exerciseController.createExercise);

// @route   GET /api/exercises/:id
// @desc    Get exercise by ID
// @access  Public
router.get('/:id', exerciseController.getExerciseById);

// @route   PUT /api/exercises/:id
// @desc    Update exercise
// @access  Private
router.put('/:id', auth, exerciseController.updateExercise);

// @route   DELETE /api/exercises/:id
// @desc    Delete exercise
// @access  Private
router.delete('/:id', auth, exerciseController.deleteExercise);

module.exports = router;
