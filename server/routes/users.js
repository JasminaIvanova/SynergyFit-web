const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Public
router.get('/:id', userController.getUserProfile);

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', auth, userController.updateUserProfile);

// @route   POST /api/users/:id/follow
// @desc    Follow/unfollow user
// @access  Private
router.post('/:id/follow', auth, userController.toggleFollow);

// @route   GET /api/users/:id/followers
// @desc    Get user followers
// @access  Public
router.get('/:id/followers', userController.getFollowers);

// @route   GET /api/users/:id/following
// @desc    Get users that user is following
// @access  Public
router.get('/:id/following', userController.getFollowing);

// @route   GET /api/users/search/:query
// @desc    Search users
// @access  Public
router.get('/search/:query', userController.searchUsers);

module.exports = router;
