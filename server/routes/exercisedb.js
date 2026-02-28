const express = require('express');
const router = express.Router();
const exerciseDbController = require('../controllers/exerciseDbController');

// Public proxy endpoints (server holds RapidAPI key)
router.get('/liveness', exerciseDbController.liveness);
router.get('/bodyparts', exerciseDbController.getBodyparts);
router.get('/exercises', exerciseDbController.getExercises);
router.get('/exercises/search', exerciseDbController.searchExercises);
router.get('/exercises/:exerciseId', exerciseDbController.getExerciseById);

module.exports = router;
