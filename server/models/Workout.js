const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  exercises: [{
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    sets: Number,
    reps: Number,
    duration: Number, // in minutes for cardio
    weight: Number, // in kg
    restTime: Number, // in seconds
    notes: String,
  }],
  totalDuration: Number, // in minutes
  caloriesBurned: Number,
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  category: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'mixed'],
  },
  scheduledDate: Date,
  completedAt: Date,
  isCompleted: {
    type: Boolean,
    default: false,
  },
  isTemplate: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  notes: String,
}, {
  timestamps: true,
});

// Calculate total duration before saving
workoutSchema.pre('save', function(next) {
  if (this.exercises && this.exercises.length > 0) {
    this.totalDuration = this.exercises.reduce((total, ex) => {
      return total + (ex.duration || 0) + ((ex.sets || 0) * (ex.restTime || 0) / 60);
    }, 0);
  }
  next();
});

module.exports = mongoose.model('Workout', workoutSchema);
