const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  foods: [{
    name: {
      type: String,
      required: true,
    },
    servingSize: String,
    quantity: Number,
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
    fiber: Number,
  }],
  totalNutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
    fiber: Number,
  },
  imageUrl: String,
  notes: String,
  isPublic: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Calculate total nutrition before saving
mealSchema.pre('save', function(next) {
  if (this.foods && this.foods.length > 0) {
    this.totalNutrition = this.foods.reduce((totals, food) => {
      return {
        calories: (totals.calories || 0) + (food.calories || 0),
        protein: (totals.protein || 0) + (food.protein || 0),
        carbs: (totals.carbs || 0) + (food.carbs || 0),
        fats: (totals.fats || 0) + (food.fats || 0),
        fiber: (totals.fiber || 0) + (food.fiber || 0),
      };
    }, {});
  }
  next();
});

module.exports = mongoose.model('Meal', mealSchema);
