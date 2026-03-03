import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, postService } from '../services';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
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
      if (isOwnProfile) {
        setUser(currentUser);
        setProfileForm({
          name: currentUser?.name || '',
          bio: currentUser?.bio || '',
          date_of_birth: currentUser?.date_of_birth || '',
          gender: currentUser?.gender || '',
          height: currentUser?.height || '',
          current_weight: currentUser?.current_weight || '',
          target_weight: currentUser?.target_weight || '',
          activity_level: currentUser?.activity_level || '',
          fitness_goal: currentUser?.fitness_goal || '',
          daily_calorie_goal: currentUser?.daily_calorie_goal || '',
          daily_protein_goal: currentUser?.daily_protein_goal || '',
          daily_carbs_goal: currentUser?.daily_carbs_goal || '',
          daily_fat_goal: currentUser?.daily_fat_goal || ''
        });
      } else {
        const res = await userService.getUserProfile(profileId);
        setUser(res.data.user);
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
            <div className="post-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
              {user.name?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 style={{ marginBottom: '5px' }}>{user.name}</h1>
              {user.bio && <p style={{ marginTop: '10px', color: '#868e96' }}>{user.bio}</p>}
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
          <div>
            <strong>{followers.length}</strong>
            <p className="text-muted">Followers</p>
          </div>
          <div>
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
                style={{ marginBottom: '12px' }}
              >
                🧮 Calculate My Macros
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

      <div className="card">
        <h2 className="mb-2">Posts</h2>
        {posts.length === 0 ? (
          <p className="text-muted text-center">No posts yet</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {posts.map((post) => (
              <div key={post.id} style={{ padding: '15px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <span className="workout-badge scheduled">{post.type}</span>
                  <span className="text-muted" style={{ marginLeft: '10px', fontSize: '0.9rem' }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {post.content?.text && <p>{post.content.text}</p>}
                <div style={{ marginTop: '10px', display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#868e96' }}>
                  <span>{post.likes?.length || 0} likes</span>
                  <span>{post.comments?.length || 0} comments</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
