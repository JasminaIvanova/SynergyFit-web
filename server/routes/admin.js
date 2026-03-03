const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const adminController = require('../controllers/adminController');

// All routes require authentication and admin privileges
router.use(authenticate);
router.use(requireAdmin);

// User management routes
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

// Content moderation routes
router.get('/posts', adminController.getAllPosts);
router.delete('/posts/:id', adminController.deletePost);

// Statistics
router.get('/stats', adminController.getStats);

module.exports = router;
