const { supabaseAdmin } = require('../config/supabase');

// @desc    Get all exercises
exports.getExercises = async (req, res) => {
  try {
    const { category, muscleGroups, difficulty, equipment } = req.query;
    
    let query = supabaseAdmin
      .from('exercises')
      .select('*, created_by_user:users!exercises_created_by_fkey(id, name)');
    
    if (category) {
      query = query.eq('category', category);
    }
    if (difficulty) {
      query = query.eq('difficulty_level', difficulty);
    }
    if (equipment) {
      query = query.eq('equipment', equipment);
    }
    if (muscleGroups) {
      const groups = muscleGroups.split(',');
      query = query.in('muscle_group', groups);
    }

    const { data: exercises, error } = await query;

    if (error) {
      throw error;
    }

    res.json({ exercises: exercises || [] });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create custom exercise
exports.createExercise = async (req, res) => {
  try {
    const exerciseData = {
      ...req.body,
      is_custom: true,
      created_by: req.userId,
    };

    const { data: exercise, error } = await supabaseAdmin
      .from('exercises')
      .insert([exerciseData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({ 
      message: 'Exercise created successfully', 
      exercise 
    });
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get exercise by ID
exports.getExerciseById = async (req, res) => {
  try {
    const { data: exercise, error } = await supabaseAdmin
      .from('exercises')
      .select('*, created_by_user:users!exercises_created_by_fkey(id, name, profile_picture)')
      .eq('id', req.params.id)
      .single();

    if (error || !exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.json({ exercise });
  } catch (error) {
    console.error('Get exercise by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update exercise
exports.updateExercise = async (req, res) => {
  try {
    // First get the exercise to check permissions
    const { data: exercise } = await supabaseAdmin
      .from('exercises')
      .select('id, is_custom, created_by')
      .eq('id', req.params.id)
      .single();

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Only allow updating custom exercises created by the user
    if (!exercise.is_custom || exercise.created_by !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this exercise' });
    }

    const { data: updatedExercise, error } = await supabaseAdmin
      .from('exercises')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ 
      message: 'Exercise updated successfully', 
      exercise: updatedExercise 
    });
  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete exercise
exports.deleteExercise = async (req, res) => {
  try {
    // First get the exercise to check permissions
    const { data: exercise } = await supabaseAdmin
      .from('exercises')
      .select('id, is_custom, created_by')
      .eq('id', req.params.id)
      .single();

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Only allow deleting custom exercises created by the user
    if (!exercise.is_custom || exercise.created_by !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this exercise' });
    }

    const { error } = await supabaseAdmin
      .from('exercises')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
