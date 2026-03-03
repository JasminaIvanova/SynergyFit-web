const { supabaseAdmin } = require('../config/supabase');

// @desc    Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    
    let query = supabaseAdmin
      .from('users')
      .select('id, name, email, role, status, created_at, last_login', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Search by name or email
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    // Pagination
    query = query.range((page - 1) * limit, page * limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      throw error;
    }

    // Get additional stats for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const [postsCount, workoutsCount, followersCount] = await Promise.all([
        supabaseAdmin.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabaseAdmin.from('workouts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabaseAdmin.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', user.id)
      ]);

      return {
        ...user,
        stats: {
          postsCount: postsCount.count || 0,
          workoutsCount: workoutsCount.count || 0,
          followersCount: followersCount.count || 0
        }
      };
    }));

    res.json({
      users: usersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// @desc    Update user status (suspend/activate)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "active" or "suspended"' });
    }

    // Prevent admin from suspending themselves
    if (id === req.userId && status === 'suspended') {
      return res.status(400).json({ message: 'Cannot suspend your own account' });
    }

    // Check if user exists
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, name, role')
      .eq('id', id)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user status
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.json({
      message: `User ${status === 'suspended' ? 'suspended' : 'activated'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
};

// @desc    Get all posts (admin only)
exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, user_id } = req.query;
    
    let query = supabaseAdmin
      .from('posts')
      .select('*, user:users(id, name, email, profile_picture)', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    // Filter by post type
    if (type && type !== 'all') {
      query = query.eq('post_type', type);
    }
    
    // Filter by user
    if (user_id) {
      query = query.eq('user_id', user_id);
    }
    
    // Pagination
    query = query.range((page - 1) * limit, page * limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      throw error;
    }

    // Get likes and comments count for each post
    const postsWithStats = await Promise.all(posts.map(async (post) => {
      const [likesCount, commentsCount] = await Promise.all([
        supabaseAdmin.from('post_likes').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
        supabaseAdmin.from('post_comments').select('id', { count: 'exact', head: true }).eq('post_id', post.id)
      ]);

      return {
        ...post,
        stats: {
          likesCount: likesCount.count || 0,
          commentsCount: commentsCount.count || 0
        }
      };
    }));

    res.json({
      posts: postsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};

// @desc    Delete post (admin only)
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if post exists
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Delete associated comments first
    await supabaseAdmin
      .from('post_comments')
      .delete()
      .eq('post_id', id);

    // Delete associated likes
    await supabaseAdmin
      .from('post_likes')
      .delete()
      .eq('post_id', id);

    // Delete the post
    const { error: deleteError } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
};

// @desc    Get admin dashboard statistics
exports.getStats = async (req, res) => {
  try {
    // Get counts for various entities
    const [
      usersResult,
      activeUsersResult,
      suspendedUsersResult,
      postsResult,
      workoutsResult,
      mealsResult
    ] = await Promise.all([
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
      supabaseAdmin.from('posts').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('workouts').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('meals').select('id', { count: 'exact', head: true })
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      recentUsersResult,
      recentPostsResult,
      recentWorkoutsResult
    ] = await Promise.all([
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString()),
      supabaseAdmin.from('posts').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString()),
      supabaseAdmin.from('workouts').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo.toISOString())
    ]);

    // Get most active users (by posts count)
    const { data: topUsers } = await supabaseAdmin
      .from('posts')
      .select('user_id, user:users(id, name, profile_picture)')
      .limit(1000);

    const userPostCounts = {};
    topUsers?.forEach(post => {
      if (post.user_id) {
        userPostCounts[post.user_id] = (userPostCounts[post.user_id] || 0) + 1;
      }
    });

    const topUsersList = Object.entries(userPostCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([userId, count]) => {
        const userPost = topUsers.find(p => p.user_id === userId);
        return {
          user: userPost?.user,
          postsCount: count
        };
      });

    res.json({
      users: {
        total: usersResult.count || 0,
        active: activeUsersResult.count || 0,
        suspended: suspendedUsersResult.count || 0
      },
      content: {
        posts: postsResult.count || 0,
        workouts: workoutsResult.count || 0,
        meals: mealsResult.count || 0
      },
      recentActivity: {
        newUsers: recentUsersResult.count || 0,
        newPosts: recentPostsResult.count || 0,
        newWorkouts: recentWorkoutsResult.count || 0
      },
      topUsers: topUsersList
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};
