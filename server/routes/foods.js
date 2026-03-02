const express = require('express');
const router = express.Router();
const foodSearchController = require('../controllers/foodSearchController');
const auth = require('../middleware/auth');

// @route   GET /api/foods/search
// @desc    Search for foods in Open Food Facts database
// @access  Private
router.get('/search', auth, foodSearchController.searchFoods);

// @route   GET /api/foods/barcode/:barcode
// @desc    Get food details by barcode
// @access  Private
router.get('/barcode/:barcode', auth, foodSearchController.getFoodByBarcode);

module.exports = router;
