-- HR Recruitment System Database Initialization
-- This file sets up the PostgreSQL database with required extensions

-- Create database (this is done automatically by Docker)
-- CREATE DATABASE hr_recruitment;

-- Connect to the database
\c hr_recruitment;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Create enum types for job status
CREATE TYPE job_status AS ENUM ('draft', 'published', 'closed', 'filled');

-- Grant permissions to postgres user
GRANT ALL PRIVILEGES ON DATABASE hr_recruitment TO postgres;

-- Log initialization completion
SELECT 'Database initialized successfully!' AS status;