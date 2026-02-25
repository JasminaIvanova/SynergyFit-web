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

    // Update user's current weight if provided
    if (progress.weight) {
      await supabaseAdmin
        .from('users')
        .update({ current_weight: progress.weight })
        .eq('id', req.userId);
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
        ? (lastEntry.weight - firstEntry.weight).toFixed(1)
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
    return (last - first).toFixed(1);
  }
  return null;
}
