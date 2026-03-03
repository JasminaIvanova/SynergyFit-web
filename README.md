# SynergyFit Web Platform

A comprehensive fitness platform for managing workout routines, nutrition tracking, progress monitoring, and social interaction.

## Features

### 🏋️ Fitness Routines
- Create and customize workout plans
- Browse exercise library with instructions
- Track workout completion
- Schedule workout sessions

### 🥗 Nutrition Tracking
- Log daily meals and calories
- Track macronutrients (protein, carbs, fats)
- Set nutrition goals
- Browse healthy recipes

### 📊 Progress Tracking
- Monitor weight and body measurements
- View progress charts and statistics
- Track personal records
- Set and achieve fitness goals

### 👥 Social Features
- **Instagram-style social feed** with image uploads
- Follow/unfollow users
- Share workouts, meals, and progress with photos
- Like and comment on posts
- Search for users
- View all posts or filter by following
- Filter posts by type (workout, meal, progress, achievement)

### 📊 Goals & Progress Integration
- Set fitness goals (weight, measurements, nutrition)
- Auto-complete goals when progress entries match targets
- Track weight with 0.1kg precision
- Track body measurements (chest, waist, hips, arms, legs)
- BMR/TDEE calculator with personalized macro recommendations

### 🤖 AI Features (Optional)
- Personalized workout recommendations
- Meal plan suggestions
- Form check and feedback

## Tech Stack

### Frontend
- React.js
- React Router
- Axios
- Chart.js (for progress visualization)
- Supabase Client (for image uploads)
- CSS Modules

### Backend
- Node.js
- Express.js
- Supabase (PostgreSQL database & Storage)
- JWT Authentication
- bcryptjs (password hashing)
- Supabase Storage (image uploads)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/JasminaIvanova/SynergyFit-web.git
cd SynergyFit-web
```

2. Install dependencies for both frontend and backend
```bash
npm run install-all
```

3. Create a `.env` file in the root directory (use `.env.example` as template)

4. Start MongoDB service

5. Run the development server
```bash
npm run dev
```

The backend will run on `http://localhost:5000` and frontend on `http://localhost:3000`

## Project Structure

```
SynergyFit-web/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context for state
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── App.js
│   └── package.json
├── server/                # Express backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/follow` - Follow/unfollow user

### Workouts
- `GET /api/workouts` - Get all workouts
- `POST /api/workouts` - Create workout
- `GET /api/workouts/:id` - Get workout by ID
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Meals
- `GET /api/meals` - Get all meals
- `POST /api/meals` - Log meal
- `GET /api/meals/:id` - Get meal by ID
- `PUT /api/meals/:id` - Update meal
- `DELETE /api/meals/:id` - Delete meal

### Progress
- `GET /api/progress` - Get user progress
- `POST /api/progress` - Log progress entry
- `GET /api/progress/stats` - Get progress statistics

### Social
- `GET /api/posts` - Get feed posts (all users or following only)
- `POST /api/posts` - Create post with optional image
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment to post
- `DELETE /api/posts/:id` - Delete post

### Goals
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

## 📚 Additional Documentation

- [SUPABASE_STORAGE_SETUP.md](SUPABASE_STORAGE_SETUP.md) - Complete guide for setting up Supabase Storage for image uploads
- [FEATURES.md](FEATURES.md) - Detailed feature documentation
- [INSTALLATION.md](INSTALLATION.md) - Step-by-step installation guide
- [NUTRITION_TRACKING.md](NUTRITION_TRACKING.md) - Nutrition tracking features
- [DOCUMENTATION.md](DOCUMENTATION.md) - Full technical documentation

## 🚀 Quick Start for Image Uploads

1. **Set up Supabase Storage:**
   - Create an `images` bucket in Supabase Dashboard
   - Set up RLS policies (see [SUPABASE_STORAGE_SETUP.md](SUPABASE_STORAGE_SETUP.md))

2. **Configure environment variables:**
   ```bash
   # Root .env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   
   # client/.env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Start the application and test:**
   - Navigate to Social Feed
   - Create a post with an image
   - Image uploads to Supabase Storage automatically

## 🔑 Key Features Details

### Instagram-Style Social Feed
- Upload images with posts (max 5MB)
- View all users' posts or filter by following
- Real-time likes and comments
- User search with follow/unfollow
- Post types: General, Workout, Meal, Progress, Achievement

### Smart Goals System
- Goals automatically complete when progress entries match targets
- Weight goal tolerance: 0.1kg (100g)
- Measurement tolerance: 0.5cm
- BMR/TDEE calculator based on Mifflin-St Jeor equation
- Personalized macro recommendations

### Progress Tracking
- Track weight, energy levels, sleep quality
- Body measurements (chest, waist, hips, arms, legs)
- Auto-sync with goals
- Visual progress charts
- `POST /api/posts/:id/comment` - Comment on post

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
