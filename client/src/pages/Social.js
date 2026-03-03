import React, { useState, useEffect } from 'react';
import { postService, userService, uploadService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Social = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [feedFilter, setFeedFilter] = useState('all'); // 'all' or 'following'
  const [commentText, setCommentText] = useState({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ type: 'general', text: '', image: null });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    loadPosts();
  }, [filter, feedFilter]);

  const loadPosts = async () => {
    try {
      const params = { page: 1, limit: 50 };
      if (filter !== 'all') params.type = filter;
      if (feedFilter === 'following') params.following_only = 'true';

      const res = await postService.getPosts(params);
      setPosts(res.data.posts || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image must be less than 5MB', 'error');
      return;
    }

    setNewPost({ ...newPost, image: file });
  };

  const uploadImage = async (file) => {
    try {
      setUploadingImage(true);
      const response = await uploadService.uploadImage(file);
      return response.data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.text.trim() &&!newPost.image) {
      showNotification('Please add text or image', 'error');
      return;
    }

    try {
      let imageUrl = null;
      if (newPost.image) {
        imageUrl = await uploadImage(newPost.image);
      }

      await postService.createPost({
        post_type: newPost.type,
        content: { 
          text: newPost.text,
          image_url: imageUrl
        }
      });
      showNotification('Post created successfully!');
      setShowCreatePost(false);
      setNewPost({ type: 'general', text: '', image: null });
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      showNotification('Error creating post', 'error');
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await userService.searchUsers(query);
      setSearchResults(res.data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleFollow = async (userId) => {
    try {
      await userService.toggleFollow(userId);
      showNotification('Follow status updated');
      // Refresh search results
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    } catch (error) {
      console.error('Error following user:', error);
      showNotification('Error updating follow status', 'error');
    }
  };

  const handleLike = async (postId) => {
    try {
      await postService.toggleLike(postId);
      loadPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text || !text.trim()) return;

    try {
      await postService.addComment(postId, { text });
      setCommentText({ ...commentText, [postId]: '' });
      loadPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(postId);
        loadPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const getInitials = (username) => {
    return username?.substring(0, 2).toUpperCase() || 'U';
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="page">
      {notification.show && (
        <div className={`notification ${notification.type === 'error' ? 'notification-error' : ''}`}>
          {notification.message}
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Social Feed</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={() => setShowSearch(!showSearch)}>
            🔍 {showSearch ? 'Hide Search' : 'Search Users'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreatePost(!showCreatePost)}>
            {showCreatePost ? 'Cancel' : '✏️ Create Post'}
          </button>
        </div>
      </div>

      {/* Search Section */}
      {showSearch && (
        <div className="card mb-2">
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search for users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          {searchResults.length > 0 && (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {searchResults.map(searchUser => (
                <div 
                  key={searchUser.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '10px',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <div 
                    onClick={() => navigate(`/profile/${searchUser.id}`)}
                    style={{ cursor: 'pointer', flex: 1 }}
                  >
                    <strong>{searchUser.full_name || searchUser.username}</strong>
                    <div style={{ fontSize: '0.9em', color: '#666' }}>@{searchUser.username}</div>
                  </div>
                  <button
                    onClick={() => handleFollow(searchUser.id)}
                    className={searchUser.is_following ? 'btn btn-secondary' : 'btn btn-primary'}
                    style={{ padding: '5px 15px' }}
                  >
                    {searchUser.is_following ? 'Unfollow' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showCreatePost && (
        <div className="card mb-2">
          <h3 style={{ marginBottom: '16px' }}>Create New Post</h3>
          <form onSubmit={handleCreatePost}>
            <div className="form-group">
              <label>Post Type</label>
              <select 
                className="form-control"
                value={newPost.type}
                onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
              >
                <option value="general">General</option>
                <option value="workout">Workout</option>
                <option value="meal">Meal</option>
                <option value="progress">Progress</option>
                <option value="achievement">Achievement</option>
              </select>
            </div>
            <div className="form-group">
              <label>What's on your mind?</label>
              <textarea
                className="form-control"
                rows="4"
                value={newPost.text}
                onChange={(e) => setNewPost({ ...newPost, text: e.target.value })}
                placeholder="Share your fitness journey..."
              />
            </div>
            <div className="form-group">
              <label>Add Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleImageSelect}
              />
              {newPost.image && (
                <div style={{ marginTop: '10px' }}>
                  <img 
                    src={URL.createObjectURL(newPost.image)} 
                    alt="Preview" 
                    style={{ maxWidth: '300px', maxHeight: '300px', borderRadius: '8px' }}
                  />
                </div>
              )}
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={uploadingImage}
            >
              {uploadingImage ? 'Uploading...' : 'Post'}
            </button>
          </form>
        </div>
      )}

      {/* Feed Filter */}
      <div className="card mb-2">
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <button 
            className={`btn ${feedFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFeedFilter('all')}
          >
            🌍 All Posts
          </button>
          <button 
            className={`btn ${feedFilter === 'following' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFeedFilter('following')}
          >
            👥 Following
          </button>
        </div>
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All Types
          </button>
          <button 
            className={`btn ${filter === 'workout' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('workout')}
          >
            Workouts
          </button>
          <button 
            className={`btn ${filter === 'meal' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('meal')}
          >
            Meals
          </button>
          <button 
            className={`btn ${filter === 'progress' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('progress')}
          >
            Progress
          </button>
          <button 
            className={`btn ${filter === 'achievement' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('achievement')}
          >
            Achievements
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : posts.length === 0 ? (
        <div className="card text-center">
          <p className="text-muted">No posts to show. Follow people to see their updates!</p>
        </div>
      ) : (
        <div>
          {posts.map((post) => {
            const isLiked = post.isLiked || post.likes?.includes(user?.id);
            
            return (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-avatar">
                    {getInitials(post.user?.name)}
                  </div>
                  <div className="post-info" style={{ flex: 1 }}>
                    <div className="flex-between">
                      <div>
                        <h4>{post.user?.name}</h4>
                        <p className="post-time">{getTimeAgo(post.createdAt)}</p>
                      </div>
                      {post.user?.id === user?.id && (
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDelete(post.id)}
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <span className="workout-badge scheduled">{post.type}</span>
                  {post.content?.text && (
                    <p style={{ marginTop: '10px' }}>{post.content.text}</p>
                  )}
                  
                  {/* Display single image from image_url */}
                  {post.content?.image_url && (
                    <div style={{ marginTop: '10px' }}>
                      <img 
                        src={post.content.image_url} 
                        alt="Post" 
                        style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '10px' }}
                      />
                    </div>
                  )}

                  {/* Display multiple images from imageUrls array */}
                  {post.content?.imageUrls && post.content.imageUrls.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      {post.content.imageUrls.map((url, idx) => (
                        <img 
                          key={idx} 
                          src={url} 
                          alt="Post" 
                          style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '10px' }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="post-actions">
                  <button 
                    className={`post-action-btn ${isLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    {post.likesCount || post.likes?.length || 0} likes
                  </button>
                  <button className="post-action-btn">
                    {post.comments?.length || 0} comments
                  </button>
                </div>

                {post.comments && post.comments.length > 0 && (
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e9ecef' }}>
                    {post.comments.map((comment) => (
                      <div key={comment.id} style={{ marginBottom: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                        <strong>{comment.user?.name}: </strong>
                        <span>{comment.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add a comment..."
                    value={commentText[post.id] || ''}
                    onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleComment(post.id);
                    }}
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleComment(post.id)}
                  >
                    Post
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Social;
