const { supabaseAdmin } = require('../config/supabase');

// @desc    Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    // Get user data
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, bio, profile_picture, date_of_birth, gender, height, current_weight, target_weight, activity_level, fitness_goal, daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal, created_at')
      .eq('id', req.params.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get followers
    const { data: followers } = await supabaseAdmin
      .from('user_follows')
      .select('follower_id, users!user_follows_follower_id_fkey(id, name, profile_picture)')
      .eq('following_id', req.params.id);

    // Get following
    const { data: following } = await supabaseAdmin
      .from('user_follows')
      .select('following_id, users!user_follows_following_id_fkey(id, name, profile_picture)')
      .eq('follower_id', req.params.id);

    // Format response
    user.followers = followers?.map(f => f.users) || [];
    user.following = following?.map(f => f.users) || [];

    res.json({ user });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.params.id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const updates = req.body;
    
    // Don't allow updating sensitive fields through this endpoint
    delete updates.password_hash;
    delete updates.email;
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', req.params.id)
      .select('id, email, name, bio, profile_picture, date_of_birth, gender, height, current_weight, target_weight, activity_level, fitness_goal, daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal')
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Follow/unfollow user
exports.toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    // Check if both users exist
    const { data: targetUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', targetUserId)
      .single();

    const { data: currentUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', currentUserId)
      .single();

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    const { data: existingFollow } = await supabaseAdmin
      .from('user_follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
      .single();

    if (existingFollow) {
      // Unfollow
      await supabaseAdmin
        .from('user_follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);
      
      res.json({ message: 'Unfollowed successfully', isFollowing: false });
    } else {
      // Follow
      await supabaseAdmin
        .from('user_follows')
        .insert([{
          follower_id: currentUserId,
          following_id: targetUserId
        }]);
      
      res.json({ message: 'Followed successfully', isFollowing: true });
    }
  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user followers
exports.getFollowers = async (req, res) => {
  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { data: followersData } = await supabaseAdmin
      .from('user_follows')
      .select('follower_id, users!user_follows_follower_id_fkey(id, name, profile_picture)')
      .eq('following_id', req.params.id);

    const followers = followersData?.map(f => f.users) || [];

    res.json({ followers });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get users that user is following
exports.getFollowing = async (req, res) => {
  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { data: followingData } = await supabaseAdmin
      .from('user_follows')
      .select('following_id, users!user_follows_following_id_fkey(id, name, profile_picture)')
      .eq('follower_id', req.params.id);

    const following = followingData?.map(f => f.users) || [];

    res.json({ following });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search users
exports.searchUsers = async (req, res) => {
  try {
    const query = req.params.query;
    
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, name, profile_picture')
      .ilike('name', `%${query}%`)
      .limit(20);

    res.json({ users: users || [] });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
