const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['workout', 'meal', 'progress', 'achievement', 'text'],
  },
  content: {
    text: String,
    imageUrls: [String],
  },
  // References to related entities
  workout: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
  },
  meal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal',
  },
  progress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Progress',
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [commentSchema],
  isPublic: {
    type: Boolean,
    default: true,
  },
  tags: [String],
}, {
  timestamps: true,
});

// Index for efficient feed queries
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
