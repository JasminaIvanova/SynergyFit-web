const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  type: {
    type: String,
    required: true,
    enum: ['weight', 'strength', 'endurance', 'flexibility', 'habit', 'custom'],
  },
  target: {
    value: Number,
    unit: String, // kg, reps, minutes, etc.
  },
  current: {
    value: Number,
    unit: String,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  targetDate: Date,
  completedDate: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'abandoned'],
    default: 'active',
  },
  milestones: [{
    title: String,
    value: Number,
    completedAt: Date,
    isCompleted: {
      type: Boolean,
      default: false,
    },
  }],
  isPublic: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Goal', goalSchema);
