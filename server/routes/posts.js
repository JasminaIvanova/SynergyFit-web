const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// @route   GET /api/posts
// @desc    Get feed posts
// @access  Private
router.get('/', auth, postController.getPosts);

// @route   POST /api/posts
// @desc    Create new post
// @access  Private
router.post('/', auth, postController.createPost);

// @route   GET /api/posts/:id
// @desc    Get post by ID
// @access  Public
router.get('/:id', postController.getPostById);

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private
router.put('/:id', auth, postController.updatePost);

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private
router.delete('/:id', auth, postController.deletePost);

// @route   POST /api/posts/:id/like
// @desc    Like/unlike post
// @access  Private
router.post('/:id/like', auth, postController.toggleLike);

// @route   POST /api/posts/:id/comment
// @desc    Add comment to post
// @access  Private
router.post('/:id/comment', auth, postController.addComment);

// @route   DELETE /api/posts/:id/comment/:commentId
// @desc    Delete comment
// @access  Private
router.delete('/:id/comment/:commentId', auth, postController.deleteComment);

// @route   GET /api/posts/user/:userId
// @desc    Get user's posts
// @access  Public
router.get('/user/:userId', postController.getUserPosts);

module.exports = router;
