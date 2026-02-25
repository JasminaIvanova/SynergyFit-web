const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['cardio', 'strength', 'flexibility', 'balance', 'sports'],
  },
  muscleGroups: [{
    type: String,
    enum: ['chest', 'back', 'shoulders', 'arms', 'abs', 'legs', 'glutes', 'full_body'],
  }],
  equipment: {
    type: String,
    enum: ['none', 'dumbbells', 'barbell', 'machine', 'resistance_band', 'kettlebell', 'other'],
    default: 'none',
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate',
  },
  description: String,
  instructions: [String],
  videoUrl: String,
  imageUrl: String,
  caloriesBurnedPerMinute: Number,
  isCustom: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Exercise', exerciseSchema);
