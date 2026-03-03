const { supabaseAdmin } = require('../config/supabase');

// @desc    Get feed posts (all posts from all users)
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, following_only } = req.query;
    
    // Build query - show all posts by default
    let query = supabaseAdmin
      .from('posts')
      .select('*, user:users(id, name, profile_picture)')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    // Filter by following only if requested
    if (following_only === 'true') {
      const { data: followingData } = await supabaseAdmin
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', req.userId);
      
      const following = followingData?.map(f => f.following_id) || [];
      const userIds = [req.userId, ...following];
      query = query.in('user_id', userIds);
    }
    
    if (type) {
      query = query.eq('post_type', type);
    }

    const { data: posts, error } = await query;

    if (error) {
      throw error;
    }

    // Get likes and comments for each post
    for (let post of posts || []) {
      // Get likes count and check if user liked
      const { data: likes } = await supabaseAdmin
        .from('post_likes')
        .select('user_id')
        .eq('post_id', post.id);
      
      post.likes = likes?.map(l => l.user_id) || [];
      post.likesCount = post.likes.length;
      post.isLiked = post.likes.includes(req.userId);

      // Get comments with user info
      const { data: comments } = await supabaseAdmin
        .from('post_comments')
        .select('*, user:users(id, name, profile_picture)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      
      post.comments = comments || [];

      // Get related workout/progress data if exists
      if (post.workout_id) {
        const { data: workout } = await supabaseAdmin
          .from('workouts')
          .select('*')
          .eq('id', post.workout_id)
          .single();
        post.workout = workout;
      }

      if (post.progress_id) {
        const { data: progress } = await supabaseAdmin
          .from('progress')
          .select('*')
          .eq('id', post.progress_id)
          .single();
        post.progress = progress;
      }
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('posts')
      .select('id', { count: 'exact', head: true });
    
    if (following_only === 'true') {
      const { data: followingData } = await supabaseAdmin
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', req.userId);
      
      const following = followingData?.map(f => f.following_id) || [];
      const userIds = [req.userId, ...following];
      countQuery = countQuery.in('user_id', userIds);
    }

    const { count } = await countQuery;

    res.json({
      posts: posts || [],
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new post
exports.createPost = async (req, res) => {
  try {
    const postData = {
      ...req.body,
      user_id: req.userId,
    };

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert([postData])
      .select('*, user:users(id, name, profile_picture)')
      .single();

    if (error) {
      throw error;
    }

    post.likes = [];
    post.comments = [];
    post.likesCount = 0;
    post.isLiked = false;

    res.status(201).json({ 
      message: 'Post created successfully', 
      post 
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get post by ID
exports.getPostById = async (req, res) => {
  try {
    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .select('*, user:users(id, name, profile_picture)')
      .eq('id', req.params.id)
      .single();

    if (error || !post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get likes
    const { data: likes } = await supabaseAdmin
      .from('post_likes')
      .select('user_id')
      .eq('post_id', post.id);
    
    post.likes = likes?.map(l => l.user_id) || [];
    post.likesCount = post.likes.length;
    post.isLiked = post.likes.includes(req.userId);

    // Get comments
    const { data: comments } = await supabaseAdmin
      .from('post_comments')
      .select('*, user:users(id, name, profile_picture)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });
    
    post.comments = comments || [];

    // Get related data if exists
    if (post.workout_id) {
      const { data: workout } = await supabaseAdmin
        .from('workouts')
        .select('*')
        .eq('id', post.workout_id)
        .single();
      post.workout = workout;
    }

    if (post.progress_id) {
      const { data: progress } = await supabaseAdmin
        .from('progress')
        .select('*')
        .eq('id', post.progress_id)
        .single();
      post.progress = progress;
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update post
exports.updatePost = async (req, res) => {
  try {
    // First check if post exists and user owns it
    const { data: existingPost } = await supabaseAdmin
      .from('posts')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (existingPost.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .update(req.body)
      .eq('id', req.params.id)
      .select('*, user:users(id, name, profile_picture)')
      .single();

    if (error) {
      throw error;
    }

    res.json({ 
      message: 'Post updated successfully', 
      post 
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete post
exports.deletePost = async (req, res) => {
  try {
    // First check if post exists and user owns it
    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete post (likes and comments will be deleted by CASCADE)
    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like/unlike post
exports.toggleLike = async (req, res) => {
  try {
    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already liked
    const { data: existingLike } = await supabaseAdmin
      .from('post_likes')
      .select('id')
      .eq('post_id', req.params.id)
      .eq('user_id', req.userId)
      .single();

    if (existingLike) {
      // Unlike
      await supabaseAdmin
        .from('post_likes')
        .delete()
        .eq('post_id', req.params.id)
        .eq('user_id', req.userId);

      // Get updated count
      const { count } = await supabaseAdmin
        .from('post_likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', req.params.id);

      res.json({ message: 'Post unliked', isLiked: false, likesCount: count || 0 });
    } else {
      // Like
      await supabaseAdmin
        .from('post_likes')
        .insert([{
          post_id: req.params.id,
          user_id: req.userId
        }]);

      // Get updated count
      const { count } = await supabaseAdmin
        .from('post_likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', req.params.id);

      res.json({ message: 'Post liked', isLiked: true, likesCount: count || 0 });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add comment to post
exports.addComment = async (req, res) => {
  try {
    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { data: comment, error } = await supabaseAdmin
      .from('post_comments')
      .insert([{
        post_id: req.params.id,
        user_id: req.userId,
        comment: req.body.text
      }])
      .select('*, user:users(id, name, profile_picture)')
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({ 
      message: 'Comment added successfully', 
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { data: comment } = await supabaseAdmin
      .from('post_comments')
      .select('id, user_id')
      .eq('id', req.params.commentId)
      .eq('post_id', req.params.id)
      .single();

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or the post
    if (comment.user_id !== req.userId && post.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    const { error } = await supabaseAdmin
      .from('post_comments')
      .delete()
      .eq('id', req.params.commentId);

    if (error) {
      throw error;
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's posts
exports.getUserPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select('*, user:users(id, name, profile_picture)')
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw error;
    }

    // Get likes and comments for each post
    for (let post of posts || []) {
      const { data: likes } = await supabaseAdmin
        .from('post_likes')
        .select('user_id')
        .eq('post_id', post.id);
      
      post.likes = likes?.map(l => l.user_id) || [];
      post.likesCount = post.likes.length;
      post.isLiked = post.likes.includes(req.userId);

      const { data: comments } = await supabaseAdmin
        .from('post_comments')
        .select('*, user:users(id, name, profile_picture)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      
      post.comments = comments || [];
    }

    // Get total count
    const { count } = await supabaseAdmin
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.params.userId);

    res.json({
      posts: posts || [],
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
