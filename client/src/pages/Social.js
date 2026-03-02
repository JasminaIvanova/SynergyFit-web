import React, { useState, useEffect } from 'react';
import { postService } from '../services';
import { useAuth } from '../context/AuthContext';

const Social = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [commentText, setCommentText] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    try {
      const params = { page: 1, limit: 20 };
      if (filter !== 'all') params.type = filter;

      const res = await postService.getPosts(params);
      setPosts(res.data.posts || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
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
      <div className="page-header">
        <h1 className="page-title">Social Feed</h1>
        <p className="page-subtitle">Stay connected with the community</p>
      </div>

      <div className="card mb-2">
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All Posts
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
            const isLiked = post.likes?.includes(user?._id);
            
            return (
              <div key={post._id} className="post-card">
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
                      {post.user?._id === user?._id && (
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDelete(post._id)}
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
                    onClick={() => handleLike(post._id)}
                  >
                    {post.likes?.length || 0} likes
                  </button>
                  <button className="post-action-btn">
                    {post.comments?.length || 0} comments
                  </button>
                </div>

                {post.comments && post.comments.length > 0 && (
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e9ecef' }}>
                    {post.comments.map((comment) => (
                      <div key={comment._id} style={{ marginBottom: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
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
                    value={commentText[post._id] || ''}
                    onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleComment(post._id);
                    }}
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleComment(post._id)}
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
