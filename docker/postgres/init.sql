-- Initial setup for crash analytics database
-- This runs when the database is first created

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Create indexes schema for better organization (optional)
CREATE SCHEMA IF NOT EXISTS analytics;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE crash_analytics TO crash_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO crash_user;
GRANT ALL PRIVILEGES ON SCHEMA analytics TO crash_user;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Crash Analytics Database initialized successfully!';
END $$;
