# Quick Start: Setting Up Admin Account

Follow these steps to set up your first admin account and start using the admin panel.

## Step 1: Run Database Migration

1. Open **Supabase SQL Editor** (https://app.supabase.com → Your Project → SQL Editor)

2. Copy and paste the content from `server/database/migration_admin_system.sql`

3. Click **Run** to execute the migration

This will add `role` and `status` columns to your users table.

## Step 2: Create Admin User

**Option A: Make existing user an admin**

Run this SQL query in Supabase SQL Editor:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

Replace `your-email@example.com` with your actual email address.

**Option B: Register new user and make them admin**

1. Register a new account through the app at `/register`
2. Find your user ID in Supabase (Table Editor → users)
3. Run this SQL query:
```sql
UPDATE users 
SET role = 'admin' 
WHERE id = 'your-user-id-here';
```

## Step 3: Verify Admin Status

Run this query to check if admin role is set:

```sql
SELECT id, name, email, role, status 
FROM users 
WHERE role = 'admin';
```

You should see your user listed with `role = 'admin'`.

## Step 4: Access Admin Panel

1. **Log out** (if you're already logged in) to refresh your session
2. **Log back in** with your admin account
3. You should now see a **"🛡️ Admin"** link in the navbar
4. Click on it to access the Admin Dashboard

## Step 5: Start Managing

You can now:
- ✅ View platform statistics
- ✅ Manage users (suspend/activate)
- ✅ Moderate content (delete posts)

## Troubleshooting

### Can't see Admin link?
- Log out and log back in
- Clear browser cache
- Check that `role = 'admin'` in database

### Getting "Access Denied"?
- Verify role in database
- Check if JWT_SECRET is consistent
- Make sure migration was successful

### Admin API returning 403?
- Check if your account status is 'active'
- Verify token includes role field

## Creating Additional Admins

To make other users admins:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'another-admin@example.com';
```

## Security Reminders

- Keep your admin credentials secure
- Use strong passwords for admin accounts
- Don't share admin access unnecessarily
- Review suspended users periodically
- Monitor deleted content

---

For more details, see [ADMIN_PANEL.md](ADMIN_PANEL.md)
