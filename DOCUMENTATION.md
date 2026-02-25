# SynergyFit - Technical Documentation

## Architecture Overview

SynergyFit is built using the MERN stack (MongoDB, Express, React, Node.js) with a RESTful API architecture.

### Technology Stack

#### Frontend
- **React 18** - UI framework
- **React Router 6** - Client-side routing
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **Date-fns** - Date manipulation
- **React Icons** - Icon library

#### Backend
- **Node.js** - Runtime environment
- **Express 4** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## Database Schema

### User Model
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    avatar: String,
    dateOfBirth: Date,
    gender: Enum,
    height: Number,
    currentWeight: Number,
    targetWeight: Number,
    activityLevel: Enum
  },
  goals: {
    fitnessGoal: Enum,
    dailyCalorieGoal: Number,
    proteinGoal: Number,
    carbsGoal: Number,
    fatsGoal: Number
  },
  followers: [ObjectId],
  following: [ObjectId],
  streaks: {
    currentWorkoutStreak: Number,
    longestWorkoutStreak: Number,
    lastWorkoutDate: Date
  },
  timestamps: true
}
```

### Exercise Model
```javascript
{
  name: String (required),
  category: Enum (required),
  muscleGroups: [Enum],
  equipment: Enum,
  difficulty: Enum,
  description: String,
  instructions: [String],
  videoUrl: String,
  imageUrl: String,
  caloriesBurnedPerMinute: Number,
  isCustom: Boolean,
  createdBy: ObjectId,
  timestamps: true
}
```

### Workout Model
```javascript
{
  user: ObjectId (required),
  name: String (required),
  description: String,
  exercises: [{
    exercise: ObjectId,
    sets: Number,
    reps: Number,
    duration: Number,
    weight: Number,
    restTime: Number,
    notes: String
  }],
  totalDuration: Number,
  caloriesBurned: Number,
  difficulty: Enum,
  category: Enum,
  scheduledDate: Date,
  completedAt: Date,
  isCompleted: Boolean,
  isTemplate: Boolean,
  rating: Number,
  notes: String,
  timestamps: true
}
```

### Meal Model
```javascript
{
  user: ObjectId (required),
  name: String (required),
  mealType: Enum (required),
  date: Date (required),
  foods: [{
    name: String,
    servingSize: String,
    quantity: Number,
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
    fiber: Number
  }],
  totalNutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
    fiber: Number
  },
  imageUrl: String,
  notes: String,
  isPublic: Boolean,
  timestamps: true
}
```

### Progress Model
```javascript
{
  user: ObjectId (required),
  date: Date (required),
  weight: Number,
  bodyMeasurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    arms: Number,
    thighs: Number
  },
  bodyFatPercentage: Number,
  photos: [{
    url: String,
    type: Enum
  }],
  notes: String,
  mood: Enum,
  energyLevel: Number,
  timestamps: true
}
```

### Post Model
```javascript
{
  user: ObjectId (required),
  type: Enum (required),
  content: {
    text: String,
    imageUrls: [String]
  },
  workout: ObjectId,
  meal: ObjectId,
  progress: ObjectId,
  likes: [ObjectId],
  comments: [{
    user: ObjectId,
    text: String,
    createdAt: Date
  }],
  isPublic: Boolean,
  tags: [String],
  timestamps: true
}
```

### Goal Model
```javascript
{
  user: ObjectId (required),
  title: String (required),
  description: String,
  type: Enum (required),
  target: {
    value: Number,
    unit: String
  },
  current: {
    value: Number,
    unit: String
  },
  startDate: Date,
  targetDate: Date,
  completedDate: Date,
  status: Enum,
  milestones: [{
    title: String,
    value: Number,
    completedAt: Date,
    isCompleted: Boolean
  }],
  isPublic: Boolean,
  timestamps: true
}
```

## API Design

### Authentication Flow

1. **Registration**
   - User submits credentials
   - Password is hashed with bcrypt
   - User document created
   - JWT token generated and returned

2. **Login**
   - User submits credentials
   - Password verified against hash
   - JWT token generated and returned

3. **Protected Routes**
   - Client includes JWT in Authorization header
   - Middleware verifies token
   - User ID extracted from token
   - Request proceeds with authenticated user

### Middleware

#### Authentication Middleware
```javascript
// Verifies JWT token
// Attaches userId to request object
// Returns 401 if invalid/missing token
```

#### Error Handling Middleware
```javascript
// Catches errors from route handlers
// Formats error responses
// Logs errors in development
```

## Frontend Architecture

### Component Structure

```
App
├── Navbar (always visible)
├── Routes
    ├── Home (public)
    ├── Login (public)
    ├── Register (public)
    ├── Dashboard (protected)
    ├── Workouts (protected)
    ├── WorkoutDetail (protected)
    ├── Exercises (protected)
    ├── Meals (protected)
    ├── Progress (protected)
    ├── Goals (protected)
    ├── Social (protected)
    └── Profile (protected)
