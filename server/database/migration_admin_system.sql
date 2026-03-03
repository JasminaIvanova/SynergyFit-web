-- Migration: Add role and status fields to users table
-- Date: 2026-03-04
-- Description: Add admin role system and user status management

-- Add role column (user or admin)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Add status column (active or suspended)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended'));

-- Add last_login column for tracking user activity
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Update existing users to have default values
UPDATE users 
SET role = 'user' 
WHERE role IS NULL;

UPDATE users 
SET status = 'active' 
WHERE status IS NULL;

-- Create an index on role for faster admin queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create an index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- (Optional) Make the first registered user an admin
-- Uncomment the line below and replace 'your-email@example.com' with the actual admin email
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('role', 'status')
ORDER BY column_name;
