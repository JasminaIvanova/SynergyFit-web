const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { supabase } = require('./config/supabase');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const workoutRoutes = require('./routes/workouts');
const exerciseRoutes = require('./routes/exercises');
const exerciseDbRoutes = require('./routes/exercisedb');
const mealRoutes = require('./routes/meals');
const foodRoutes = require('./routes/foods');
const progressRoutes = require('./routes/progress');
const postRoutes = require('./routes/posts');
const goalRoutes = require('./routes/goals');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Supabase connection
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    console.log('✓ Supabase connected successfully');
  } catch (err) {
    console.error('Supabase connection error:', err.message);
  }
};

testSupabaseConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/exercisedb', exerciseDbRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/goals', goalRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SynergyFit API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
