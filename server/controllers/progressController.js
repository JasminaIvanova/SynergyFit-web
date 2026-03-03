const { supabaseAdmin } = require('../config/supabase');

// @desc    Get user's progress entries
exports.getProgress = async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;
    
    let query = supabaseAdmin
      .from('progress')
      .select('*')
      .eq('user_id', req.userId)
      .order('date', { ascending: false });
    
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: progress, error } = await query;

    if (error) {
      throw error;
    }

    res.json({ progress: progress || [] });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Log progress entry
exports.createProgress = async (req, res) => {
  try {
    const progressData = {
      ...req.body,
      user_id: req.userId,
    };

    const { data: progress, error: progressError } = await supabaseAdmin
      .from('progress')
      .insert([progressData])
      .select()
      .single();

    if (progressError) {
      throw progressError;
    }

    console.log('Progress entry created:', { 
      id: progress.id, 
      weight: progress.weight, 
      user_id: progress.user_id 
    });

    // Update user's current weight if provided
    if (progress.weight) {
      console.log('Updating user current_weight to:', progress.weight);
      
      await supabaseAdmin
        .from('users')
        .update({ current_weight: progress.weight })
        .eq('id', req.userId);

      // Update active weight goals with new current value
      const { data: weightGoals, error: goalsError } = await supabaseAdmin
        .from('goals')
        .select('*')
        .eq('user_id', req.userId)
        .eq('goal_type', 'weight')
        .eq('status', 'active');

      console.log('Found weight goals:', weightGoals?.length || 0);
      if (weightGoals && weightGoals.length > 0) {
        console.log('Weight goals details:', weightGoals.map(g => ({ 
          id: g.id, 
          title: g.title, 
          current: g.current_value, 
          target: g.target_value 
        })));
      }

      // Update each weight goal and check if completed
      for (const goal of weightGoals || []) {
        const updateData = { current_value: progress.weight };
        
        // Check if goal is reached
        const current = parseFloat(progress.weight);
        const target = parseFloat(goal.target_value);
        const difference = Math.abs(current - target);
        
        console.log(`Updating goal ${goal.id}: current ${current} -> target ${target}, difference: ${difference}kg`);
        
        // Within 0.1kg (100g) tolerance
        if (difference <= 0.1) {
          updateData.status = 'completed';
          console.log('Goal reached! Marking as completed (within 0.1kg tolerance).');
        }

        const { error: updateError } = await supabaseAdmin
          .from('goals')
          .update(updateData)
          .eq('id', goal.id);

        if (updateError) {
          console.error('Error updating goal:', updateError);
        } else {
          console.log('Goal updated successfully:', updateData);
        }
      }
    }

    // Update measurement-related goals if measurements provided
    const measurementGoalUpdates = [
      { measurement: progress.chest_measurement, keyword: 'chest' },
      { measurement: progress.waist_measurement, keyword: 'waist' },
      { measurement: progress.hips_measurement, keyword: 'hips' },
      { measurement: progress.arms_measurement, keyword: 'arms' },
      { measurement: progress.thighs_measurement, keyword: 'thighs' }
    ];

    for (const { measurement, keyword } of measurementGoalUpdates) {
      if (measurement) {
        const { data: measurementGoals } = await supabaseAdmin
          .from('goals')
          .select('*')
          .eq('user_id', req.userId)
          .eq('status', 'active')
          .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);

        for (const goal of measurementGoals || []) {
          const updateData = { current_value: measurement };
          
          // Check if goal is reached (within 0.5cm tolerance for measurements)
          if (goal.target_value && Math.abs(parseFloat(measurement) - parseFloat(goal.target_value)) <= 0.5) {
            updateData.status = 'completed';
          }

          await supabaseAdmin
            .from('goals')
            .update(updateData)
            .eq('id', goal.id);
        }
      }
    }

    res.status(201).json({ 
      message: 'Progress logged successfully', 
      progress 
    });
  } catch (error) {
    console.error('Create progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get progress entry by ID
exports.getProgressById = async (req, res) => {
  try {
    const { data: progress, error } = await supabaseAdmin
      .from('progress')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !progress) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    // Check if user owns the progress entry
    if (progress.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to view this progress entry' });
    }

    res.json({ progress });
  } catch (error) {
    console.error('Get progress by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update progress entry
exports.updateProgress = async (req, res) => {
  try {
    // First check if progress exists and user owns it
    const { data: existingProgress } = await supabaseAdmin
      .from('progress')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (!existingProgress) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    // Check if user owns the progress entry
    if (existingProgress.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this progress entry' });
    }

    const { data: progress, error } = await supabaseAdmin
      .from('progress')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ 
      message: 'Progress updated successfully', 
      progress 
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete progress entry
exports.deleteProgress = async (req, res) => {
  try {
    // First check if progress exists and user owns it
    const { data: progress } = await supabaseAdmin
      .from('progress')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    // Check if user owns the progress entry
    if (progress.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this progress entry' });
    }

    const { error } = await supabaseAdmin
      .from('progress')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Progress deleted successfully' });
  } catch (error) {
    console.error('Delete progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get progress statistics
exports.getProgressStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // Default to last 30 days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    const startDateString = startDate.toISOString().split('T')[0];

    const { data: progressEntries, error } = await supabaseAdmin
      .from('progress')
      .select('*')
      .eq('user_id', req.userId)
      .gte('date', startDateString)
      .order('date', { ascending: true });

    if (error) {
      throw error;
    }

    if (!progressEntries || progressEntries.length === 0) {
      return res.json({ 
        message: 'No progress data available',
        stats: null 
      });
    }

    // Calculate statistics
    const firstEntry = progressEntries[0];
    const lastEntry = progressEntries[progressEntries.length - 1];

    const stats = {
      weightChange: lastEntry.weight && firstEntry.weight 
        ? parseFloat((lastEntry.weight - firstEntry.weight).toFixed(1))
        : null,
      totalEntries: progressEntries.length,
      averageWeight: progressEntries.reduce((sum, entry) => 
        sum + (entry.weight || 0), 0) / progressEntries.length,
      measurements: {
        chest: calculateChange(firstEntry.chest_measurement, lastEntry.chest_measurement),
        waist: calculateChange(firstEntry.waist_measurement, lastEntry.waist_measurement),
        hips: calculateChange(firstEntry.hips_measurement, lastEntry.hips_measurement),
        arms: calculateChange(firstEntry.arms_measurement, lastEntry.arms_measurement),
        thighs: calculateChange(firstEntry.thighs_measurement, lastEntry.thighs_measurement),
      },
      bodyFatChange: lastEntry.body_fat_percentage && firstEntry.body_fat_percentage
        ? (lastEntry.body_fat_percentage - firstEntry.body_fat_percentage).toFixed(1)
        : null,
      chartData: progressEntries.map(entry => ({
        date: entry.date,
        weight: entry.weight,
        bodyFatPercentage: entry.body_fat_percentage,
      })),
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get progress stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to calculate change
function calculateChange(first, last) {
  if (first && last) {
    return parseFloat((last - first).toFixed(1));
  }
  return null;
}
