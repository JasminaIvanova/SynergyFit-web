const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  weight: Number, // in kg
  bodyMeasurements: {
    chest: Number, // in cm
    waist: Number,
    hips: Number,
    arms: Number,
    thighs: Number,
  },
  bodyFatPercentage: Number,
  photos: [{
    url: String,
    type: {
      type: String,
      enum: ['front', 'side', 'back'],
    },
  }],
  notes: String,
  mood: {
    type: String,
    enum: ['excellent', 'good', 'okay', 'bad', 'terrible'],
  },
  energyLevel: {
    type: Number,
    min: 1,
    max: 10,
  },
}, {
  timestamps: true,
});

// Index for efficient date queries
progressSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Progress', progressSchema);
