const { supabaseAdmin } = require('../config/supabase');
require('dotenv').config();

const exercises = [
  {
    name: 'Bench Press',
    description: 'A compound exercise that targets the chest, shoulders, and triceps',
    category: 'strength',
    muscle_group: 'chest',
    equipment: 'barbell',
    difficulty_level: 'intermediate',
    instructions: ['Lie on bench with feet flat on floor', 'Grip barbell slightly wider than shoulder width', 'Lower bar to chest', 'Press up to starting position'],
    is_custom: false
  },
  {
    name: 'Squats',
    description: 'A compound lower body exercise',
    category: 'strength',
    muscle_group: 'legs',
    equipment: 'barbell',
    difficulty_level: 'intermediate',
    instructions: ['Stand with feet shoulder-width apart', 'Lower body by bending knees', 'Keep back straight', 'Return to starting position'],
    is_custom: false
  },
  {
    name: 'Deadlift',
    description: 'A full-body compound exercise',
    category: 'strength',
    muscle_group: 'back',
    equipment: 'barbell',
    difficulty_level: 'advanced',
    instructions: ['Stand with feet hip-width apart', 'Bend at hips and knees', 'Grip barbell', 'Lift while keeping back straight'],
    is_custom: false
  },
  {
    name: 'Pull-ups',
    description: 'Upper body pulling exercise',
    category: 'strength',
    muscle_group: 'back',
    equipment: 'pull_up_bar',
    difficulty_level: 'intermediate',
    instructions: ['Hang from bar with overhand grip', 'Pull body up until chin over bar', 'Lower with control'],
    is_custom: false
  },
  {
    name: 'Push-ups',
    description: 'Bodyweight chest exercise',
    category: 'strength',
    muscle_group: 'chest',
    equipment: 'bodyweight',
    difficulty_level: 'beginner',
    instructions: ['Start in plank position', 'Lower body until chest near ground', 'Push back up'],
    is_custom: false
  },
  {
    name: 'Running',
    description: 'Cardiovascular exercise',
    category: 'cardio',
    muscle_group: 'full_body',
    equipment: 'none',
    difficulty_level: 'beginner',
    instructions: ['Start at comfortable pace', 'Maintain steady rhythm', 'Cool down gradually'],
    is_custom: false
  },
  {
    name: 'Cycling',
    description: 'Low impact cardio',
    category: 'cardio',
    muscle_group: 'legs',
    equipment: 'bicycle',
    difficulty_level: 'beginner',
    instructions: ['Adjust seat height', 'Start pedaling at moderate pace', 'Maintain consistent cadence'],
    is_custom: false
  },
  {
    name: 'Plank',
    description: 'Core stability exercise',
    category: 'core',
    muscle_group: 'core',
    equipment: 'bodyweight',
    difficulty_level: 'beginner',
    instructions: ['Start in forearm plank position', 'Keep body in straight line', 'Hold position'],
    is_custom: false
  },
  {
    name: 'Shoulder Press',
    description: 'Overhead pressing movement',
    category: 'strength',
    muscle_group: 'shoulders',
    equipment: 'dumbbells',
    difficulty_level: 'intermediate',
    instructions: ['Hold dumbbells at shoulder height', 'Press overhead', 'Lower with control'],
    is_custom: false
  },
  {
    name: 'Bicep Curls',
    description: 'Isolation exercise for biceps',
    category: 'strength',
    muscle_group: 'arms',
    equipment: 'dumbbells',
    difficulty_level: 'beginner',
    instructions: ['Hold dumbbells at sides', 'Curl weights up to shoulders', 'Lower slowly'],
    is_custom: false
  },
  {
    name: 'Tricep Dips',
    description: 'Bodyweight tricep exercise',
    category: 'strength',
    muscle_group: 'arms',
    equipment: 'parallel_bars',
    difficulty_level: 'intermediate',
    instructions: ['Support body on parallel bars', 'Lower body by bending elbows', 'Push back up'],
    is_custom: false
  },
  {
    name: 'Lunges',
    description: 'Single-leg lower body exercise',
    category: 'strength',
    muscle_group: 'legs',
    equipment: 'bodyweight',
    difficulty_level: 'beginner',
    instructions: ['Step forward with one leg', 'Lower hips until both knees bent 90 degrees', 'Push back to start'],
    is_custom: false
  },
  {
    name: 'Lat Pulldown',
    description: 'Back width exercise',
    category: 'strength',
    muscle_group: 'back',
    equipment: 'cable_machine',
    difficulty_level: 'beginner',
    instructions: ['Sit at lat pulldown machine', 'Grip bar wide', 'Pull bar to upper chest', 'Return with control'],
    is_custom: false
  },
  {
    name: 'Leg Press',
    description: 'Machine-based leg exercise',
    category: 'strength',
    muscle_group: 'legs',
    equipment: 'leg_press_machine',
    difficulty_level: 'beginner',
    instructions: ['Sit in leg press machine', 'Place feet on platform', 'Push platform away', 'Return with control'],
    is_custom: false
  },
  {
    name: 'Burpees',
    description: 'Full body HIIT exercise',
    category: 'cardio',
    muscle_group: 'full_body',
    equipment: 'bodyweight',
    difficulty_level: 'intermediate',
    instructions: ['Start standing', 'Drop to push-up position', 'Do push-up', 'Jump feet forward', 'Jump up'],
    is_custom: false
  },
  {
    name: 'Mountain Climbers',
    description: 'Cardio and core exercise',
    category: 'cardio',
    muscle_group: 'core',
    equipment: 'bodyweight',
    difficulty_level: 'intermediate',
    instructions: ['Start in plank position', 'Alternate bringing knees to chest', 'Maintain rapid pace'],
    is_custom: false
  },
  {
    name: 'Russian Twists',
    description: 'Rotational core exercise',
    category: 'core',
    muscle_group: 'core',
    equipment: 'bodyweight',
    difficulty_level: 'intermediate',
    instructions: ['Sit with knees bent, feet off ground', 'Lean back slightly', 'Rotate torso side to side'],
    is_custom: false
  },
  {
    name: 'Jumping Jacks',
    description: 'Basic cardio warm-up',
    category: 'cardio',
    muscle_group: 'full_body',
    equipment: 'none',
    difficulty_level: 'beginner',
    instructions: ['Start with feet together', 'Jump feet apart while raising arms', 'Return to start'],
    is_custom: false
  },
  {
    name: 'Rowing',
    description: 'Full body cardio',
    category: 'cardio',
    muscle_group: 'full_body',
    equipment: 'rowing_machine',
    difficulty_level: 'intermediate',
    instructions: ['Sit on rowing machine', 'Push with legs, pull with arms', 'Maintain steady rhythm'],
    is_custom: false
  },
  {
    name: 'Box Jumps',
    description: 'Plyometric leg exercise',
    category: 'strength',
    muscle_group: 'legs',
    equipment: 'plyo_box',
    difficulty_level: 'advanced',
    instructions: ['Stand facing box', 'Jump onto box', 'Land softly', 'Step down'],
    is_custom: false
  },
  {
    name: 'Yoga Flow',
    description: 'Flexibility and mindfulness',
    category: 'flexibility',
    muscle_group: 'full_body',
    equipment: 'yoga_mat',
    difficulty_level: 'beginner',
    instructions: ['Move through yoga poses', 'Focus on breathing', 'Hold each pose'],
    is_custom: false
  },
  {
    name: 'Swimming',
    description: 'Low impact full body cardio',
    category: 'cardio',
    muscle_group: 'full_body',
    equipment: 'pool',
    difficulty_level: 'intermediate',
    instructions: ['Choose swimming stroke', 'Maintain consistent pace', 'Focus on breathing'],
    is_custom: false
  },
  {
    name: 'Battle Ropes',
    description: 'High intensity upper body cardio',
    category: 'cardio',
    muscle_group: 'arms',
    equipment: 'battle_ropes',
    difficulty_level: 'advanced',
    instructions: ['Hold rope ends', 'Create waves with arms', 'Maintain intensity'],
    is_custom: false
  },
  {
    name: 'Kettlebell Swings',
    description: 'Explosive hip hinge movement',
    category: 'strength',
    muscle_group: 'full_body',
    equipment: 'kettlebell',
    difficulty_level: 'intermediate',
    instructions: ['Hold kettlebell with both hands', 'Hinge at hips', 'Swing kettlebell up', 'Control descent'],
    is_custom: false
  },
  {
    name: 'Face Pulls',
    description: 'Rear delt and upper back exercise',
    category: 'strength',
    muscle_group: 'shoulders',
    equipment: 'cable_machine',
    difficulty_level: 'beginner',
    instructions: ['Attach rope to cable machine', 'Pull rope towards face', 'Squeeze shoulder blades'],
    is_custom: false
  }
];

async function seedDatabase() {
  try {
    console.log('Starting database seed...');

    // Insert exercises
    const { data, error } = await supabaseAdmin
      .from('exercises')
      .insert(exercises)
      .select();

    if (error) {
      console.error('Error seeding exercises:', error);
      throw error;
    }

    console.log(`✓ Successfully seeded ${data.length} exercises`);
    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