```

### State Management

#### Auth Context
- Manages authentication state
- Provides login/logout functions
- Stores current user information
- Persists token in localStorage

### API Service Layer

Centralized API calls in `/services`:
- Consistent error handling
- Automatic token injection
- Request/response interceptors
- Organized by resource type

## Security Considerations

### Backend Security

1. **Password Security**
   - Passwords hashed with bcrypt (10 rounds)
   - Never stored in plain text
   - Never returned in API responses

2. **JWT Security**
   - Tokens expire after 30 days
   - Secret key stored in environment variables
   - Tokens verified on each protected request

3. **Input Validation**
   - Express Validator for request validation
   - Mongoose schema validation
   - Sanitization of user inputs

4. **Authorization**
   - Users can only access their own data
   - Ownership verified before modifications
   - Public/private content flags

### Frontend Security

1. **XSS Prevention**
   - React's automatic escaping
   - No dangerouslySetInnerHTML usage
   - Input sanitization

2. **CORS**
   - Configured for specific origins
   - Credentials included in requests

## Performance Optimizations

### Backend

1. **Database Indexing**
   - User ID indexed for fast queries
   - Date fields indexed for time-range queries
   - Compound indexes for common query patterns

2. **Query Optimization**
   - Selective field retrieval
   - Pagination for large datasets
   - Lean queries where possible

3. **Caching**
   - Consider Redis for session storage
   - Cache frequently accessed data

### Frontend

1. **Code Splitting**
   - React Router lazy loading
   - Component-level code splitting

2. **Asset Optimization**
   - Compressed images
   - Minified production builds
   - Tree shaking unused code

3. **Network Optimization**
   - Axios request cancellation
   - Debounced search inputs
   - Optimistic UI updates

## Testing Strategy

### Backend Testing

```javascript
// Unit Tests
- Model methods
- Utility functions
- Middleware logic

// Integration Tests
- API endpoints
- Authentication flow
- Database operations

// Tools
- Jest
- Supertest
- MongoDB Memory Server
```

### Frontend Testing

```javascript
// Unit Tests
- Component rendering
- Utility functions
- Context providers

// Integration Tests
- User flows
- Form submissions
- API interactions

// E2E Tests
- Critical user journeys
- Authentication flow
- Data manipulation

// Tools
- React Testing Library
- Jest
- Cypress (E2E)
```

## Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database backup strategy
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Logging configured
- [ ] Error monitoring (Sentry)
- [ ] Performance monitoring
- [ ] CI/CD pipeline setup
- [ ] Documentation updated

### Deployment Options

1. **Heroku**
   - Easy deployment
   - MongoDB Atlas for database
   - Automatic SSL

2. **DigitalOcean**
   - More control
   - Better performance
   - Cost-effective

3. **AWS**
   - Scalable
   - Multiple services
   - More complex setup

4. **Vercel (Frontend) + Backend hosting**
   - Excellent frontend performance
   - Separate backend deployment

## Future Enhancements

### Planned Features

1. **AI Integration**
   - Workout recommendations
   - Meal planning
   - Form check via computer vision
   - Personalized coaching

2. **Mobile App**
   - React Native app
   - Offline functionality
   - Push notifications

3. **Advanced Analytics**
   - Detailed progress reports
   - Predictive analytics
   - Performance trends

4. **Social Features**
   - Challenges and competitions
   - Group workouts
   - Messaging system
   - Achievement badges

5. **Integrations**
   - Wearable devices (Fitbit, Apple Watch)
   - Nutrition APIs
   - Calendar sync
   - Payment processing

### Technical Debt

- [ ] Implement comprehensive error boundaries
- [ ] Add request rate limiting
- [ ] Implement caching strategy
- [ ] Add real-time features with WebSockets
- [ ] Improve test coverage
- [ ] Add API documentation (Swagger)
- [ ] Implement CI/CD pipeline
- [ ] Add database migrations
- [ ] Implement file upload for images
- [ ] Add email notifications

## Contributing Guidelines

### Code Style

- ESLint configuration
- Prettier for formatting
- Consistent naming conventions
- Meaningful variable names
- Comprehensive comments

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: add feature description"

# Push and create PR
git push origin feature/feature-name
```

### Commit Message Format

```
feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code restructuring
test: adding tests
chore: maintenance
```

## Support & Maintenance

### Monitoring

- Application logs
- Error tracking
- Performance metrics
- User analytics
- Database metrics

### Backup Strategy

- Daily automated backups
- Weekly full backups
- Backup retention policy
- Disaster recovery plan

### Updates

- Regular dependency updates
- Security patches
- Feature releases
- Bug fixes

## License

MIT License - See LICENSE file for details

## Contributors

- Development Team
- Contributors welcome!

---

**Last Updated:** February 2026
**Version:** 1.0.0
