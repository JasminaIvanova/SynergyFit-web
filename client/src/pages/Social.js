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
    try {
      await postService.deletePost(postId);
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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
          <button className="btn btn-primary" onClick={() => setShowSearch(!showSearch)} style={{ gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <span>{showSearch ? 'Hide Search' : 'Search Users'}</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreatePost(!showCreatePost)} style={{ gap: '6px' }}>
            {showCreatePost ? (
              <span>Cancel</span>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>Create Post</span>
              </>
            )}
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
                    padding: '12px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div 
                    onClick={() => navigate(`/profile/${searchUser.id}`)}
                    style={{ cursor: 'pointer', flex: 1 }}
                  >
                    <strong style={{ color: 'var(--white)', fontSize: '1rem' }}>{searchUser.name || searchUser.username}</strong>
                  </div>
                  <button
                    onClick={() => handleFollow(searchUser.id)}
                    className={searchUser.is_following ? 'btn btn-secondary' : 'btn btn-primary'}
                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
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
        <div className="card mb-2" style={{ maxWidth: '620px', margin: '0 auto 20px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Create New Post</h3>
          <form onSubmit={handleCreatePost}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>Post Type</label>
              <select 
                className="form-control"
                value={newPost.type}
                onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                style={{ fontSize: '0.9rem' }}
              >
                <option value="general">General</option>
                <option value="workout">Workout</option>
                <option value="meal">Meal</option>
                <option value="progress">Progress</option>
                <option value="achievement">Achievement</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>What's on your mind?</label>
              <textarea
                className="form-control"
                rows="3"
                value={newPost.text}
                onChange={(e) => setNewPost({ ...newPost, text: e.target.value })}
                placeholder="Share your fitness journey..."
                style={{ fontSize: '0.9rem', resize: 'vertical' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>Add Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleImageSelect}
                style={{ fontSize: '0.85rem', padding: '8px' }}
              />
              {newPost.image && (
                <div style={{ 
                  marginTop: '12px', 
                  borderRadius: '8px',
                  overflow: 'hidden',
                  maxWidth: '100%',
                  backgroundColor: '#000',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={URL.createObjectURL(newPost.image)} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '400px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              )}
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={uploadingImage}
              style={{ width: '100%', padding: '10px', fontSize: '0.95rem', gap: '6px' }}
            >
              {uploadingImage ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>Share Post</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Feed Filter */}
      <div className="card mb-2" style={{ maxWidth: '620px', margin: '0 auto 20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <button 
            className={`btn ${feedFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFeedFilter('all')}
            style={{ fontSize: '0.9rem', padding: '8px 16px', gap: '6px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span>All Posts</span>
          </button>
          <button 
            className={`btn ${feedFilter === 'following' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFeedFilter('following')}
            style={{ fontSize: '0.9rem', padding: '8px 16px', gap: '6px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Following</span>
          </button>
        </div>
        <div style={{ 
          borderTop: '1px solid rgba(0, 229, 255, 0.1)', 
          paddingTop: '12px', 
          display: 'flex', 
          gap: '8px', 
          flexWrap: 'wrap' 
        }}>
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
            style={{ fontSize: '0.85rem', padding: '6px 12px' }}
          >
            All Types
          </button>
          <button 
            className={`btn ${filter === 'workout' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('workout')}
            style={{ fontSize: '0.85rem', padding: '6px 12px' }}
          >
            Workouts
          </button>
          <button 
            className={`btn ${filter === 'meal' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('meal')}
            style={{ fontSize: '0.85rem', padding: '6px 12px' }}
          >
            Meals
          </button>
          <button 
            className={`btn ${filter === 'progress' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('progress')}
            style={{ fontSize: '0.85rem', padding: '6px 12px' }}
          >
            Progress
          </button>
          <button 
            className={`btn ${filter === 'achievement' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('achievement')}
            style={{ fontSize: '0.85rem', padding: '6px 12px' }}
          >
            Achievements
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : posts.length === 0 ? (
        <div className="card text-center" style={{ maxWidth: '620px', margin: '0 auto' }}>
          <p className="text-muted">No posts to show. Follow people to see their updates!</p>
        </div>
      ) : (
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>
          {posts.map((post) => {
            const isLiked = post.isLiked || post.likes?.includes(user?.id);
            
            return (
              <div key={post.id} className="post-card">
                {/* Header with avatar and user info */}
                <div className="post-header">
                  {post.user?.profile_picture ? (
                    <img 
                      src={post.user.profile_picture} 
                      alt={post.user.name}
                      className="post-avatar"
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        objectFit: 'cover' 
                      }}
                    />
                  ) : (
                    <div className="post-avatar">
                      {getInitials(post.user?.name)}
                    </div>
                  )}
                  <div className="post-info">
                    <h4 
                      onClick={() => navigate(`/profile/${post.user?.id}`)}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = ''}
                    >{post.user?.name || 'Unknown User'}</h4>
                    <p className="post-time">{getTimeAgo(post.created_at)}</p>
                  </div>
                </div>

                {/* Display image */}
                {post.content?.image_url && (
                  <div style={{ 
                    width: '100%', 
                    overflow: 'hidden',
                    backgroundColor: '#000',
                    maxHeight: '500px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={post.content.image_url} 
                      alt="Post" 
                      style={{ 
                        width: '100%', 
                        height: 'auto',
                        objectFit: 'contain',
                        maxHeight: '500px'
                      }}
                    />
                  </div>
                )}

                {/* Display multiple images */}
                {post.content?.imageUrls && post.content.imageUrls.length > 0 && (
                  <div style={{ 
                    width: '100%', 
                    overflow: 'hidden',
                    backgroundColor: '#000'
                  }}>
                    {post.content.imageUrls.map((url, idx) => (
                      <img 
                        key={idx} 
                        src={url} 
                        alt="Post" 
                        style={{ 
                          width: '100%', 
                          height: 'auto',
                          objectFit: 'contain',
                          maxHeight: '500px'
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="post-actions">
                  <button 
                    className={`post-action-btn ${isLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                    style={{ gap: '6px' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isLiked ? '#ef4444' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    {post.likesCount || post.likes?.length || 0}
                  </button>
                  <button className="post-action-btn" style={{ gap: '6px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    {post.comments?.length || 0}
                  </button>
                </div>

                {/* Post content and type */}
                <div className="post-content">
                  <span 
                    className="workout-badge scheduled" 
                    style={{ 
                      fontSize: '0.7rem', 
                      padding: '2px 8px',
                      marginRight: '8px'
                    }}
                  >
                    {post.post_type || 'general'}
                  </span>
                  {post.content?.text && (
                    <span>
                      <strong 
                        onClick={() => navigate(`/profile/${post.user?.id}`)}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = ''}
                      >{post.user?.name}</strong> {post.content.text}
                    </span>
                  )}
                </div>

                {/* Comments */}
                {post.comments && post.comments.length > 0 && (
                  <div style={{ 
                    padding: '0 0 12px',
                    borderTop: 'none'
                  }}>
                    {post.comments.map((comment) => (
                      <div 
                        key={comment.id} 
                        style={{ 
                          marginTop: '8px',
                          fontSize: '0.9rem',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <strong style={{ color: 'var(--white)' }}>
                          {comment.user?.name}:
                        </strong>{' '}
                        {comment.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment input */}
                <div style={{ 
                  padding: '12px 0',
                  display: 'flex', 
                  gap: '10px',
                  borderTop: 'none'
                }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add a comment..."
                    value={commentText[post.id] || ''}
                    onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleComment(post.id);
                    }}
                    style={{ fontSize: '0.9rem' }}
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleComment(post.id)}
                    style={{ 
                      padding: '6px 16px',
                      fontSize: '0.85rem'
                    }}
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
