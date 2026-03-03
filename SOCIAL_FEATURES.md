# Social Features - Instagram-Style Feed

SynergyFit includes a comprehensive social feed system inspired by Instagram, allowing users to share their fitness journey with photos, interact with other users, and build a supportive community.

## Features Overview

### 📸 Post Creation with Images
- Create posts with optional images (up to 5MB)
- Choose from 5 post types:
  - **General**: Daily thoughts and updates
  - **Workout**: Share workout routines and achievements
  - **Meal**: Show off healthy meals
  - **Progress**: Share transformation photos
  - **Achievement**: Celebrate fitness milestones
- Live image preview before posting
- Image uploads to Supabase Storage
- Text descriptions for context

### 🌍 Feed Options
- **All Posts**: See posts from the entire SynergyFit community
- **Following**: View only posts from users you follow
- Filter by post type (workout, meal, progress, achievement)
- Posts sorted by newest first
- Real-time updates when new posts are created

### 💬 Engagement
- **Like** posts with a single click
- **Comment** on any post
- View like counts and all comments
- Like status persists across sessions
- Comment with Enter key for quick posting

### 👥 User Discovery & Following
- **Search Users**: Find people by name or username
- Search results update as you type
- View user profiles by clicking on search results
- **Follow/Unfollow** directly from:
  - Search results
  - Post headers (coming soon)
  - User profiles
- Following status updates instantly

### 🗑️ Content Management
- Delete your own posts
- Cannot delete other users' posts
- Confirmation dialog before deletion

## User Interface

### Feed Layout
```
┌─────────────────────────────────────┐
│ Social Feed Header                   │
│ [🔍 Search Users] [✏️ Create Post]   │
├─────────────────────────────────────┤
│ Search Box (when active)             │
│ ┌───────────────────────────────┐   │
│ │ User 1 [@username]  [Follow]  │   │
│ │ User 2 [@username]  [Unfollow]│   │
│ └───────────────────────────────┘   │
├─────────────────────────────────────┤
│ Feed Filters                         │
│ [🌍 All Posts] [👥 Following]       │
│ ───────────────────────────────────  │
│ [All Types] [Workouts] [Meals] ...   │
├─────────────────────────────────────┤
│ Post Card 1                          │
│ ┌─────────────────────────────────┐ │
│ │ 👤 User Name                     │ │
│ │ 2 hours ago              [Delete]│ │
│ │                                  │ │
│ │ Post text content here...        │ │
│ │                                  │ │
│ │ [📷 Post Image]                  │ │
│ │                                  │ │
│ │ ❤️ 5 likes  💬 3 comments        │ │
│ │                                  │ │
│ │ Comments:                        │ │
│ │ User 2: Great workout!           │ │
│ │                                  │ │
│ │ [Add a comment...] [Post]        │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Post Card 2                          │
│ ...                                  │
└─────────────────────────────────────┘
```

### Create Post Modal
```
┌─────────────────────────────────┐
│ Create New Post                  │
├─────────────────────────────────┤
│ Post Type: [General ▼]           │
│                                  │
│ What's on your mind?             │
│ ┌─────────────────────────────┐ │
│ │ Share your fitness journey...│ │
│ │                              │ │
│ │                              │ │
│ └─────────────────────────────┘ │
│                                  │
│ Add Image (optional)             │
│ [Choose File]                    │
│                                  │
│ [📷 Image Preview]               │
│                                  │
│ [Post] or [Uploading...]         │
└─────────────────────────────────┘
```

## Technical Implementation

