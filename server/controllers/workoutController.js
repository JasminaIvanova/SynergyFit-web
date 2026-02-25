const { supabaseAdmin } = require('../config/supabase');

// @desc    Get user's workouts
exports.getWorkouts = async (req, res) => {
  try {
    const { startDate, endDate, isCompleted, isTemplate } = req.query;
    
    let query = supabaseAdmin
      .from('workouts')
      .select('*')
      .eq('user_id', req.userId);
    
    if (startDate) {
      query = query.gte('scheduled_date', startDate);
    }
    if (endDate) {
      query = query.lte('scheduled_date', endDate);
    }
    if (isCompleted !== undefined) {
      const completedFilter = isCompleted === 'true';
      if (completedFilter) {
        query = query.not('completed_date', 'is', null);
      } else {
        query = query.is('completed_date', null);
      }
    }
    if (isTemplate !== undefined) {
      query = query.eq('is_template', isTemplate === 'true');
    }

    const { data: workouts, error } = await query.order('scheduled_date', { ascending: false });

    if (error) {
      throw error;
    }

    // Get exercises for each workout
    for (let workout of workouts || []) {
      const { data: workoutExercises } = await supabaseAdmin
        .from('workout_exercises')
        .select('*, exercise:exercises(*)')
        .eq('workout_id', workout.id)
        .order('order_index');
      
      workout.exercises = workoutExercises || [];
    }

    res.json({ workouts: workouts || [] });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new workout
exports.createWorkout = async (req, res) => {
  try {
    const { exercises, ...workoutData } = req.body;
    
    const workoutInsert = {
      ...workoutData,
      user_id: req.userId,
    };

    const { data: workout, error: workoutError } = await supabaseAdmin
      .from('workouts')
      .insert([workoutInsert])
      .select()
      .single();

    if (workoutError) {
      throw workoutError;
    }

    // Insert workout exercises if provided
    if (exercises && exercises.length > 0) {
      const workoutExercisesData = exercises.map((ex, index) => ({
        workout_id: workout.id,
        exercise_id: ex.exercise_id || ex.exercise,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        duration_seconds: ex.duration_seconds,
        rest_seconds: ex.rest_seconds,
        order_index: index,
        notes: ex.notes
      }));

      const { data: insertedExercises, error: exercisesError } = await supabaseAdmin
        .from('workout_exercises')
        .insert(workoutExercisesData)
        .select('*, exercise:exercises(*)');

      if (exercisesError) {
        throw exercisesError;
      }

      workout.exercises = insertedExercises;
    } else {
      workout.exercises = [];
    }

    res.status(201).json({ 
      message: 'Workout created successfully', 
      workout 
    });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get workout by ID
exports.getWorkoutById = async (req, res) => {
  try {
    const { data: workout, error } = await supabaseAdmin
      .from('workouts')
      .select('*, user:users(id, name, profile_picture)')
      .eq('id', req.params.id)
      .single();

    if (error || !workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Check if user owns the workout or if it's a public template
    if (workout.user_id !== req.userId && !workout.is_template) {
      return res.status(403).json({ message: 'Not authorized to view this workout' });
    }

    // Get workout exercises
    const { data: workoutExercises } = await supabaseAdmin
      .from('workout_exercises')
      .select('*, exercise:exercises(*)')
      .eq('workout_id', workout.id)
      .order('order_index');

    workout.exercises = workoutExercises || [];

    res.json({ workout });
  } catch (error) {
    console.error('Get workout by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update workout
exports.updateWorkout = async (req, res) => {
  try {
    // First check if workout exists and user owns it
    const { data: existingWorkout } = await supabaseAdmin
      .from('workouts')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (!existingWorkout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Check if user owns the workout
    if (existingWorkout.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this workout' });
    }

    const { exercises, ...workoutData } = req.body;

    // Update workout
    const { data: workout, error: updateError } = await supabaseAdmin
      .from('workouts')
      .update(workoutData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Update exercises if provided
    if (exercises) {
      // Delete existing workout exercises
      await supabaseAdmin
        .from('workout_exercises')
        .delete()
        .eq('workout_id', req.params.id);

      // Insert new exercises
      if (exercises.length > 0) {
        const workoutExercisesData = exercises.map((ex, index) => ({
          workout_id: workout.id,
          exercise_id: ex.exercise_id || ex.exercise,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          duration_seconds: ex.duration_seconds,
          rest_seconds: ex.rest_seconds,
          order_index: index,
          notes: ex.notes
        }));

        const { data: insertedExercises } = await supabaseAdmin
          .from('workout_exercises')
          .insert(workoutExercisesData)
          .select('*, exercise:exercises(*)');

        workout.exercises = insertedExercises;
      } else {
        workout.exercises = [];
      }
    } else {
      // Get existing exercises
      const { data: workoutExercises } = await supabaseAdmin
        .from('workout_exercises')
        .select('*, exercise:exercises(*)')
        .eq('workout_id', workout.id)
        .order('order_index');
      
      workout.exercises = workoutExercises || [];
    }

    res.json({ 
      message: 'Workout updated successfully', 
      workout 
    });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete workout
exports.deleteWorkout = async (req, res) => {
  try {
    // First check if workout exists and user owns it
    const { data: workout } = await supabaseAdmin
      .from('workouts')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Check if user owns the workout
    if (workout.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this workout' });
    }

    // Delete workout (workout_exercises will be deleted by CASCADE)
    const { error } = await supabaseAdmin
      .from('workouts')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark workout as completed
exports.completeWorkout = async (req, res) => {
  try {
    // First check if workout exists and user owns it
    const { data: workout } = await supabaseAdmin
      .from('workouts')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Check if user owns the workout
    if (workout.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to complete this workout' });
    }

    // Update workout as completed
    const updateData = {
      completed_date: new Date().toISOString(),
      notes: req.body.notes,
      calories_burned: req.body.caloriesBurned
    };

    const { data: updatedWorkout, error: updateError } = await supabaseAdmin
      .from('workouts')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Update user's workout streak
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('last_workout_date, workout_streak, longest_streak, total_workouts_completed')
      .eq('id', req.userId)
      .single();

    if (user) {
      const today = new Date().setHours(0, 0, 0, 0);
      const lastWorkout = user.last_workout_date 
        ? new Date(user.last_workout_date).setHours(0, 0, 0, 0)
        : null;

      let newStreak = user.workout_streak || 0;
      let newLongestStreak = user.longest_streak || 0;

      if (!lastWorkout || today > lastWorkout) {
        const dayDifference = lastWorkout 
          ? Math.floor((today - lastWorkout) / (1000 * 60 * 60 * 24))
          : 0;

        if (dayDifference === 1) {
          newStreak += 1;
        } else if (dayDifference > 1) {
          newStreak = 1;
        }

        if (newStreak > newLongestStreak) {
          newLongestStreak = newStreak;
        }

        await supabaseAdmin
          .from('users')
          .update({
            workout_streak: newStreak,
            longest_streak: newLongestStreak,
            last_workout_date: new Date().toISOString().split('T')[0],
            total_workouts_completed: (user.total_workouts_completed || 0) + 1
          })
          .eq('id', req.userId);
      }

      res.json({ 
        message: 'Workout completed successfully', 
        workout: updatedWorkout,
        streak: newStreak
      });
    } else {
      res.json({ 
        message: 'Workout completed successfully', 
        workout: updatedWorkout
      });
    }
  } catch (error) {
    console.error('Complete workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get public workout templates
exports.getPublicTemplates = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    
    let query = supabaseAdmin
      .from('workouts')
      .select('*, user:users(id, name, profile_picture)')
      .eq('is_template', true);
    
    if (category) {
      query = query.eq('workout_type', category);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data: templates, error } = await query.limit(50);

    if (error) {
      throw error;
    }

    // Get exercises for each template
    for (let template of templates || []) {
      const { data: workoutExercises } = await supabaseAdmin
        .from('workout_exercises')
        .select('*, exercise:exercises(*)')
        .eq('workout_id', template.id)
        .order('order_index');
      
      template.exercises = workoutExercises || [];
    }

    res.json({ templates: templates || [] });
  } catch (error) {
    console.error('Get public templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
