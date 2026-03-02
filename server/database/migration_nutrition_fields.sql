-- Migration: Add missing fields for nutrition tracking
-- Date: 2026-03-02

-- Add name field to meals table
ALTER TABLE meals ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Add fiber tracking to meals
ALTER TABLE meals ADD COLUMN IF NOT EXISTS total_fiber DECIMAL(6,2) DEFAULT 0;

-- Add brand and barcode to meal_foods for Open Food Facts integration
ALTER TABLE meal_foods ADD COLUMN IF NOT EXISTS brand VARCHAR(255);
ALTER TABLE meal_foods ADD COLUMN IF NOT EXISTS barcode VARCHAR(50);
ALTER TABLE meal_foods ADD COLUMN IF NOT EXISTS fiber DECIMAL(6,2) DEFAULT 0;

-- Update existing records to have a default name if null
UPDATE meals SET name = meal_type || ' - ' || to_char(meal_date, 'YYYY-MM-DD') WHERE name IS NULL;
