import API from './api';

export const workoutService = {
  getWorkouts: (params) => API.get('/workouts', { params }),
  getWorkoutById: (id) => API.get(`/workouts/${id}`),
  createWorkout: (data) => API.post('/workouts', data),
  updateWorkout: (id, data) => API.put(`/workouts/${id}`, data),
  deleteWorkout: (id) => API.delete(`/workouts/${id}`),
  completeWorkout: (id, data) => API.post(`/workouts/${id}/complete`, data),
  getPublicTemplates: (params) => API.get('/workouts/templates/public', { params }),
};

export const exerciseService = {
  getExercises: (params) => API.get('/exercises', { params }),
  getExerciseById: (id) => API.get(`/exercises/${id}`),
  createExercise: (data) => API.post('/exercises', data),
  updateExercise: (id, data) => API.put(`/exercises/${id}`, data),
  deleteExercise: (id) => API.delete(`/exercises/${id}`),
};

export const exerciseDbService = {
  liveness: () => API.get('/exercisedb/liveness'),
  getBodyparts: () => API.get('/exercisedb/bodyparts'),
  getExercises: (params) => API.get('/exercisedb/exercises', { params }),
  searchExercises: (search) => API.get('/exercisedb/exercises/search', { params: { search } }),
  getExerciseByExternalId: (exerciseId) => API.get(`/exercisedb/exercises/${exerciseId}`),
};

export const mealService = {
  getMeals: (params) => API.get('/meals', { params }),
  getMealById: (id) => API.get(`/meals/${id}`),
  createMeal: (data) => API.post('/meals', data),
  updateMeal: (id, data) => API.put(`/meals/${id}`, data),
  deleteMeal: (id) => API.delete(`/meals/${id}`),
  getDailyStats: (date) => API.get('/meals/stats/daily', { params: { date } }),
};

export const foodService = {
  searchFoods: (query, page = 1, pageSize = 20) => 
    API.get('/foods/search', { params: { query, page, pageSize } }),
  getFoodByBarcode: (barcode) => API.get(`/foods/barcode/${barcode}`),
  getPopularFoods: () => API.get('/foods/popular'),
};

export const progressService = {
  getProgress: (params) => API.get('/progress', { params }),
  getProgressById: (id) => API.get(`/progress/${id}`),
  createProgress: (data) => API.post('/progress', data),
  updateProgress: (id, data) => API.put(`/progress/${id}`, data),
  deleteProgress: (id) => API.delete(`/progress/${id}`),
  getStats: (period) => API.get('/progress/stats/summary', { params: { period } }),
};

export const postService = {
  getPosts: (params) => API.get('/posts', { params }),
  getPostById: (id) => API.get(`/posts/${id}`),
  createPost: (data) => API.post('/posts', data),
  updatePost: (id, data) => API.put(`/posts/${id}`, data),
  deletePost: (id) => API.delete(`/posts/${id}`),
  toggleLike: (id) => API.post(`/posts/${id}/like`),
  addComment: (id, data) => API.post(`/posts/${id}/comment`, data),
  deleteComment: (id, commentId) => API.delete(`/posts/${id}/comment/${commentId}`),
  getUserPosts: (userId, params) => API.get(`/posts/user/${userId}`, { params }),
};

export const goalService = {
  getGoals: (params) => API.get('/goals', { params }),
  getGoalById: (id) => API.get(`/goals/${id}`),
  createGoal: (data) => API.post('/goals', data),
  updateGoal: (id, data) => API.put(`/goals/${id}`, data),
  deleteGoal: (id) => API.delete(`/goals/${id}`),
  completeMilestone: (id, data) => API.post(`/goals/${id}/milestone`, data),
};

export const userService = {
  getUserProfile: (id) => API.get(`/users/${id}`),
  updateUserProfile: (id, data) => API.put(`/users/${id}`, data),
  toggleFollow: (id) => API.post(`/users/${id}/follow`),
  getFollowers: (id) => API.get(`/users/${id}/followers`),
  getFollowing: (id) => API.get(`/users/${id}/following`),
  searchUsers: (query) => API.get(`/users/search/${query}`),
};

export const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return API.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const adminService = {
  // User management
  getAllUsers: (params) => API.get('/admin/users', { params }),
  updateUserStatus: (id, status) => API.put(`/admin/users/${id}/status`, { status }),
  
  // Content moderation
  getAllPosts: (params) => API.get('/admin/posts', { params }),
  deletePost: (id) => API.delete(`/admin/posts/${id}`),
  getPostComments: (postId) => API.get(`/admin/posts/${postId}/comments`),
  deleteComment: (commentId) => API.delete(`/admin/comments/${commentId}`),
  
  // Statistics
  getStats: () => API.get('/admin/stats'),
};
