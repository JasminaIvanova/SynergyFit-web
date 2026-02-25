const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Exercise = require('./models/Exercise');

dotenv.config();

// Sample exercises to populate the database
const exercises = [
  // Strength - Chest
  {
    name: 'Bench Press',
    category: 'strength',
    muscleGroups: ['chest', 'arms'],
    equipment: 'barbell',
    difficulty: 'intermediate',
    description: 'Classic compound movement for chest development',
    instructions: [
      'Lie flat on bench with feet on floor',
      'Grip bar slightly wider than shoulder width',
      'Lower bar to chest with control',
      'Press bar back up to starting position'
    ],
    caloriesBurnedPerMinute: 8,
  },
  {
    name: 'Push-ups',
    category: 'strength',
    muscleGroups: ['chest', 'arms', 'shoulders'],
    equipment: 'none',
    difficulty: 'beginner',
    description: 'Bodyweight exercise for upper body strength',
    instructions: [
      'Start in plank position',
      'Lower body until chest nearly touches floor',
      'Push back up to starting position',
      'Keep core engaged throughout'
    ],
    caloriesBurnedPerMinute: 7,
  },
  {
    name: 'Dumbbell Flyes',
    category: 'strength',
    muscleGroups: ['chest'],
    equipment: 'dumbbells',
    difficulty: 'intermediate',
    description: 'Isolation exercise for chest muscles',
    instructions: [
      'Lie on bench with dumbbells above chest',
      'Lower weights in arc motion',
      'Bring weights back together above chest',
      'Keep slight bend in elbows'
    ],
    caloriesBurnedPerMinute: 6,
  },

  // Strength - Back
  {
    name: 'Pull-ups',
    category: 'strength',
    muscleGroups: ['back', 'arms'],
    equipment: 'other',
    difficulty: 'advanced',
    description: 'Compound bodyweight exercise for back',
    instructions: [
      'Hang from bar with overhand grip',
      'Pull yourself up until chin over bar',
      'Lower with control',
      'Avoid swinging'
    ],
    caloriesBurnedPerMinute: 10,
  },
  {
    name: 'Barbell Rows',
    category: 'strength',
    muscleGroups: ['back'],
    equipment: 'barbell',
    difficulty: 'intermediate',
    description: 'Compound movement for back thickness',
    instructions: [
      'Bend at hips with bar hanging',
      'Pull bar to lower chest',
      'Lower with control',
      'Keep back straight'
    ],
    caloriesBurnedPerMinute: 8,
  },
  {
    name: 'Lat Pulldown',
    category: 'strength',
    muscleGroups: ['back', 'arms'],
    equipment: 'machine',
    difficulty: 'beginner',
    description: 'Machine exercise for back width',
    instructions: [
      'Sit at machine with thighs secured',
      'Pull bar down to upper chest',
      'Control the weight back up',
      'Lean back slightly'
    ],
    caloriesBurnedPerMinute: 7,
  },

  // Strength - Legs
  {
    name: 'Squats',
    category: 'strength',
    muscleGroups: ['legs', 'glutes'],
    equipment: 'barbell',
    difficulty: 'intermediate',
    description: 'King of leg exercises',
    instructions: [
      'Bar on upper back, feet shoulder width',
      'Lower until thighs parallel to ground',
      'Drive through heels to stand',
      'Keep chest up and core tight'
    ],
    caloriesBurnedPerMinute: 9,
  },
  {
    name: 'Lunges',
    category: 'strength',
    muscleGroups: ['legs', 'glutes'],
    equipment: 'dumbbells',
    difficulty: 'beginner',
    description: 'Unilateral leg exercise',
    instructions: [
      'Step forward with one leg',
      'Lower back knee toward ground',
      'Push back to starting position',
      'Alternate legs'
    ],
    caloriesBurnedPerMinute: 8,
  },
  {
    name: 'Deadlifts',
    category: 'strength',
    muscleGroups: ['back', 'legs', 'glutes'],
    equipment: 'barbell',
    difficulty: 'advanced',
    description: 'Complete posterior chain exercise',
    instructions: [
      'Stand with bar over feet',
      'Bend and grip bar',
      'Lift by extending hips and knees',
      'Lower with control'
    ],
    caloriesBurnedPerMinute: 9,
  },
  {
    name: 'Leg Press',
    category: 'strength',
    muscleGroups: ['legs', 'glutes'],
    equipment: 'machine',
    difficulty: 'beginner',
    description: 'Machine-based leg exercise',
    instructions: [
      'Sit on machine with feet on platform',
      'Lower platform by bending knees',
      'Press platform back up',
      'Keep back against pad'
    ],
    caloriesBurnedPerMinute: 8,
  },

  // Strength - Shoulders
  {
    name: 'Shoulder Press',
    category: 'strength',
    muscleGroups: ['shoulders', 'arms'],
    equipment: 'dumbbells',
    difficulty: 'intermediate',
    description: 'Overhead pressing movement',
    instructions: [
      'Hold dumbbells at shoulder height',
      'Press weights overhead',
      'Lower with control',
      'Keep core engaged'
    ],
    caloriesBurnedPerMinute: 7,
  },
  {
    name: 'Lateral Raises',
    category: 'strength',
    muscleGroups: ['shoulders'],
    equipment: 'dumbbells',
    difficulty: 'beginner',
    description: 'Isolation exercise for side delts',
    instructions: [
      'Hold dumbbells at sides',
      'Raise arms to shoulder height',
      'Lower with control',
      'Keep slight bend in elbows'
    ],
    caloriesBurnedPerMinute: 5,
  },

  // Strength - Arms
  {
    name: 'Bicep Curls',
    category: 'strength',
    muscleGroups: ['arms'],
    equipment: 'dumbbells',
    difficulty: 'beginner',
    description: 'Classic bicep exercise',
    instructions: [
      'Hold dumbbells with arms extended',
      'Curl weights toward shoulders',
      'Lower with control',
      'Keep elbows stationary'
    ],
    caloriesBurnedPerMinute: 5,
  },
  {
    name: 'Tricep Dips',
    category: 'strength',
    muscleGroups: ['arms', 'chest'],
    equipment: 'none',
    difficulty: 'intermediate',
    description: 'Bodyweight tricep exercise',
    instructions: [
      'Support yourself on parallel bars',
      'Lower body by bending elbows',
      'Press back up',
      'Keep elbows close to body'
    ],
    caloriesBurnedPerMinute: 7,
  },

  // Cardio
  {
    name: 'Running',
    category: 'cardio',
    muscleGroups: ['legs', 'full_body'],
    equipment: 'none',
    difficulty: 'beginner',
    description: 'Classic cardiovascular exercise',
    instructions: [
      'Maintain steady pace',
      'Land on midfoot',
      'Keep arms relaxed',
      'Breathe rhythmically'
    ],
    caloriesBurnedPerMinute: 10,
  },
  {
    name: 'Jump Rope',
    category: 'cardio',
    muscleGroups: ['legs', 'full_body'],
    equipment: 'other',
    difficulty: 'beginner',
    description: 'High-intensity cardio workout',
    instructions: [
      'Hold rope handles at sides',
      'Swing rope overhead',
      'Jump as rope passes under feet',
      'Land softly on balls of feet'
    ],
    caloriesBurnedPerMinute: 12,
  },
  {
    name: 'Burpees',
    category: 'cardio',
    muscleGroups: ['full_body'],
    equipment: 'none',
    difficulty: 'intermediate',
    description: 'Full body explosive exercise',
    instructions: [
      'Start standing',
      'Drop to plank position',
      'Do a push-up',
      'Jump feet forward and jump up'
    ],
    caloriesBurnedPerMinute: 12,
  },
  {
    name: 'Mountain Climbers',
    category: 'cardio',
    muscleGroups: ['full_body', 'abs'],
    equipment: 'none',
    difficulty: 'intermediate',
    description: 'Dynamic core and cardio exercise',
    instructions: [
      'Start in plank position',
      'Bring one knee to chest',
      'Quickly switch legs',
      'Maintain plank form'
    ],
    caloriesBurnedPerMinute: 10,
  },

  // Flexibility
  {
    name: 'Yoga Flow',
    category: 'flexibility',
    muscleGroups: ['full_body'],
    equipment: 'none',
    difficulty: 'beginner',
    description: 'Flowing yoga sequence',
    instructions: [
      'Move through poses fluidly',
      'Focus on breath',
      'Hold each pose briefly',
      'Maintain proper form'
    ],
    caloriesBurnedPerMinute: 4,
  },
  {
    name: 'Static Stretching',
    category: 'flexibility',
    muscleGroups: ['full_body'],
    equipment: 'none',
    difficulty: 'beginner',
    description: 'Hold stretches for muscle flexibility',
    instructions: [
      'Hold each stretch 20-30 seconds',
      'Breathe deeply',
      'Never bounce',
      'Feel gentle tension, not pain'
    ],
    caloriesBurnedPerMinute: 2,
  },

  // Core
  {
    name: 'Plank',
    category: 'strength',
    muscleGroups: ['abs', 'full_body'],
    equipment: 'none',
    difficulty: 'beginner',
    description: 'Isometric core exercise',
    instructions: [
      'Hold body in straight line',
      'Support on forearms and toes',
      'Keep hips level',
      'Engage core muscles'
    ],
    caloriesBurnedPerMinute: 5,
  },
  {
    name: 'Crunches',
    category: 'strength',
    muscleGroups: ['abs'],
    equipment: 'none',
    difficulty: 'beginner',
    description: 'Classic ab exercise',
instructions: [
      'Lie on back with knees bent',
      'Lift shoulders off ground',
      'Contract abs',
      'Lower with control'
    ],
    caloriesBurnedPerMinute: 6,
  },
  {
    name: 'Russian Twists',
    category: 'strength',
    muscleGroups: ['abs'],
    equipment: 'none',
    difficulty: 'intermediate',
    description: 'Rotational core exercise',
    instructions: [
      'Sit with knees bent, feet off ground',
      'Rotate torso side to side',
      'Touch ground on each side',
      'Keep core engaged'
    ],
    caloriesBurnedPerMinute: 7,
  },
];

// Connect to database and seed exercises
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/synergyfit', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing exercises (optional)
    await Exercise.deleteMany({ isCustom: false });
    console.log('Cleared existing default exercises');

    // Insert exercises
    await Exercise.insertMany(exercises);
    console.log(`Successfully seeded ${exercises.length} exercises`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
