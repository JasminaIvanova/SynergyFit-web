# Nutrition Tracking with Open Food Facts Integration

## Overview
The nutrition tracking system has been enhanced with Open Food Facts API integration, allowing users to search for food items from a comprehensive database and accurately track their macros (protein, carbs, fats) and calories.

## Features

### 1. Food Search
- Search through millions of food products from the Open Food Facts database
- View product images, brands, and nutritional information
- See nutrition per 100g for accurate tracking

### 2. Meal Logging
- Create custom meals with multiple food items
- Specify portion sizes for each food
- Automatic calculation of total nutrition
- Support for meal types: breakfast, lunch, dinner, snack
- Add notes to meals

### 3. Macro Tracking
- Track daily intake of:
  - Calories (kcal)
  - Protein (g)
  - Carbohydrates (g)
  - Fats (g)
  - Fiber (g)
- View daily summaries
- Date-based filtering

## Database Schema Updates

### New Fields in `meals` Table:
- `name` (VARCHAR 255): Custom name for the meal
- `total_fiber` (DECIMAL 6,2): Total fiber content

### New Fields in `meal_foods` Table:
- `brand` (VARCHAR 255): Food brand name from Open Food Facts
- `barcode` (VARCHAR 50): Product barcode for tracking
- `fiber` (DECIMAL 6,2): Fiber content

## API Endpoints

### Food Search
- `GET /api/foods/search?query={search_term}&page={page}&pageSize={size}`
  - Search for foods in Open Food Facts database
  - Returns product information with nutrition per 100g
  
- `GET /api/foods/barcode/:barcode`
  - Get detailed food information by barcode
  - Returns complete nutrition data and ingredients

### Meal Management
- `GET /api/meals` - Get user's meals (with date filtering)
- `POST /api/meals` - Create a new meal with foods
- `GET /api/meals/:id` - Get meal details
- `PUT /api/meals/:id` - Update a meal
- `DELETE /api/meals/:id` - Delete a meal
- `GET /api/meals/stats/daily?date={date}` - Get daily nutrition stats

## Frontend Components

### New Components:
- **MealCreate** (`client/src/pages/MealCreate.js`)
  - Food search interface
  - Add foods with custom quantities
  - Real-time nutrition calculation
  - Meal details form

### Updated Components:
- **Meals** (`client/src/pages/Meals.js`)
  - Added "Log Meal" button
  - Updated to display meal names and brands
  - Compatible with both Supabase (id) and MongoDB (_id) formats

## Installation & Setup

### 1. Run Database Migration
If you have an existing database, run the migration:

\`\`\`bash
# Connect to your Supabase database or PostgreSQL
psql -h [your-host] -U [your-user] -d [your-database] -f server/database/migration_nutrition_fields.sql
\`\`\`

Or if starting fresh, the schema.sql already includes the new fields.

### 2. Install Dependencies
The `axios` package is already included in dependencies, but ensure it's installed:

\`\`\`bash
npm install
\`\`\`

### 3. Restart the Server
\`\`\`bash
npm run dev
# or
npm run server
\`\`\`

## Usage Guide

### For Users:

1. **Navigate to Nutrition Tracking**
   - Click on "Meals" in the navigation menu

2. **Log a New Meal**
   - Click the "+ Log Meal" button
   - Enter meal details (name, type, date)
   - Search for foods using the search bar
   - Add foods to your meal
   - Adjust portion sizes as needed
   - Review total nutrition
   - Click "Log Meal" to save

3. **View Daily Stats**
   - Select a date to view meals for that day
   - See total calories and macros
   - View individual meals and their nutrition

4. **Manage Meals**
   - Delete meals as needed
   - Track your nutrition over time

## Open Food Facts API

The system integrates with the Open Food Facts API (https://world.openfoodfacts.org/), which provides:
- Nutritional information for millions of food products
- Product images and brand information
- Nutri-Score ratings
- Ingredient lists
- Barcode database

### API Rate Limits:
- Free to use
- No authentication required for basic searches
- Respectful usage recommended (avoid excessive requests)

## Technical Details

### Food Search Controller
Location: `server/controllers/foodSearchController.js`

Features:
- Searches Open Food Facts database
- Formats nutrition data consistently
- Handles both per-100g and per-serving values
- Error handling for API failures

### Routes
Location: `server/routes/foods.js`

All routes are protected with authentication middleware.

### Services
Location: `client/src/services/index.js`

Added `foodService` with methods:
- `searchFoods(query, page, pageSize)` - Search for foods
- `getFoodByBarcode(barcode)` - Get food by barcode

## Future Enhancements

Potential improvements:
1. Barcode scanning using device camera
2. Custom food entries
3. Favorite foods list
4. Meal templates/recipes
5. Nutrition goals and recommendations
6. Weekly/monthly nutrition reports
7. Export nutrition data
8. Meal planning features

## Troubleshooting

### Migration Issues
If you encounter errors when running the migration:
1. Check database connection
2. Ensure you have proper permissions
3. Fields may already exist (migration is idempotent)

### API Search Not Working
1. Check internet connection
2. Verify server can reach openfoodfacts.org
3. Check server logs for API errors

### Foods Not Saving
1. Verify database migration completed
2. Check server logs for errors
3. Ensure all required fields are provided

## Credits

- **Open Food Facts**: https://world.openfoodfacts.org/
  - A free, collaborative database of food products from around the world
  - Licensed under Open Database License (ODbL)
