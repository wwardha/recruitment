-- HR Recruitment System Database Schema Proposal
-- PostgreSQL Database Design

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('admin', 'recruiter', 'hiring_manager', 'candidate');

-- Application status enum
CREATE TYPE application_status AS ENUM ('submitted', 'screening', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn', 'hired');

-- Job status enum
CREATE TYPE job_status AS ENUM ('draft', 'pending_approval', 'approved', 'published', 'closed', 'filled', 'cancelled');

-- Interview status enum
CREATE TYPE interview_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- Offer status enum
CREATE TYPE offer_status AS ENUM ('draft', 'extended', 'negotiating', 'accepted', 'declined', 'withdrawn');

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job requisitions table
CREATE TABLE job_requisitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    department_id UUID REFERENCES departments(id),
    hiring_manager_id UUID REFERENCES users(id),
    justification TEXT NOT NULL,
    headcount INTEGER NOT NULL DEFAULT 1,
    employment_type VARCHAR(50) NOT NULL, -- full-time, part-time, contract
    location VARCHAR(200),
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    requirements JSONB, -- flexible requirements storage
    status job_status DEFAULT 'draft',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job postings table
CREATE TABLE job_postings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    requisition_id UUID REFERENCES job_requisitions(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    benefits TEXT,
    location VARCHAR(200),
    remote_type VARCHAR(50), -- onsite, remote, hybrid
    salary_range VARCHAR(100),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    external_job_ids JSONB, -- store IDs from external job boards
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Candidates table
CREATE TABLE candidates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) UNIQUE,
    resume_url VARCHAR(500),
    linkedin_url VARCHAR(300),
    portfolio_url VARCHAR(300),
    current_company VARCHAR(200),
    current_title VARCHAR(200),
    years_experience INTEGER,
    skills JSONB, -- array of skills
    education JSONB, -- array of education records
    preferences JSONB, -- job preferences
    source VARCHAR(100), -- how they found us
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_posting_id UUID REFERENCES job_postings(id),
    candidate_id UUID REFERENCES candidates(id),
    cover_letter TEXT,
    resume_url VARCHAR(500),
    status application_status DEFAULT 'submitted',
    screening_score INTEGER, -- AI/automated screening score
    screening_notes JSONB,
    referral_source VARCHAR(200),
    referred_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_posting_id, candidate_id)
);

-- Interviews table
CREATE TABLE interviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES applications(id),
    interview_round INTEGER NOT NULL,
    interview_type VARCHAR(50), -- phone, video, onsite, technical
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location VARCHAR(300),
    meeting_link VARCHAR(500),
    status interview_status DEFAULT 'scheduled',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Interview participants table (many-to-many)
CREATE TABLE interview_participants (
    interview_id UUID REFERENCES interviews(id),
    user_id UUID REFERENCES users(id),
    is_interviewer BOOLEAN DEFAULT true,
    PRIMARY KEY (interview_id, user_id)
);

-- Interview feedback table
CREATE TABLE interview_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    interview_id UUID REFERENCES interviews(id),
    interviewer_id UUID REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    technical_skills_rating INTEGER CHECK (technical_skills_rating >= 1 AND technical_skills_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    cultural_fit_rating INTEGER CHECK (cultural_fit_rating >= 1 AND cultural_fit_rating <= 5),
    strengths TEXT,
    weaknesses TEXT,
    notes TEXT,
    recommendation VARCHAR(50), -- strong_hire, hire, no_hire, strong_no_hire
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(interview_id, interviewer_id)
);

-- Offers table
CREATE TABLE offers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES applications(id),
    salary DECIMAL(10, 2) NOT NULL,
    bonus DECIMAL(10, 2),
    equity_shares INTEGER,
    start_date DATE,
    offer_letter_url VARCHAR(500),
    status offer_status DEFAULT 'draft',
    extended_at TIMESTAMP WITH TIME ZONE,
    extended_by UUID REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    negotiation_notes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table for compliance
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_job ON applications(job_posting_id);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_at);
CREATE INDEX idx_interviews_application ON interviews(application_id);
CREATE INDEX idx_job_postings_published ON job_postings(is_published);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- Add update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_requisitions_updated_at BEFORE UPDATE ON job_requisitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_feedback_updated_at BEFORE UPDATE ON interview_feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();