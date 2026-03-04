# SynergyFit

> A full-stack social fitness web platform for tracking workouts, nutrition, body progress, and goals — with an Instagram-style community feed and a built-in admin panel.

---

## Table of Contents

1. [Project Description](#1-project-description)
2. [Architecture](#2-architecture)
3. [Database Schema](#3-database-schema)
4. [Local Development Setup](#4-local-development-setup)
5. [Key Folders & Files](#5-key-folders--files)
6. [API Reference](#6-api-reference)
7. [Additional Documentation](#7-additional-documentation)

---

## 1. Project Description

**SynergyFit** is a comprehensive fitness platform that helps users plan, track, and share every aspect of their health journey.

### What it does

| Area | Capability |
|---|---|
| **Workouts** | Create custom workout plans, schedule sessions, log completion, rate sessions, track streaks |
| **Exercise Library** | Browse 25+ built-in exercises filtered by category, muscle group, difficulty, and equipment; create custom exercises |
| **Nutrition** | Log meals (breakfast, lunch, dinner, snack), search millions of foods via Open Food Facts API, track calories and macros (protein, carbs, fat, fiber) |
| **Progress** | Record weight, body measurements (chest, waist, hips, arms, thighs), body fat %, mood, energy level, and upload progress photos |
| **Goals** | Set targets (weight, strength, endurance, habit, custom), track milestones with progress bars, auto-complete goals when progress matches targets |
| **Social Feed** | Share posts (with images) about workouts, meals, progress, and achievements; like and comment; follow other users |
| **Admin Panel** | Manage users (suspend/activate), moderate content (delete posts), view platform-wide statistics |

### Who can do what

- **Guest (unauthenticated)** – View the landing page and log in / register.
- **Registered User** – Full access to workouts, nutrition, progress, goals, social feed, and their own profile.
- **Admin** – Everything a regular user can do, plus access to the admin dashboard (`/admin`) for user management and content moderation. Admin role is granted via the database; see [ADMIN_SETUP.md](ADMIN_SETUP.md).

---

## 2. Architecture

SynergyFit follows a classic **client–server** architecture with a React SPA on the front end and an Express REST API on the back end, backed by a PostgreSQL database hosted on Supabase.

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (SPA)                       │
│                                                          │
│  React 18  ·  React Router 6  ·  Axios  ·  Chart.js    │
│  Context API (Auth)  ·  Supabase JS SDK (Storage)       │
└───────────────────────┬─────────────────────────────────┘
                        │  HTTP / REST  (proxy :5000)
┌───────────────────────▼─────────────────────────────────┐
│                 Express 4  (Node.js 16+)                 │
│                                                          │
│  JWT Auth Middleware  ·  Admin Middleware                │
│  Controllers  ·  Routes  ·  express-validator            │
│  multer (file handling)  ·  bcryptjs  ·  jsonwebtoken   │
└───────────────────────┬─────────────────────────────────┘
                        │  @supabase/supabase-js
┌───────────────────────▼─────────────────────────────────┐
│               Supabase (hosted PostgreSQL)               │
│                                                          │
│  PostgreSQL 15  ·  Row Level Security (RLS)             │
│  Supabase Storage (profile pictures, post images,        │
│                    progress photos)                      │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Front End (`client/`)

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| React Router 6 | Client-side routing and protected routes |
| Axios | HTTP client with automatic JWT injection |
| Chart.js + react-chartjs-2 | Interactive progress charts |
| @supabase/supabase-js | Direct image uploads to Supabase Storage |
| date-fns | Date formatting and manipulation |
| react-icons | Icon library |
| CSS (global custom properties) | Consistent dark-themed design system |

#### Back End (`server/`)

| Technology | Purpose |
|---|---|
| Node.js 16+ | JavaScript runtime |
| Express 4 | REST API framework |
| @supabase/supabase-js | PostgreSQL queries via Supabase client |
| jsonwebtoken | JWT generation and verification |
| bcryptjs | Password hashing |
| express-validator | Request input validation |
| multer | Multipart file upload handling |
| axios | Server-side calls to Open Food Facts API |
| dotenv | Environment variable management |
| concurrently + nodemon | Development tooling |

#### Database & Storage

| Service | Role |
|---|---|
| Supabase PostgreSQL | Primary relational database (all app data) |
| Supabase Storage | Binary assets — profile pictures, post images, progress photos |

---

## 3. Database Schema

All tables use UUIDs as primary keys. The diagram below shows the core tables and their relationships.

```
┌──────────────────────────────────────────────────────────────────┐
│  USERS                                                           │
│  id · email · password_hash · name · role · status              │
│  bio · profile_picture · date_of_birth · gender                 │
│  height · current_weight · target_weight · activity_level       │
│  fitness_goal · daily_calorie_goal · daily_protein_goal         │
│  daily_carbs_goal · daily_fat_goal                              │
│  workout_streak · longest_streak · last_workout_date            │
│  total_workouts_completed · created_at · updated_at             │
└──────────┬────────────────────────────────────────────┬─────────┘
           │ 1                                          │ 1
    ┌──────▼──────┐                            ┌───────▼──────────┐
    │ USER_FOLLOWS│                            │ WORKOUTS         │
    │ id          │                            │ id               │
    │ follower_id ├──── FK → users.id          │ user_id ─────────┤── FK → users.id
    │ following_id├──── FK → users.id          │ title            │
    └─────────────┘                            │ description      │
                                               │ workout_type     │
                                               │ scheduled_date   │
                                               │ completed_date   │
                                               │ duration_minutes │
                                               │ calories_burned  │
                                               │ is_template      │
                                               └───────┬──────────┘
                                                       │ 1
                                               ┌───────▼──────────────┐
                                               │ WORKOUT_EXERCISES     │
                                               │ id                   │
                                               │ workout_id ──────────┤── FK → workouts.id
                                               │ exercise_id ─────────┤── FK → exercises.id
                                               │ sets · reps · weight │
                                               │ duration_seconds     │
                                               │ rest_seconds         │
                                               │ order_index · notes  │
                                               └──────────────────────┘

┌─────────────────────────┐        ┌──────────────────────────────┐
│ EXERCISES               │        │ MEALS                        │
│ id                      │        │ id                           │
│ name · description      │        │ user_id ─────────────────────┤── FK → users.id
│ category                │        │ name · meal_type · meal_date │
│ muscle_group · equipment│        │ meal_time                    │
│ difficulty_level        │        │ total_calories · total_protein│
│ instructions (TEXT[])   │        │ total_carbs · total_fat      │
│ is_custom               │        │ total_fiber · notes          │
│ created_by ─────────────┤──FK    └──────────┬───────────────────┘
└─────────────────────────┘                   │ 1
                                      ┌───────▼──────────────┐
                                      │ MEAL_FOODS           │
                                      │ id                   │
                                      │ meal_id ─────────────┤── FK → meals.id
                                      │ food_name · brand    │
                                      │ barcode              │
                                      │ quantity · unit      │
                                      │ calories · protein   │
                                      │ carbs · fat · fiber  │
                                      └──────────────────────┘

┌──────────────────────────────┐     ┌──────────────────────────────┐
│ PROGRESS                     │     │ POSTS                        │
│ id                           │     │ id                           │
│ user_id ─────────────────────┤──FK │ user_id ─────────────────────┤──FK
│ date · weight                │     │ content · post_type          │
│ body_fat_percentage          │     │ image_url                    │
│ chest/waist/hips/thighs/arms │     │ workout_id ──── FK→workouts  │
│ photos (TEXT[])              │     │ progress_id ─── FK→progress  │
│ mood · energy_level          │     └──────────┬───────────────────┘
│ sleep_hours · notes          │               ├── POST_LIKES
└──────────────────────────────┘               │   id · post_id · user_id
                                               └── POST_COMMENTS
                                                   id · post_id · user_id
                                                   comment

┌──────────────────────────────┐
│ GOALS                        │
│ id                           │
│ user_id ─────────────────────┤── FK → users.id
│ title · description          │
│ goal_type                    │
│ target_value · current_value │
│ unit · target_date · status  │
└──────────┬───────────────────┘
           │ 1
  ┌────────▼──────────────┐
  │ GOAL_MILESTONES       │
  │ id · goal_id          │
  │ title · target_value  │
  │ is_completed          │
  └───────────────────────┘
```

### Table Relationships Summary

| Relationship | Type |
|---|---|
| users → workouts | One-to-Many |
| users → meals | One-to-Many |
| users → progress | One-to-Many |
| users → posts | One-to-Many |
| users → goals | One-to-Many |
| users ↔ users (via user_follows) | Many-to-Many |
| workouts → workout_exercises → exercises | Many-to-Many (junction) |
| meals → meal_foods | One-to-Many |
| posts → post_likes | One-to-Many |
| posts → post_comments | One-to-Many |
| goals → goal_milestones | One-to-Many |

---

## 4. Local Development Setup

### Prerequisites

- **Node.js** v16 or higher — [nodejs.org](https://nodejs.org/)
- **npm** (bundled with Node.js)
- **Git** — [git-scm.com](https://git-scm.com/)
- **Supabase account** (free tier is sufficient) — [supabase.com](https://supabase.com/)

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/JasminaIvanova/SynergyFit-web.git
cd SynergyFit-web
```

---

### Step 2 — Set up Supabase

1. Open [app.supabase.com](https://app.supabase.com/) and create a new project.
2. Go to **SQL Editor** and run the full contents of `server/database/schema.sql` to create all tables, indexes, and policies.
3. If upgrading an existing database, also run `server/database/migration_admin_system.sql` and `server/database/migration_nutrition_fields.sql`.
4. Under **Settings → API**, copy:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

---

### Step 3 — Configure environment variables

Create a `.env` file in the **project root** (next to `package.json`):

```env
# Server
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=a_long_random_secret_string

# Cloudinary (optional – only needed for alternative image hosting)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Create a `.env` file inside the `client/` directory:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

> **Never commit `.env` files.** They are already in `.gitignore`.

---

### Step 4 — Install dependencies

```bash
# From the project root — installs both backend and frontend dependencies
npm run install-all
```

Or separately:

```bash
# Backend
npm install

# Frontend
cd client && npm install && cd ..
```

---

### Step 5 — Seed the database

Populate the exercise library with 25+ built-in exercises:

```bash
node server/database/seed.js
```

Expected output:

```
✓ Successfully seeded 25 exercises
Database seeding completed!
```

---

### Step 6 — Start the application

```bash
# Run backend (port 5000) and frontend (port 3000) concurrently
npm run dev
```

Or run them in separate terminals:

```bash
# Terminal 1 – backend
npm run server

# Terminal 2 – frontend
npm run client
```

---

### Step 7 — Verify everything is running

| Service | URL | Expected response |
|---|---|---|
| Frontend | http://localhost:3000 | SynergyFit landing page |
| Backend health | http://localhost:5000/api/health | `{ "status": "OK" }` |

---

### Step 8 — (Optional) Create an admin account

1. Register a regular account through the app.
2. Open the **Supabase SQL Editor** and run:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

3. Log out and log back in. A **🛡️ Admin** link will appear in the navbar.

For full details see [ADMIN_SETUP.md](ADMIN_SETUP.md).

---

### Troubleshooting

| Problem | Solution |
|---|---|
| `Supabase connection error` | Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env` |
| `Port 5000 already in use` | Change `PORT` in `.env` and update `"proxy"` in `client/package.json` |
| `Cannot find module` | Run `npm run install-all` again from the project root |
| Admin panel not visible | Log out, log back in; confirm `role = 'admin'` in database |

---

## 5. Key Folders & Files

```
SynergyFit-web/
├── package.json                    Root scripts (dev, build, install-all, etc.)
├── .env                            Backend environment variables (not committed)
│
├── server/                         Express back-end
│   ├── index.js                    Entry point – starts Express, registers all routes
│   ├── config/
│   │   └── supabase.js             Supabase client initialisation (service role)
│   ├── middleware/
│   │   ├── auth.js                 JWT verification middleware (protects routes)
│   │   └── admin.js                Role check – blocks non-admin requests
│   ├── controllers/                Business logic for each resource
│   │   ├── authController.js       Register, login, get-me
│   │   ├── userController.js       Profiles, follow/unfollow, search
│   │   ├── workoutController.js    CRUD + complete + templates
│   │   ├── exerciseController.js   Exercise library CRUD
│   │   ├── exerciseDbController.js Exercise DB integration
│   │   ├── mealController.js       Meal CRUD + daily stats
│   │   ├── foodSearchController.js Open Food Facts + offline fallback
│   │   ├── progressController.js   Progress entries + statistics
│   │   ├── goalController.js       Goals + milestones + auto-complete
│   │   ├── postController.js       Social posts, likes, comments
│   │   ├── uploadController.js     Image upload to Supabase Storage
│   │   └── adminController.js      User management, content moderation, stats
│   ├── routes/                     Express routers (one per resource)
│   │   ├── auth.js                 /api/auth/*
│   │   ├── users.js                /api/users/*
│   │   ├── workouts.js             /api/workouts/*
│   │   ├── exercises.js            /api/exercises/*
│   │   ├── meals.js                /api/meals/*
│   │   ├── foods.js                /api/foods/*
│   │   ├── progress.js             /api/progress/*
│   │   ├── goals.js                /api/goals/*
│   │   ├── posts.js                /api/posts/*
│   │   ├── upload.js               /api/upload/*
│   │   └── admin.js                /api/admin/*
│   ├── models/                     JavaScript model helpers (query abstractions)
│   │   ├── User.js
│   │   ├── Workout.js
│   │   ├── Exercise.js
│   │   ├── Meal.js
│   │   ├── Progress.js
│   │   ├── Goal.js
│   │   └── Post.js
│   └── database/
│       ├── schema.sql                  Full PostgreSQL schema (run once on new Supabase project)
│       ├── seed.js                     Seeds 25+ built-in exercises
│       ├── migration_admin_system.sql  Adds role + status columns to users
│       └── migration_nutrition_fields.sql  Adds fiber, brand, barcode columns
│
├── client/                         React front-end
│   ├── package.json                Frontend dependencies + proxy config
│   ├── .env                        REACT_APP_SUPABASE_* variables (not committed)
│   ├── public/
│   │   └── index.html              HTML shell
│   └── src/
│       ├── index.js                React entry point
│       ├── App.js                  Router setup + route definitions
│       ├── App.css / index.css     Global styles and CSS custom properties
│       ├── config/
│       │   └── supabase.js         Supabase client (anon key, used for Storage uploads)
│       ├── context/
│       │   └── AuthContext.js      Global auth state (user, token, login, logout)
│       ├── components/
│       │   ├── Navbar.js           Top navigation bar (adapts for admin role)
│       │   ├── Navbar.css
│       │   └── PrivateRoute.js     HOC that redirects unauthenticated users
│       ├── services/
│       │   ├── api.js              Axios instance with JWT interceptor + all API calls
│       │   └── index.js            Re-exports all service modules
│       └── pages/
│           ├── Home.js             Landing page
│           ├── Login.js            Login form
│           ├── Register.js         Registration form
│           ├── Dashboard.js        Personalised home screen with stats & quick actions
│           ├── Workouts.js         Workout list with filters + delete/complete actions
│           ├── WorkoutCreate.js    Create / edit workout plan + exercise picker
│           ├── WorkoutDetail.js    Single workout view
│           ├── WorkoutSession.js   Live session timer and exercise logger
│           ├── Exercises.js        Browsable exercise library
│           ├── ExerciseDetail.js   Single exercise detail view
│           ├── Meals.js            Meal log list with daily nutrition summary
│           ├── MealCreate.js       Food search (Open Food Facts) + meal builder
│           ├── Progress.js         Progress charts, entries, and photo gallery
│           ├── Goals.js            Goal cards with progress bars and milestones
│           ├── Social.js           Instagram-style feed, post creation, user search
│           ├── Profile.js          User profile, stats, follower/following lists
│           └── AdminDashboard.js   Admin panel – user management and content moderation
│
├── README.md                       This file
├── FEATURES.md                     Complete feature checklist
├── DOCUMENTATION.md                Technical deep-dive (schemas, patterns)
├── INSTALLATION.md                 Detailed step-by-step installation guide
├── ADMIN_SETUP.md                  Guide to creating and managing admin accounts
├── SOCIAL_FEATURES.md              Social feed architecture and usage guide
├── NUTRITION_TRACKING.md           Open Food Facts integration details
├── SUPABASE_MIGRATION.md           Database migration reference
└── SUPABASE_STORAGE_SETUP.md       Supabase Storage bucket and RLS setup guide
```

---

## 6. API Reference

All endpoints are prefixed with `/api`. Protected routes require the header:

```
Authorization: Bearer <jwt_token>
```

### Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create a new account |
| POST | `/auth/login` | No | Log in and receive a JWT |
| GET | `/auth/me` | Yes | Get the current user's profile |
| PUT | `/auth/change-password` | Yes | Change password |

### Users

| Method | Path | Description |
|---|---|---|
| GET | `/users/:id` | Get public profile |
| PUT | `/users/:id` | Update own profile |
| POST | `/users/:id/follow` | Follow a user |
| DELETE | `/users/:id/follow` | Unfollow a user |
| GET | `/users/search?q=` | Search users by name or username |

### Workouts

| Method | Path | Description |
|---|---|---|
| GET | `/workouts` | List workouts (filter: `isCompleted`, `isTemplate`) |
| POST | `/workouts` | Create a workout |
| GET | `/workouts/:id` | Get workout details |
| PUT | `/workouts/:id` | Update a workout |
| DELETE | `/workouts/:id` | Delete a workout |
| POST | `/workouts/:id/complete` | Mark as completed (with optional rating) |
| GET | `/workouts/templates/public` | Browse public templates |

### Exercises

| Method | Path | Description |
|---|---|---|
| GET | `/exercises` | List all exercises (with filters) |
| POST | `/exercises` | Create a custom exercise |
| GET | `/exercises/:id` | Get exercise details |
| PUT | `/exercises/:id` | Update a custom exercise |
| DELETE | `/exercises/:id` | Delete a custom exercise |

### Meals & Food

| Method | Path | Description |
|---|---|---|
| GET | `/meals` | List meals (filter by date) |
| POST | `/meals` | Log a meal with foods |
| GET | `/meals/:id` | Get meal details |
| PUT | `/meals/:id` | Update a meal |
| DELETE | `/meals/:id` | Delete a meal |
| GET | `/meals/stats/daily?date=` | Daily nutrition totals |
| GET | `/foods/search?query=` | Search Open Food Facts database |
| GET | `/foods/popular` | Popular foods (offline fallback) |
| GET | `/foods/barcode/:barcode` | Look up food by barcode |

### Progress

| Method | Path | Description |
|---|---|---|
| GET | `/progress` | List progress entries |
| POST | `/progress` | Create a progress entry |
| GET | `/progress/:id` | Get a specific entry |
| PUT | `/progress/:id` | Update an entry |
| DELETE | `/progress/:id` | Delete an entry |
| GET | `/progress/stats/summary` | Aggregated stats (avg weight, etc.) |

### Goals

| Method | Path | Description |
|---|---|---|
| GET | `/goals` | List goals (filter by status/type) |
| POST | `/goals` | Create a goal |
| GET | `/goals/:id` | Get goal details |
| PUT | `/goals/:id` | Update a goal |
| DELETE | `/goals/:id` | Delete a goal |
| POST | `/goals/:id/milestones` | Add a milestone |
| PUT | `/goals/:id/milestones/:mid` | Complete a milestone |

### Social Posts

| Method | Path | Description |
|---|---|---|
| GET | `/posts` | Get feed (query: `filter=following`, `type=`) |
| POST | `/posts` | Create a post (with optional image) |
| DELETE | `/posts/:id` | Delete own post |
| POST | `/posts/:id/like` | Toggle like on a post |
| POST | `/posts/:id/comments` | Add a comment |
| DELETE | `/posts/:id/comments/:cid` | Delete own comment |

### Admin (admin role required)

| Method | Path | Description |
|---|---|---|
| GET | `/admin/stats` | Platform-wide statistics |
| GET | `/admin/users` | List all users (search + filter) |
| PUT | `/admin/users/:id/suspend` | Suspend a user |
| PUT | `/admin/users/:id/activate` | Activate a user |
| GET | `/admin/posts` | List all posts for moderation |
| DELETE | `/admin/posts/:id` | Delete any post |

---

## 7. Additional Documentation

| File | Contents |
|---|---|
| [FEATURES.md](FEATURES.md) | Full checklist of every implemented feature |
| [DOCUMENTATION.md](DOCUMENTATION.md) | Deep-dive technical reference |
| [INSTALLATION.md](INSTALLATION.md) | Detailed, step-by-step installation guide with troubleshooting |
| [ADMIN_SETUP.md](ADMIN_SETUP.md) | How to create and manage admin accounts |
| [SOCIAL_FEATURES.md](SOCIAL_FEATURES.md) | Social feed architecture, UI wireframes, and usage guide |
| [NUTRITION_TRACKING.md](NUTRITION_TRACKING.md) | Open Food Facts integration, offline fallback, database fields |
| [SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md) | Running database migrations on existing deployments |
| [SUPABASE_STORAGE_SETUP.md](SUPABASE_STORAGE_SETUP.md) | Supabase Storage bucket setup and RLS policies for image uploads |

---

## License

[MIT](https://choosealicense.com/licenses/mit/)
