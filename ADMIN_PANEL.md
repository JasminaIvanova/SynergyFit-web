# Admin Panel Guide

## Overview
The SynergyFit Admin Panel allows administrators to manage users and moderate content on the platform. Only users with the `admin` role can access this panel.

## Features

### 1. **Dashboard Statistics** 📊
View comprehensive statistics about your platform:
- **Total Users**: See active and suspended user counts
- **Content**: Track posts, workouts, and meals created
- **Recent Activity**: Monitor new users, posts, and workouts in the last 7 days
- **Top Active Users**: View users with the most posts

### 2. **User Management** 👥
Manage all registered users:
- **View all users** with their profiles and statistics
- **Search users** by name or email
- **Filter users** by status (active/suspended)
- **Suspend/Activate accounts** to manage problematic users
- **View user statistics**: posts count, workouts, followers

### 3. **Content Moderation** 📝
Moderate user-generated content:
- **View all posts** from all users
- **Filter posts** by type (general, workout, meal, progress, achievement)
- **Delete inappropriate posts** (spam, offensive content)
- **View post statistics**: likes and comments count

## How to Access

### Setting Up the First Admin

1. **Run the database migration**:
   ```bash
   # In Supabase SQL Editor, run:
   server/database/migration_admin_system.sql
   ```

2. **Make a user an admin**:
   ```sql
   -- In Supabase SQL Editor:
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

3. **Log in** with your admin account

4. **Access the Admin Panel**:
   - Navigate to the navbar
   - Click on the "🛡️ Admin" link (only visible to admins)

## User Actions

### Suspending a User
1. Go to **Users** tab in the Admin Panel
2. Find the user you want to suspend
3. Click **"⊘ Suspend"** button
4. Confirm the action
5. The user will be marked as suspended and cannot access the platform

### Activating a User
1. Filter by **"Suspended"** status
2. Find the user you want to reactivate
3. Click **"✓ Activate"** button
4. The user can now access the platform again

### Deleting a Post
1. Go to **Posts** tab in the Admin Panel
2. Browse or filter posts by type
3. Find the post you want to remove
4. Click **"🗑️ Delete Post"** button
5. Confirm the action
6. The post and all associated comments and likes will be deleted

## API Endpoints

All admin endpoints require authentication and admin role.

### User Management
- `GET /api/admin/users` - Get all users with filters
- `PUT /api/admin/users/:id/status` - Update user status

### Content Moderation
- `GET /api/admin/posts` - Get all posts with filters
- `DELETE /api/admin/posts/:id` - Delete a post

### Statistics
- `GET /api/admin/stats` - Get dashboard statistics

## Security Features

1. **Role-Based Access Control**: Only users with `role = 'admin'` can access admin endpoints
2. **Status Checking**: Suspended admins cannot perform admin actions
3. **Self-Protection**: Admins cannot suspend their own accounts
4. **Authentication Required**: All admin endpoints require valid JWT token
5. **Frontend Protection**: Admin panel page checks user role before rendering

## Best Practices

### When to Suspend Users
✅ **Do suspend when:**
- User posts spam or inappropriate content repeatedly
- User violates community guidelines
- User engages in harassment or bullying

❌ **Don't suspend when:**
- User makes a single mistake (consider warnings first)
- Personal disagreements
- Without proper review of the case

### When to Delete Posts
✅ **Do delete when:**
- Content is spam or advertising
- Content is offensive or violates terms of service
- Content contains personal information of others
- Content is illegal

❌ **Don't delete when:**
- You simply disagree with the content
- Content is critical but constructive
- Without reviewing the full context

## Safety Features

1. **Confirmation Dialogs**: All destructive actions (suspend, delete) require confirmation
2. **Audit Trail**: All admin actions are logged (timestamps on updates)
3. **Cascade Deletes**: When posts are deleted, associated comments and likes are also removed
4. **Status Badges**: Visual indicators for user roles and statuses

## Troubleshooting

### "Access Denied" Message
- **Cause**: Your account doesn't have admin role
- **Solution**: Ask another admin to grant you admin privileges or run the SQL update query

### Can't See Admin Link in Navbar
- **Cause**: Frontend hasn't detected your admin role
- **Solution**: Log out and log back in to refresh your session

### Admin API Calls Failing
- **Cause**: JWT token expired or role not set correctly
- **Solution**: 
  1. Check if `role` field exists in database
  2. Verify your user has `role = 'admin'`
  3. Clear browser cache and log in again

## Future Enhancements

Potential features for future versions:
- Email notifications when users are suspended
- Admin activity logs page
- Bulk actions (suspend multiple users)
- Report system (users can report content)
- Content review queue
- Admin roles (super admin vs moderator)
- User warnings system (before suspension)

## Support

For issues or questions about the admin panel:
1. Check the console for error messages
2. Verify database schema includes role and status fields
3. Ensure migration script was run successfully
4. Check that JWT token includes role field

---

**Remember**: With great power comes great responsibility. Use admin privileges fairly and consistently.

