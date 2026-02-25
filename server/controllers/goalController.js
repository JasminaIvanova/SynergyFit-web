const { supabaseAdmin } = require('../config/supabase');

// @desc    Get user's goals
exports.getGoals = async (req, res) => {
  try {
    const { status, type } = req.query;
    
    let query = supabaseAdmin
      .from('goals')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('goal_type', type);
    }

    const { data: goals, error } = await query;

    if (error) {
      throw error;
    }

    // Get milestones for each goal
    for (let goal of goals || []) {
      const { data: milestones } = await supabaseAdmin
        .from('goal_milestones')
        .select('*')
        .eq('goal_id', goal.id)
        .order('created_at');
      
      goal.milestones = milestones || [];
    }

    res.json({ goals: goals || [] });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new goal
exports.createGoal = async (req, res) => {
  try {
    const { milestones, ...goalData } = req.body;
    
    const goalInsert = {
      ...goalData,
      user_id: req.userId,
    };

    const { data: goal, error: goalError } = await supabaseAdmin
      .from('goals')
      .insert([goalInsert])
      .select()
      .single();

    if (goalError) {
      throw goalError;
    }

    // Insert milestones if provided
    if (milestones && milestones.length > 0) {
      const milestonesData = milestones.map(milestone => ({
        goal_id: goal.id,
        title: milestone.title,
        target_value: milestone.target_value,
        completed: false
      }));

      const { data: insertedMilestones, error: milestonesError } = await supabaseAdmin
        .from('goal_milestones')
        .insert(milestonesData)
        .select();

      if (milestonesError) {
        throw milestonesError;
      }

      goal.milestones = insertedMilestones;
    } else {
      goal.milestones = [];
    }

    res.status(201).json({ 
      message: 'Goal created successfully', 
      goal 
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get goal by ID
exports.getGoalById = async (req, res) => {
  try {
    const { data: goal, error } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check if user owns the goal
    if (goal.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to view this goal' });
    }

    // Get milestones
    const { data: milestones } = await supabaseAdmin
      .from('goal_milestones')
      .select('*')
      .eq('goal_id', goal.id)
      .order('created_at');

    goal.milestones = milestones || [];

    res.json({ goal });
  } catch (error) {
    console.error('Get goal by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update goal
exports.updateGoal = async (req, res) => {
  try {
    // First check if goal exists and user owns it
    const { data: existingGoal } = await supabaseAdmin
      .from('goals')
      .select('id, user_id, target_value, status')
      .eq('id', req.params.id)
      .single();

    if (!existingGoal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check if user owns the goal
    if (existingGoal.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this goal' });
    }

    const { milestones, ...goalData } = req.body;
    
    // Auto-complete if target is reached
    if (goalData.current_value >= existingGoal.target_value && existingGoal.status === 'active') {
      goalData.status = 'completed';
      goalData.updated_at = new Date().toISOString();
    }

    const { data: goal, error: updateError } = await supabaseAdmin
      .from('goals')
      .update(goalData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Update milestones if provided
    if (milestones) {
      // Delete existing milestones
      await supabaseAdmin
        .from('goal_milestones')
        .delete()
        .eq('goal_id', req.params.id);

      // Insert new milestones
      if (milestones.length > 0) {
        const milestonesData = milestones.map(milestone => ({
          goal_id: goal.id,
          title: milestone.title,
          target_value: milestone.target_value,
          completed: milestone.completed || milestone.isCompleted || false,
          completed_date: milestone.completed_date || milestone.completedAt || null
        }));

        const { data: insertedMilestones } = await supabaseAdmin
          .from('goal_milestones')
          .insert(milestonesData)
          .select();

        goal.milestones = insertedMilestones;
      } else {
        goal.milestones = [];
      }
    } else {
      // Get existing milestones
      const { data: existingMilestones } = await supabaseAdmin
        .from('goal_milestones')
        .select('*')
        .eq('goal_id', goal.id)
        .order('created_at');
      
      goal.milestones = existingMilestones || [];
    }

    res.json({ 
      message: 'Goal updated successfully', 
      goal 
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete goal
exports.deleteGoal = async (req, res) => {
  try {
    // First check if goal exists and user owns it
    const { data: goal } = await supabaseAdmin
      .from('goals')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check if user owns the goal
    if (goal.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this goal' });
    }

    // Delete goal (goal_milestones will be deleted by CASCADE)
    const { error } = await supabaseAdmin
      .from('goals')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Complete milestone
exports.completeMilestone = async (req, res) => {
  try {
    // First check if goal exists and user owns it
    const { data: goal } = await supabaseAdmin
      .from('goals')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Check if user owns the goal
    if (goal.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this goal' });
    }

    const { milestoneId } = req.body;
    
    if (!milestoneId) {
      return res.status(400).json({ message: 'Milestone ID is required' });
    }

    // Update the specific milestone
    const { data: updatedMilestone, error: updateError } = await supabaseAdmin
      .from('goal_milestones')
      .update({
        completed: true,
        completed_date: new Date().toISOString()
      })
      .eq('id', milestoneId)
      .eq('goal_id', req.params.id)
      .select()
      .single();

    if (updateError || !updatedMilestone) {
      return res.status(400).json({ message: 'Invalid milestone' });
    }

    // Get updated goal with all milestones
    const { data: updatedGoal } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('id', req.params.id)
      .single();

    const { data: milestones } = await supabaseAdmin
      .from('goal_milestones')
      .select('*')
      .eq('goal_id', req.params.id)
      .order('created_at');

    updatedGoal.milestones = milestones || [];
    
    res.json({ 
      message: 'Milestone completed successfully', 
      goal: updatedGoal 
    });
  } catch (error) {
    console.error('Complete milestone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
