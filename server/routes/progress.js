const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../middleware/auth');

// @route   GET /api/progress
// @desc    Get user's progress entries
// @access  Private
router.get('/', auth, progressController.getProgress);

// @route   POST /api/progress
// @desc    Log progress entry
// @access  Private
router.post('/', auth, progressController.createProgress);

// @route   GET /api/progress/:id
// @desc    Get progress entry by ID
// @access  Private
router.get('/:id', auth, progressController.getProgressById);

// @route   PUT /api/progress/:id
// @desc    Update progress entry
// @access  Private
router.put('/:id', auth, progressController.updateProgress);

// @route   DELETE /api/progress/:id
// @desc    Delete progress entry
// @access  Private
router.delete('/:id', auth, progressController.deleteProgress);

// @route   GET /api/progress/stats/summary
// @desc    Get progress statistics
// @access  Private
router.get('/stats/summary', auth, progressController.getProgressStats);

module.exports = router;