### Image Upload Flow
1. User selects an image file
2. Client validates:
   - File type (must be image/*)
   - File size (max 5MB)
3. Image preview shown immediately
4. On post submit:
   - Image uploads to Supabase Storage `images/posts/` folder
   - Filename format: `{userId}-{timestamp}.{ext}`
   - Public URL retrieved from Supabase
5. Post created with image URL in content
6. Image displays in feed

### Data Structure

**Post Object:**
```javascript
{
  id: 'uuid',
  user_id: 'uuid',
  post_type: 'workout' | 'meal' | 'progress' | 'achievement' | 'general',
  content: {
    text: 'Post description',
    image_url: 'https://...supabase.co/storage/.../image.jpg'
  },
  created_at: 'timestamp',
  user: {
    id: 'uuid',
    name: 'Full Name',
    username: 'username'
  },
  likes: ['user_id1', 'user_id2'],
  comments: [
    {
      id: 'uuid',
      user: { id: 'uuid', name: 'Name' },
      text: 'Comment text',
      created_at: 'timestamp'
    }
  ],
  likesCount: 5,
  isLiked: true
}
```

### API Endpoints Used

**Posts:**
- `GET /api/posts?following_only=true` - Get feed posts
- `POST /api/posts` - Create new post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Toggle like
- `POST /api/posts/:id/comments` - Add comment

**Users:**
- `GET /api/users/search/:query` - Search users
- `POST /api/users/:id/follow` - Toggle follow

### State Management

**Social.js Component State:**
```javascript
const [posts, setPosts] = useState([]);
const [newPost, setNewPost] = useState({ 
  type: 'general', 
  text: '', 
  image: null 
});
const [feedFilter, setFeedFilter] = useState('all'); // 'all' | 'following'
const [filter, setFilter] = useState('all'); // post type filter
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);
const [showSearch, setShowSearch] = useState(false);
const [uploadingImage, setUploadingImage] = useState(false);
const [commentText, setCommentText] = useState({});
```

## Usage Examples

### Creating a Post with Image

1. Click **"✏️ Create Post"** button
2. Select post type (e.g., "Progress")
3. Write description: "Down 5kg this month! 💪"
4. Click **"Choose File"** and select transformation photo
5. Preview appears below
6. Click **"Post"**
7. Image uploads to Supabase Storage
8. Post appears in feed with image

### Searching and Following Users

1. Click **"🔍 Search Users"** button
2. Type username or name (e.g., "john")
3. Results appear instantly
4. Click username to view their profile
5. Click **"Follow"** button next to user
6. Button changes to **"Unfollow"**
7. User's posts now appear in "Following" feed

### Filtering Feed

**By User Group:**
- Click **"🌍 All Posts"** to see everyone's posts
- Click **"👥 Following"** to see only followed users

**By Post Type:**
- Click **"All Types"** for all posts
- Click **"Workouts"** for workout posts only
- Click **"Meals"** for meal posts only
- etc.

### Engaging with Posts

**Liking:**
- Click like button on any post
- Like count increments immediately
- Click again to unlike

**Commenting:**
- Type comment in text box below post
- Press Enter or click **"Post"** button
- Comment appears instantly

## Best Practices

### For Users
- Use high-quality images (but under 5MB)
- Write descriptive captions
- Choose appropriate post types
- Engage with others' posts
- Use search to find workout buddies

### For Developers
- Always validate file uploads client-side
- Check Supabase Storage bucket permissions
- Handle upload errors gracefully
- Optimize images before upload (future enhancement)
- Implement pagination for large feeds (future enhancement)

## Future Enhancements

Potential improvements to the social system:
- [ ] Multiple images per post (carousel)
- [ ] Video uploads
- [ ] Hashtags and mentions
- [ ] Post saving/bookmarking
- [ ] Direct messaging
- [ ] Notification system for likes/comments
- [ ] Image filters and editing
- [ ] Story feature (24-hour posts)
- [ ] Feed algorithm (prioritize engaging content)
- [ ] Report/block users
- [ ] Privacy settings (private accounts)

## Troubleshooting

### Images Not Uploading
- Check Supabase Storage bucket exists and is named "images"
- Verify bucket is set to public
- Check RLS policies on storage.objects table
- Ensure REACT_APP_SUPABASE_* env variables are set

### Search Not Working
- Verify `/api/users/search/:query` endpoint works
- Check user has proper authentication
- Look for errors in browser console

### Following Not Updating Feed
- Make sure "Following" tab is selected
- Check that `following_only=true` query param is sent
- Verify user is actually following others

### Posts Not Appearing
- Check that posts exist in database
- Verify filters aren't too restrictive
- Try clicking "All Posts" and "All Types"
- Refresh the page

## Security Considerations

- Images uploaded with user ID in filename (tracking)
- Authenticated users only can upload
- File type and size validation on client
- Server should also validate uploads (future)
- Public read access for images (needed for feed)
- Users can only delete their own posts
- RLS policies protect user data

## Performance Notes

- Images under 5MB load reasonably fast
- Consider lazy loading images in future
- Pagination recommended for 50+ posts
- Search queries debounced to reduce API calls
- Feed refreshes on filter changes only

---

For setup instructions, see [SUPABASE_STORAGE_SETUP.md](SUPABASE_STORAGE_SETUP.md)
