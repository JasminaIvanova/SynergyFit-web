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
- Follow other users
- Share workouts and meals
- Like and comment on posts
- Create fitness challenges
- Join community groups

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
- CSS Modules

### Backend
- Node.js
- Express.js
- Supabase (PostgreSQL database)
- JWT Authentication
- bcryptjs (password hashing)
- Cloudinary (image uploads)

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
- `GET /api/posts` - Get feed posts
- `POST /api/posts` - Create post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Comment on post

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
