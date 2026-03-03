const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');

// @route   POST /api/upload/image
// @desc    Upload image to Supabase Storage
// @access  Private
router.post('/image', auth, uploadController.upload.single('image'), uploadController.uploadImage);

module.exports = router;
