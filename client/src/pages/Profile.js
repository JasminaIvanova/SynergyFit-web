import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, postService, uploadService } from '../services';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [editingPost, setEditingPost] = useState(null);
  const [editPostForm, setEditPostForm] = useState({ text: '', type: '', image_url: '' });
  const [newImage, setNewImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteConfirmPost, setDeleteConfirmPost] = useState(null);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalType, setModalType] = useState('followers'); // 'followers' or 'following'
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    profile_picture: '',
    date_of_birth: '',
    gender: '',
    height: '',
    current_weight: '',
    target_weight: '',
    activity_level: '',
    fitness_goal: '',
    daily_calorie_goal: '',
    daily_protein_goal: '',
    daily_carbs_goal: '',
    daily_fat_goal: ''
  });

  const isOwnProfile = !id || id === currentUser?.id;
  const profileId = id || currentUser?.id;

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    if (profileId) {
      loadProfile();
      loadPosts();
      if (!isOwnProfile) {
        loadFollowStatus();
      }
    }
  }, [profileId]);

  const loadProfile = async () => {
    try {
      // Always load from server to get fresh data
      const res = await userService.getUserProfile(profileId);
      setUser(res.data.user);
      
      if (isOwnProfile) {
        setProfileForm({
          name: res.data.user?.name || '',
          bio: res.data.user?.bio || '',
          profile_picture: res.data.user?.profile_picture || '',
          date_of_birth: res.data.user?.date_of_birth || '',
          gender: res.data.user?.gender || '',
          height: res.data.user?.height || '',
          current_weight: res.data.user?.current_weight || '',
          target_weight: res.data.user?.target_weight || '',
          activity_level: res.data.user?.activity_level || '',
          fitness_goal: res.data.user?.fitness_goal || '',
          daily_calorie_goal: res.data.user?.daily_calorie_goal || '',
          daily_protein_goal: res.data.user?.daily_protein_goal || '',
          daily_carbs_goal: res.data.user?.daily_carbs_goal || '',
          daily_fat_goal: res.data.user?.daily_fat_goal || ''
        });
      }

      // Load followers and following
      const [followersRes, followingRes] = await Promise.all([
        userService.getFollowers(profileId),
        userService.getFollowing(profileId),
      ]);
      
      setFollowers(followersRes.data.followers || []);
      setFollowing(followingRes.data.following || []);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const res = await postService.getUserPosts(profileId, { limit: 20 });
      setPosts(res.data.posts || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const loadFollowStatus = async () => {
    if (currentUser && user) {
      setIsFollowing(user.followers?.includes(currentUser.id));
    }
  };

  const handleFollow = async () => {
    try {
      const res = await userService.toggleFollow(profileId);
      setIsFollowing(res.data.isFollowing);
      loadProfile();
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await postService.deletePost(postId);
      showNotification('Post deleted successfully!');
      setDeleteConfirmPost(null);
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      showNotification('Error deleting post', 'error');
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post.id);
    setEditPostForm({
      text: post.content?.text || '',
      type: post.post_type || 'general',
      image_url: post.content?.image_url || ''
    });
    setNewImage(null);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
    }
  };

  const handleRemoveImage = () => {
    setNewImage(null);
    setEditPostForm({ ...editPostForm, image_url: '' });
  };

  const handleSaveEdit = async (postId) => {
    try {
      setUploadingImage(true);
      let imageUrl = editPostForm.image_url;

      // Upload new image if selected
      if (newImage) {
        const uploadRes = await uploadService.uploadImage(newImage);
        imageUrl = uploadRes.data.url;
      }

      await postService.updatePost(postId, {
        post_type: editPostForm.type,
        content: {
          text: editPostForm.text,
          image_url: imageUrl
        }
      });
      showNotification('Post updated successfully!');
      setEditingPost(null);
      setNewImage(null);
      loadPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      showNotification('Error updating post', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditPostForm({ text: '', type: '', image_url: '' });
    setNewImage(null);
  };

  const handleLike = async (postId) => {
    try {
      await postService.toggleLike(postId);
      loadPosts();
    } catch (error) {
      console.error('Error liking post:', error);
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

  const handleProfileImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploadingProfileImage(true);
      
      // Upload image
      const uploadRes = await uploadService.uploadImage(file);
      const imageUrl = uploadRes.data.url;
      
      // Update profile immediately
      await userService.updateUserProfile(profileId, { profile_picture: imageUrl });
      
      // Update local state
      setUser({ ...user, profile_picture: imageUrl });
      setProfileForm({ ...profileForm, profile_picture: imageUrl });
      
      showNotification('Profile image updated!');
      
      // Reload profile to ensure sync
      const res = await userService.getUserProfile(profileId);
      setUser(res.data.user);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      showNotification('Error uploading image', 'error');
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const handleRemoveProfileImage = async () => {
    try {
      setUploadingProfileImage(true);
      
      // Update profile to remove image
      await userService.updateUserProfile(profileId, { profile_picture: '' });
      
      // Update local state
      setUser({ ...user, profile_picture: '' });
      setProfileForm({ ...profileForm, profile_picture: '' });
      
      showNotification('Profile image removed!');
    } catch (error) {
      console.error('Error removing profile image:', error);
      showNotification('Error removing image', 'error');
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await userService.updateUserProfile(profileId, profileForm);
      showNotification('Profile updated successfully!');
      setEditMode(false);
      // Reload profile to get updated data
      const res = await userService.getUserProfile(profileId);
      setUser(res.data.user);
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Error updating profile', 'error');
    }
  };

  const handleFormChange = (field) => (e) => {
    setProfileForm({ ...profileForm, [field]: e.target.value });
  };

  const calculateMacros = () => {
    const { date_of_birth, gender, height, current_weight, activity_level, fitness_goal } = profileForm;
    
    if (!date_of_birth || !gender || !height || !current_weight || !activity_level || !fitness_goal) {
      showNotification('Please fill in Date of Birth, Gender, Height, Weight, Activity Level, and Fitness Goal first', 'error');
      return;
    }

    // Calculate age from date of birth
    const birthDate = new Date(date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 15 || age > 100) {
      showNotification('Please enter a valid date of birth', 'error');
      return;
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = 10 * parseFloat(current_weight) + 6.25 * parseFloat(height) - 5 * age + 5;
    } else {
      bmr = 10 * parseFloat(current_weight) + 6.25 * parseFloat(height) - 5 * age - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    // Calculate TDEE
    const tdee = bmr * (activityMultipliers[activity_level] || 1.2);

    // Adjust calories based on fitness goal
    let calories;
    let proteinRatio, carbsRatio, fatsRatio;

    switch (fitness_goal) {
      case 'lose_weight':
        calories = tdee - 500; // 500 calorie deficit
        proteinRatio = 0.4; // 40% protein
        carbsRatio = 0.3; // 30% carbs
        fatsRatio = 0.3; // 30% fats
        break;
      case 'maintain_weight':
        calories = tdee;
        proteinRatio = 0.3;
        carbsRatio = 0.4;
        fatsRatio = 0.3;
        break;
      case 'gain_muscle':
        calories = tdee + 300; // 300 calorie surplus
        proteinRatio = 0.35;
        carbsRatio = 0.45;
        fatsRatio = 0.2;
        break;
      case 'body_recomposition':
        calories = tdee;
        proteinRatio = 0.4;
        carbsRatio = 0.35;
        fatsRatio = 0.25;
        break;
      default:
        calories = tdee;
        proteinRatio = 0.3;
        carbsRatio = 0.4;
        fatsRatio = 0.3;
    }

    // Calculate macros (protein and carbs = 4 cal/g, fats = 9 cal/g)
    const protein = Math.round((calories * proteinRatio) / 4);
    const carbs = Math.round((calories * carbsRatio) / 4);
    const fats = Math.round((calories * fatsRatio) / 9);

    setProfileForm({
      ...profileForm,
      daily_calorie_goal: Math.round(calories),
      daily_protein_goal: protein,
      daily_carbs_goal: carbs,
      daily_fat_goal: fats
    });

    showNotification('Macros calculated successfully! Review and save your changes.');
  };

  if (loading) {
    return (
      <div className="page">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page">
        <div className="card text-center">
          <p>User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {notification.show && (
        <div className={`notification ${notification.type === 'error' ? 'notification-error' : ''}`}>
          {notification.message}
        </div>
      )}

      <div className="card mb-2">
        <div className="flex-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              {(user.profile_picture || (isOwnProfile && profileForm.profile_picture)) ? (
                <img 
                  src={user.profile_picture || (isOwnProfile ? profileForm.profile_picture : '')} 
                  alt={user.name}
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    border: '2px solid rgba(139, 92, 246, 0.3)'
                  }}
                />
              ) : (
                <div className="post-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  {user.name?.substring(0, 2).toUpperCase()}
                </div>
              )}
              {isOwnProfile && editMode && (
                <label 
                  htmlFor="profile-image-upload"
                  style={{ 
                    position: 'absolute',
                    bottom: '-5px',
                    right: '-5px',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '2px solid var(--card-bg)',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <input 
                    id="profile-image-upload"
                    type="file" 
                    accept="image/*"
                    onChange={handleProfileImageSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
            <div>
              <h1 style={{ marginBottom: '5px' }}>{user.name}</h1>
              {user.bio && <p style={{ marginTop: '10px', color: '#868e96' }}>{user.bio}</p>}
              {isOwnProfile && uploadingProfileImage && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--primary-color)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                  <span style={{ fontSize: '0.85rem' }}>Uploading image...</span>
                </div>
              )}
              {isOwnProfile && editMode && (user.profile_picture || profileForm.profile_picture) && !uploadingProfileImage && (
                <button 
                  type="button"
                  onClick={handleRemoveProfileImage}
                  className="btn btn-danger"
                  style={{ marginTop: '10px', padding: '4px 12px', fontSize: '0.8rem', gap: '4px' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Remove Photo
                </button>
              )}
            </div>
          </div>
          
          {isOwnProfile ? (
            <button 
              className="btn btn-primary"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          ) : (
            <button 
              className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleFollow}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '30px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e9ecef' }}>
          <div>
            <strong>{posts.length}</strong>
            <p className="text-muted">Posts</p>
          </div>
          <div 
            onClick={() => { setModalType('followers'); setShowFollowModal(true); }}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <strong>{followers.length}</strong>
            <p className="text-muted">Followers</p>
          </div>
          <div 
            onClick={() => { setModalType('following'); setShowFollowModal(true); }}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <strong>{following.length}</strong>
            <p className="text-muted">Following</p>
          </div>
        </div>
      </div>

      {editMode && isOwnProfile && (
        <div className="card mb-2">
          <h2 className="mb-2">Edit Profile</h2>
          <form onSubmit={handleSaveProfile}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileForm.name}
                  onChange={handleFormChange('name')}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  value={profileForm.date_of_birth}
                  onChange={handleFormChange('date_of_birth')}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select
                  className="form-control"
                  value={profileForm.gender}
                  onChange={handleFormChange('gender')}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  className="form-control"
                  value={profileForm.height}
                  onChange={handleFormChange('height')}
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label>Current Weight (kg)</label>
                <input
                  type="number"
                  className="form-control"
                  value={profileForm.current_weight}
                  onChange={handleFormChange('current_weight')}
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label>Target Weight (kg)</label>
                <input
                  type="number"
                  className="form-control"
                  value={profileForm.target_weight}
                  onChange={handleFormChange('target_weight')}
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label>Activity Level</label>
                <select
                  className="form-control"
                  value={profileForm.activity_level}
                  onChange={handleFormChange('activity_level')}
                >
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                  <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                  <option value="very_active">Very Active (6-7 days/week)</option>
                  <option value="extremely_active">Extremely Active (2x per day)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fitness Goal</label>
                <select
                  className="form-control"
                  value={profileForm.fitness_goal}
                  onChange={handleFormChange('fitness_goal')}
                >
                  <option value="">Select fitness goal</option>
                  <option value="lose_weight">Lose Weight</option>
                  <option value="maintain_weight">Maintain Weight</option>
                  <option value="gain_muscle">Gain Muscle</option>
                  <option value="body_recomposition">Body Recomposition</option>
                </select>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(76, 175, 80, 0.1)', 
              padding: '16px', 
              borderRadius: '8px', 
              marginTop: '20px',
              border: '1px solid rgba(76, 175, 80, 0.3)'
            }}>
              <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>Auto-Calculate Nutrition Goals</h3>
              <p style={{ marginBottom: '12px', fontSize: '0.9rem', color: '#868e96' }}>
                Fill in the fields above (Date of Birth, Gender, Height, Weight, Activity Level, Fitness Goal) and click calculate to automatically set your macro targets.
              </p>
              <button 
                type="button"
                className="btn btn-success"
                onClick={calculateMacros}
                style={{ marginBottom: '12px', gap: '8px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2"></rect>
                  <line x1="8" y1="6" x2="16" y2="6"></line>
                  <line x1="16" y1="10" x2="8" y2="10"></line>
                  <line x1="8" y1="14" x2="16" y2="14"></line>
                  <line x1="16" y1="18" x2="8" y2="18"></line>
                </svg>
                Calculate My Macros
              </button>
            </div>

            <div className="grid grid-2" style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Daily Calorie Goal (kcal)</label>
                <input
                  type="number"
                  className="form-control"
                  value={profileForm.daily_calorie_goal}
                  onChange={handleFormChange('daily_calorie_goal')}
                />
              </div>

              <div className="form-group">
                <label>Protein Goal (g)</label>
                <input
                  type="number"
                  className="form-control"
                  value={profileForm.daily_protein_goal}
                  onChange={handleFormChange('daily_protein_goal')}
                />
              </div>

              <div className="form-group">
                <label>Carbs Goal (g)</label>
                <input
                  type="number"
                  className="form-control"
                  value={profileForm.daily_carbs_goal}
                  onChange={handleFormChange('daily_carbs_goal')}
                />
              </div>

              <div className="form-group">
                <label>Fats Goal (g)</label>
                <input
                  type="number"
                  className="form-control"
                  value={profileForm.daily_fat_goal}
                  onChange={handleFormChange('daily_fat_goal')}
                />
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Bio</label>
              <textarea
                className="form-control"
                rows="3"
                value={profileForm.bio}
                onChange={handleFormChange('bio')}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-2 mb-2">
        <div className="card">
          <h2 className="mb-2">Profile Info</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {user.date_of_birth && (
              <div>
                <strong>Age:</strong> {(() => {
                  const birthDate = new Date(user.date_of_birth);
                  const today = new Date();
                  let age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                  }
                  return age;
                })()} years
              </div>
            )}
            {user.gender && (
              <div>
                <strong>Gender:</strong> {user.gender === 'male' ? 'Male' : 'Female'}
              </div>
            )}
            {user.height && (
              <div>
                <strong>Height:</strong> {user.height} cm
              </div>
            )}
            {user.current_weight && (
              <div>
                <strong>Current Weight:</strong> {user.current_weight} kg
              </div>
            )}
            {user.target_weight && (
              <div>
                <strong>Target Weight:</strong> {user.target_weight} kg
              </div>
            )}
            {user.activity_level && (
              <div>
                <strong>Activity Level:</strong> {user.activity_level.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            )}
            {user.fitness_goal && (
              <div>
                <strong>Fitness Goal:</strong> {user.fitness_goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            )}
            {!user.date_of_birth && !user.gender && !user.height && !user.current_weight && !user.target_weight && (
              <p className="text-muted">No profile information yet. Click "Edit Profile" to add details and calculate your nutrition goals.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="mb-2">Nutrition Goals</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {user.daily_calorie_goal && (
              <div>
                <strong>Daily Calories:</strong> {user.daily_calorie_goal} kcal
              </div>
            )}
            {user.daily_protein_goal && (
              <div>
                <strong>Protein:</strong> {user.daily_protein_goal}g
              </div>
            )}
            {user.daily_carbs_goal && (
              <div>
                <strong>Carbs:</strong> {user.daily_carbs_goal}g
              </div>
            )}
            {user.daily_fat_goal && (
              <div>
                <strong>Fats:</strong> {user.daily_fat_goal}g
              </div>
            )}
            {!user.daily_calorie_goal && !user.daily_protein_goal && !user.daily_carbs_goal && !user.daily_fat_goal && (
              <p className="text-muted">No nutrition goals set. Use the "Calculate My Macros" button in Edit mode!</p>
            )}
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div style={{ marginTop: '24px' }}>
        <h2 className="mb-2" style={{ 
          textAlign: 'center', 
          fontSize: '1.5rem',
          marginBottom: '20px',
          color: 'var(--white)'
        }}>Posts</h2>
        {posts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <p className="text-muted">No posts yet</p>
          </div>
        ) : (
          <div style={{ maxWidth: '620px', margin: '0 auto' }}>
            {posts.map((post) => {
              const isLiked = post.isLiked || post.likes?.includes(currentUser?.id);
              
              return (
                <div key={post.id} className="post-card">
                  {/* Header with avatar and user info */}
                  <div className="post-header">
                    {(post.user?.profile_picture || user?.profile_picture) ? (
                      <img 
                        src={post.user?.profile_picture || user?.profile_picture} 
                        alt={post.user?.name || user?.name}
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
                        {getInitials(post.user?.name || user?.name)}
                      </div>
                    )}
                    <div className="post-info">
                      <h4 
                        onClick={() => post.user?.id && navigate(`/profile/${post.user.id}`)}
                        style={{ cursor: post.user?.id ? 'pointer' : 'default' }}
                        onMouseEnter={(e) => post.user?.id && (e.currentTarget.style.color = 'var(--primary-color)')}
                        onMouseLeave={(e) => e.currentTarget.style.color = ''}
                      >{post.user?.name || user?.name || 'Unknown User'}</h4>
                      <p className="post-time">{getTimeAgo(post.created_at)}</p>
                    </div>
                    {isOwnProfile && editingPost !== post.id && (
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleEditPost(post)}
                          style={{ 
                            padding: '4px 10px', 
                            fontSize: '0.8rem'
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => setDeleteConfirmPost(post.id)}
                          style={{ 
                            padding: '4px 10px', 
                            fontSize: '0.8rem'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Edit Form */}
                  {isOwnProfile && editingPost === post.id && (
                    <div style={{ padding: '16px', backgroundColor: 'rgba(0, 229, 255, 0.05)', borderBottom: '1px solid rgba(0, 229, 255, 0.1)' }}>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Post Type</label>
                        <select 
                          className="form-control"
                          value={editPostForm.type}
                          onChange={(e) => setEditPostForm({ ...editPostForm, type: e.target.value })}
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
                        <label style={{ fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Text</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={editPostForm.text}
                          onChange={(e) => setEditPostForm({ ...editPostForm, text: e.target.value })}
                          style={{ fontSize: '0.9rem', resize: 'vertical' }}
                        />
                      </div>
                      
                      {/* Image Upload */}
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '0.85rem', marginBottom: '6px', display: 'block' }}>Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control"
                          onChange={handleImageSelect}
                          style={{ fontSize: '0.85rem', padding: '8px' }}
                        />
                        
                        {/* Current or New Image Preview */}
                        {(newImage || editPostForm.image_url) && (
                          <div style={{ 
                            marginTop: '12px', 
                            position: 'relative',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            maxWidth: '100%',
                            backgroundColor: '#000'
                          }}>
                            <img 
                              src={newImage ? URL.createObjectURL(newImage) : editPostForm.image_url} 
                              alt="Preview" 
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: '300px',
                                objectFit: 'contain',
                                display: 'block'
                              }}
                            />
                            <button
                              onClick={handleRemoveImage}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                backgroundColor: 'rgba(239, 68, 68, 0.95)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                width: '30px',
                                height: '30px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleSaveEdit(post.id)}
                          disabled={uploadingImage}
                          style={{ flex: 1, fontSize: '0.9rem', padding: '8px' }}
                        >
                          {uploadingImage ? 'Uploading...' : 'Save'}
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={handleCancelEdit}
                          disabled={uploadingImage}
                          style={{ flex: 1, fontSize: '0.9rem', padding: '8px' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Display image */}
                  {editingPost !== post.id && post.content?.image_url && (
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
                          onClick={() => post.user?.id && navigate(`/profile/${post.user.id}`)}
                          style={{ cursor: post.user?.id ? 'pointer' : 'default' }}
                          onMouseEnter={(e) => post.user?.id && (e.currentTarget.style.color = 'var(--primary-color)')}
                          onMouseLeave={(e) => e.currentTarget.style.color = ''}
                        >{post.user?.name || user?.name}</strong> {post.content.text}
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmPost && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{
            maxWidth: '400px',
            margin: '20px',
            padding: '24px'
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Delete Post?</h3>
            <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-danger"
                onClick={() => handleDeletePost(deleteConfirmPost)}
                style={{ flex: 1, padding: '10px', fontWeight: '600' }}
              >
                Delete
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setDeleteConfirmPost(null)}
                style={{ flex: 1, padding: '10px', fontWeight: '600' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Followers/Following Modal */}
      {showFollowModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowFollowModal(false)}>
          <div className="card" style={{
            maxWidth: '500px',
            width: '100%',
            maxHeight: '600px',
            margin: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>
                {modalType === 'followers' ? 'Followers' : 'Following'}
              </h3>
              <button 
                onClick={() => setShowFollowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  color: 'var(--text-secondary)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', marginTop: '10px' }}>
              {(modalType === 'followers' ? followers : following).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <p>No {modalType === 'followers' ? 'followers' : 'following'} yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(modalType === 'followers' ? followers : following).map((person) => (
                    <div 
                      key={person.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => {
                        setShowFollowModal(false);
                        navigate(`/profile/${person.id}`);
                      }}
                    >
                      {person.profile_picture ? (
                        <img 
                          src={person.profile_picture}
                          alt={person.name}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid rgba(139, 92, 246, 0.2)'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '1.1rem'
                        }}>
                          {person.name?.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: 'var(--white)', fontSize: '1rem' }}>
                          {person.name}
                        </div>
                        {person.bio && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {person.bio.length > 50 ? person.bio.substring(0, 50) + '...' : person.bio}
                          </div>
                        )}
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
