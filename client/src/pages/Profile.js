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

  const isOwnProfile = !id || id === currentUser?._id;
  const profileId = id || currentUser?._id;

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
      setIsFollowing(user.followers?.includes(currentUser._id));
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
      <div className="card mb-2">
        <div className="flex-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="post-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
              {user.name?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 style={{ marginBottom: '5px' }}>{user.name}</h1>
              {user.profile?.firstName && user.profile?.lastName && (
                <p className="text-muted">{user.profile.firstName} {user.profile.lastName}</p>
              )}
              {user.profile?.bio && <p style={{ marginTop: '10px' }}>{user.profile.bio}</p>}
            </div>
          </div>
          
          {!isOwnProfile && (
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
          <div>
            <strong>{user.streaks?.currentWorkoutStreak || 0}</strong>
            <p className="text-muted">Day Streak</p>
          </div>
        </div>
      </div>

      <div className="grid grid-2 mb-2">
        <div className="card">
          <h2 className="mb-2">Profile Info</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {user.profile?.dateOfBirth && (
              <div>
                <strong>Age:</strong> {new Date().getFullYear() - new Date(user.profile.dateOfBirth).getFullYear()}
              </div>
            )}
            {user.profile?.gender && (
              <div>
                <strong>Gender:</strong> {user.profile.gender}
              </div>
            )}
            {user.profile?.currentWeight && (
              <div>
                <strong>Current Weight:</strong> {user.profile.currentWeight} kg
              </div>
            )}
            {user.profile?.targetWeight && (
              <div>
                <strong>Target Weight:</strong> {user.profile.targetWeight} kg
              </div>
            )}
            {user.profile?.height && (
              <div>
                <strong>Height:</strong> {user.profile.height} cm
              </div>
            )}
            {user.goals?.fitnessGoal && (
              <div>
                <strong>Fitness Goal:</strong> {user.goals.fitnessGoal.replace('_', ' ')}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="mb-2">Nutrition Goals</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {user.goals?.dailyCalorieGoal && (
              <div>
                <strong>Daily Calories:</strong> {user.goals.dailyCalorieGoal} kcal
              </div>
            )}
            {user.goals?.proteinGoal && (
              <div>
                <strong>Protein:</strong> {user.goals.proteinGoal}g
              </div>
            )}
            {user.goals?.carbsGoal && (
              <div>
                <strong>Carbs:</strong> {user.goals.carbsGoal}g
              </div>
            )}
            {user.goals?.fatsGoal && (
              <div>
                <strong>Fats:</strong> {user.goals.fatsGoal}g
              </div>
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
              <div key={post._id} style={{ padding: '15px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
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
