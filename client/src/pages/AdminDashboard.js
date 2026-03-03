import React, { useState, useEffect } from 'react';
import { adminService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [expandedPost, setExpandedPost] = useState(null);
  const [comments, setComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [filters, setFilters] = useState({
    userStatus: 'all',
    postType: 'all',
    searchQuery: ''
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    loadStats();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'posts') {
      loadPosts();
    }
  }, [activeTab, filters]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStats();
      setStats(res.data);
    } catch (error) {
      console.error('Error loading stats:', error);
      showNotification('Error loading statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        status: filters.userStatus,
        search: filters.searchQuery
      };
      const res = await adminService.getAllUsers(params);
      setUsers(res.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      showNotification('Error loading users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = {
        type: filters.postType
      };
      const res = await adminService.getAllPosts(params);
      setPosts(res.data.posts || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      showNotification('Error loading posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const confirmMessage = newStatus === 'suspended'
      ? 'Are you sure you want to suspend this user?'
      : 'Are you sure you want to activate this user?';

    if (!window.confirm(confirmMessage)) return;

    try {
      await adminService.updateUserStatus(userId, newStatus);
      showNotification(`User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`);
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      showNotification(error.response?.data?.message || 'Error updating user status', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      await adminService.deletePost(postId);
      showNotification('Post deleted successfully');
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      showNotification('Error deleting post', 'error');
    }
  };

  const handleToggleComments = async (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }

    setExpandedPost(postId);

    if (!comments[postId]) {
      setLoadingComments({ ...loadingComments, [postId]: true });
      try {
        const res = await adminService.getPostComments(postId);
        setComments({ ...comments, [postId]: res.data.comments });
      } catch (error) {
        console.error('Error loading comments:', error);
        showNotification('Error loading comments', 'error');
      } finally {
        setLoadingComments({ ...loadingComments, [postId]: false });
      }
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await adminService.deleteComment(commentId);
      showNotification('Comment deleted successfully');
      
      // Remove comment from state
      const updatedComments = comments[postId].filter(c => c.id !== commentId);
      setComments({ ...comments, [postId]: updatedComments });
      
      // Reload posts to update comment count
      loadPosts();
    } catch (error) {
      console.error('Error deleting comment:', error);
      showNotification('Error deleting comment', 'error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStats = () => {
    if (!stats) return <div className="loading">Loading statistics...</div>;

    return (
      <div className="admin-stats">
        <h2>Dashboard Statistics</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.users.total}</p>
              <div className="stat-details">
                <span className="stat-item active">✓ Active: {stats.users.active}</span>
                <span className="stat-item suspended">⊘ Suspended: {stats.users.suspended}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>Content</h3>
              <div className="stat-details">
                <span className="stat-item">Posts: {stats.content.posts}</span>
                <span className="stat-item">Workouts: {stats.content.workouts}</span>
                <span className="stat-item">Meals: {stats.content.meals}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>Recent Activity (7 days)</h3>
              <div className="stat-details">
                <span className="stat-item">New Users: {stats.recentActivity.newUsers}</span>
                <span className="stat-item">New Posts: {stats.recentActivity.newPosts}</span>
                <span className="stat-item">New Workouts: {stats.recentActivity.newWorkouts}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <h3>Top Active Users</h3>
              <div className="top-users-list">
                {stats.topUsers.map((item, index) => (
                  <div key={index} className="top-user-item">
                    <span className="rank">#{index + 1}</span>
                    {item.user?.id ? (
                      <Link to={`/profile/${item.user.id}`} className="user-name user-link">
                        {item.user.name}
                      </Link>
                    ) : (
                      <span className="user-name">Unknown</span>
                    )}
                    <span className="posts-count">{item.postsCount} posts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    return (
      <div className="admin-users">
        <div className="section-header">
          <h2>User Management</h2>
          <div className="filters">
            <input
              type="text"
              placeholder="Search users..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="search-input"
            />
            <select
              value={filters.userStatus}
              onChange={(e) => setFilters({ ...filters, userStatus: e.target.value })}
              className="filter-select"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Stats</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={u.status === 'suspended' ? 'suspended-row' : ''}>
                    <td>
                      <div className="user-cell">
                        <Link to={`/profile/${u.id}`} className="user-link">
                          <strong>{u.name}</strong>
                        </Link>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>{u.role}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.status}`}>{u.status}</span>
                    </td>
                    <td>{formatDate(u.created_at)}</td>
                    <td>
                      <div className="user-stats">
                        <span title="Posts">{u.stats?.postsCount || 0}📝</span>
                        <span title="Workouts">{u.stats?.workoutsCount || 0}💪</span>
                        <span title="Followers">{u.stats?.followersCount || 0}👥</span>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleUserStatusChange(u.id, u.status)}
                        className={`action-btn ${u.status === 'active' ? 'suspend' : 'activate'}`}
                        disabled={u.role === 'admin'}
                      >
                        {u.status === 'active' ? '⊘ Suspend' : '✓ Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="no-data">No users found</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderPosts = () => {
    return (
      <div className="admin-posts">
        <div className="section-header">
          <h2>Content Moderation</h2>
          <div className="filters">
            <select
              value={filters.postType}
              onChange={(e) => setFilters({ ...filters, postType: e.target.value })}
              className="filter-select"
            >
              <option value="all">All Posts</option>
              <option value="general">General</option>
              <option value="workout">Workout</option>
              <option value="meal">Meal</option>
              <option value="progress">Progress</option>
              <option value="achievement">Achievement</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => {
              // Parse content if it's a string
              let postContent = post.content;
              let postText = '';
              let postImage = null;

              if (typeof postContent === 'string') {
                try {
                  const parsed = JSON.parse(postContent);
                  postText = parsed.text || '';
                  postImage = parsed.image_url || null;
                } catch (e) {
                  postText = postContent;
                }
              } else if (postContent) {
                postText = postContent.text || '';
                postImage = postContent.image_url || null;
              }

              // Also check for image_url at top level
              if (!postImage && post.image_url) {
                postImage = post.image_url;
              }

              const postComments = comments[post.id] || [];
              const isExpanded = expandedPost === post.id;

              return (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-user">
                      <Link to={`/profile/${post.user?.id}`} className="user-link">
                        <strong>{post.user?.name || 'Unknown User'}</strong>
                      </Link>
                      <span className="post-date">{formatDate(post.created_at)}</span>
                    </div>
                    <span className={`post-type-badge ${post.post_type}`}>
                      {post.post_type}
                    </span>
                  </div>

                  <div className="post-content">
                    {postText && <p>{postText}</p>}
                    {postImage && (
                      <img src={postImage} alt="Post" className="post-image" />
                    )}
                  </div>

                  <div className="post-stats">
                    <span>❤️ {post.stats?.likesCount || 0} likes</span>
                    <button 
                      className="comments-toggle"
                      onClick={() => handleToggleComments(post.id)}
                    >
                      💬 {post.stats?.commentsCount || 0} comments
                      <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="comments-section">
                      {loadingComments[post.id] ? (
                        <div className="loading-comments">Loading comments...</div>
                      ) : postComments.length > 0 ? (
                        <div className="comments-list">
                          {postComments.map((comment) => (
                            <div key={comment.id} className="comment-item">
                              <div className="comment-header">
                                <Link to={`/profile/${comment.user?.id}`} className="comment-user user-link">
                                  <strong>{comment.user?.name || 'Unknown'}</strong>
                                </Link>
                                <span className="comment-date">{formatDate(comment.created_at)}</span>
                              </div>
                              <p className="comment-text">{comment.comment}</p>
                              <button
                                onClick={() => handleDeleteComment(post.id, comment.id)}
                                className="action-btn delete-comment"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-comments">No comments yet</div>
                      )}
                    </div>
                  )}

                  <div className="post-actions">
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="action-btn delete"
                    >
                      🗑️ Delete Post
                    </button>
                  </div>
                </div>
              );
            })}
            {posts.length === 0 && (
              <div className="no-data">No posts found</div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page admin-dashboard">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="page-header admin-header">
        <div>
          <h1 className="page-title">🛡️ Admin Dashboard</h1>
          <p className="page-subtitle">Manage users and moderate content</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistics
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          📝 Posts
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'stats' && renderStats()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'posts' && renderPosts()}
      </div>
    </div>
  );
};

export default AdminDashboard;
