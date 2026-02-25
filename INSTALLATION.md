# SynergyFit Installation Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** - [Sign up here](https://supabase.com/)

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/synergyfit.git
cd synergyfit
```

## Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in your project details:
   - Name: SynergyFit
   - Database Password: Choose a strong password
   - Region: Select closest to you
4. Wait for the project to be set up (takes 1-2 minutes)

### Run the Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Open the file `server/database/schema.sql` from this project
3. Copy all the SQL code
4. Paste it into the Supabase SQL Editor
5. Click "Run" to create all tables, indexes, and policies

### Get Your API Keys

1. In Supabase dashboard, go to Settings > API
2. Copy your:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (for client-side)
   - **service_role** key (for server-side - keep this secret!)

## Step 3: Configure Environment Variables

### Backend Configuration

Create a `.env` file in the root directory:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://vgowgxuwwsxxqzdcgbsa.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# JWT Secret (create a random secure string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Security Note:** Never commit the `.env` file to version control. It's already in `.gitignore`.

## Step 4: Install Dependencies

### Install Backend Dependencies

```bash
npm install
```

### Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

## Step 5: Seed the Database

Populate your database with initial exercises:

```bash
node server/database/seed.js
```

You should see:
```
✓ Successfully seeded 25 exercises
Database seeding completed!
```

## Step 6: Run the Application

### Option 1: Run Both Frontend and Backend Together

From the root directory:

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend React app on http://localhost:3000

### Option 2: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## Step 7: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the SynergyFit homepage!

## Step 8: Create Your First Account

1. Click "Get Started" or "Sign Up"
2. Fill in your details:
   - Full Name
   - Email
   - Password (min 6 characters)
3. Click "Sign Up"
4. You'll be redirected to your dashboard

## Verification

### Check Backend Connection

Visit `http://localhost:5000/api/health` - you should see:
```json
{
  "status": "OK",
  "message": "SynergyFit API is running"
}
```

### Check Supabase Connection

In your terminal where the backend is running, look for:
```
✓ Supabase connected successfully
Server is running on port 5000
```

## Troubleshooting

### "Supabase connection error"

**Problem:** Backend can't connect to Supabase

**Solutions:**
1. Verify your `SUPABASE_URL` is correct
2. Check that `SUPABASE_SERVICE_ROLE_KEY` is set
3. Ensure your database schema was run successfully
4. Check your internet connection

### "Port 5000 is already in use"

**Problem:** Another application is using port 5000

**Solution:** Change the port in `.env`:
```bash
PORT=5001
```

Also update the proxy in `client/package.json`:
```json
"proxy": "http://localhost:5001"
```

### "Cannot find module"

**Problem:** Dependencies not installed

**Solution:**
```bash
# Root dependencies
npm install

# Client dependencies
cd client
npm install
cd ..
```

### Frontend shows "Network Error"

**Problem:** Frontend can't reach backend API

**Solutions:**
1. Make sure backend is running (`npm run server`)
2. Check that backend is on port 5000
3. Verify `proxy` in `client/package.json` is set to `"http://localhost:5000"`
4. Restart both frontend and backend

### "Invalid API Key" Error

**Problem:** Wrong Supabase keys

**Solution:**
1. Go to Supabase Dashboard > Settings > API
2. Copy the correct keys (make sure you're copying service_role for backend)
3. Update your `.env` file
4. Restart the backend server

### Database Errors After Schema Changes

**Problem:** Schema doesn't match code

**Solution:**
In Supabase SQL Editor:
1. Drop all tables if needed (be careful - this deletes all data!)
2. Re-run the entire `schema.sql` file
3. Re-run the seed script

### "Row Level Security" Errors

**Problem:** RLS policies blocking operations

**Solution:**
Make sure you're using `supabaseAdmin` in backend controllers, not regular `supabase` client. The admin client bypasses RLS policies.

## Optional: Cloudinary Setup (for Image Uploads)

SynergyFit uses Cloudinary for handling profile pictures and progress photos.

1. Create account at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the Dashboard
3. Add to your `.env`:
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Development Tips

### Auto-Reload

- Backend uses **nodemon** - saves automatically reload the server
- Frontend uses **React hot reload** - changes update instantly

### View Database

Use Supabase Table Editor:
1. Go to your Supabase Dashboard
2. Click "Table Editor" in the sidebar
3. View and edit data directly
4. See real-time changes

### SQL Queries in Supabase

1. Go to SQL Editor in Supabase
2. Write and run custom queries
3. Save frequently used queries

### Check Logs

**Backend logs:** Check your terminal where `npm run server` is running

**Frontend logs:** Open browser DevTools (F12) > Console tab

**Supabase logs:** Check the Logs section in Supabase dashboard

### API Testing

Use tools like:
- **Postman** - [Download here](https://www.postman.com/)
- **Thunder Client** (VS Code extension)
- **curl** (command line)

Example API test:
```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Production Deployment

### Backend (e.g., Render, Railway, Heroku)

1. Push code to GitHub
2. Connect your repository to hosting platform
3. Set environment variables in hosting dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Deploy!

### Frontend (e.g., Vercel, Netlify)

1. Build the frontend:
```bash
cd client
npm run build
```

2. Deploy the `client/build` folder to your hosting platform

3. Update backend CORS settings to allow your frontend domain

### Update CORS for Production

In `server/index.js`, update CORS config:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

Add to `.env`:
```bash
FRONTEND_URL=https://your-frontend-domain.com
```

## Supabase Database Backup

### Manual Backup

1. Go to Supabase Dashboard
2. Database > Backups
3. Click "Create Backup"
4. Download when needed

### Automated Backups

Supabase Pro plan includes:
- Daily automated backups
- Point-in-time recovery
- Custom backup scheduling

## Security Best Practices

1. **Never commit `.env` files**
2. **Use strong JWT_SECRET** (at least 32 random characters)
3. **Keep SUPABASE_SERVICE_ROLE_KEY secret** (server-side only)
4. **Enable Supabase RLS policies** (already configured in schema.sql)
5. **Use HTTPS in production**
6. **Validate all user inputs** (already implemented)
7. **Hash passwords** (already using bcrypt)

## Common Database Operations

### Check Table Structure

In Supabase SQL Editor:
```sql
-- See all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Describe a table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
```

### View Data

```sql
-- Get all exercises
SELECT * FROM exercises LIMIT 10;

-- Check user count
SELECT COUNT(*) FROM users;
```

### Reset User Password (for testing)

```sql
UPDATE users 
SET password_hash = '$2a$10$...' -- hash from bcrypt
WHERE email = 'user@example.com';
```

## Need Help?

- **Supabase Issues:** Check [Supabase Documentation](https://supabase.com/docs)
- **GitHub Issues:** Report bugs or request features
- **Technical Details:** See [DOCUMENTATION.md](DOCUMENTATION.md)

## Next Steps

Now that you have SynergyFit running:

1. **Explore Features:**
   - Create custom workouts
   - Log meals and track nutrition
   - Monitor your progress with charts
   - Set and achieve fitness goals
   - Connect with friends and share achievements

2. **Customize:**
   - Modify the database schema in `schema.sql`
   - Add custom exercises
   - Adjust UI/UX in CSS files
   - Extend API with new endpoints

3. **Contribute:**
   - Report bugs or issues
   - Suggest new features
   - Submit pull requests
   - Improve documentation

## Quick Start Checklist

- [ ] Node.js installed
- [ ] Supabase account created
- [ ] Project cloned
- [ ] Dependencies installed (`npm install` in root and client)
- [ ] Supabase schema executed
- [ ] `.env` file configured with Supabase keys
- [ ] Database seeded (`node server/database/seed.js`)
- [ ] Backend running (`npm run server`)
- [ ] Frontend running (`npm run client`)
- [ ] Account created and logged in

Happy fitness tracking! 💪🏋️‍♂️🥗

---

**Version:** 2.0 (Supabase)  
**Last Updated:** January 2025  
**Author:** SynergyFit Team
