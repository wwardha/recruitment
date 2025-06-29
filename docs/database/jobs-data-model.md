# Jobs Data Model Documentation

## Overview

The Jobs module is the core component of the HR Recruitment System, handling job postings, management, and the foundation for candidate applications. This document provides comprehensive documentation of the jobs data model, schema, validation rules, and business logic.

## Database Schema

### Jobs Table

The `jobs` table stores all job-related information with the following structure:

```sql
CREATE TABLE jobs (
  id TEXT PRIMARY KEY NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  department VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  salary_min INTEGER,
  salary_max INTEGER,
  requirements JSON,
  status VARCHAR(20) DEFAULT 'draft' NOT NULL,
  job_type VARCHAR(20) DEFAULT 'posting' NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Field Definitions

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY, NOT NULL | Unique identifier using CUID2 format |
| `title` | VARCHAR(255) | NOT NULL, Min 5 chars | Job title/position name |
| `description` | TEXT | NOT NULL, Min 50 chars | Detailed job description |
| `department` | VARCHAR(100) | NOT NULL | Department/team name |
| `location` | VARCHAR(255) | OPTIONAL | Job location (office/remote/hybrid) |
| `salary_min` | INTEGER | OPTIONAL, > 0 | Minimum salary range |
| `salary_max` | INTEGER | OPTIONAL, > 0 | Maximum salary range |
| `requirements` | JSON | OPTIONAL | Array of required skills/qualifications |
| `status` | VARCHAR(20) | NOT NULL, ENUM | Current job status |
| `job_type` | VARCHAR(20) | NOT NULL, ENUM | Job type classification |
| `created_by` | TEXT | NOT NULL | User ID who created the job |
| `created_at` | TIMESTAMP | NOT NULL, AUTO | Record creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, AUTO | Last update timestamp |

## Enums and Constants

### JobStatus Enum

```typescript
export const JobStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed',
  FILLED: 'filled'
} as const;
```

**Status Workflow:**
- `DRAFT` → Initial state, not visible to candidates
- `PUBLISHED` → Live job posting, accepting applications
- `CLOSED` → No longer accepting applications
- `FILLED` → Position has been filled

### JobType Enum

```typescript
export const JobType = {
  REQUISITION: 'requisition',
  POSTING: 'posting'
} as const;
```

**Type Classification:**
- `REQUISITION` → Internal hiring request/justification
- `POSTING` → External job advertisement (default)

*Note: Currently all jobs default to 'posting'. The jobType field is prepared for future enhancement to separate internal requisitions from external postings.*

## TypeScript Types

### Core Types

```typescript
// Database record type (inferred from schema)
export type Job = typeof jobs.$inferSelect;

// Create input type (excludes auto-generated fields)
export type NewJob = typeof jobs.$inferInsert;

// API input types
export type CreateJobInput = z.infer<typeof CreateJobSchema>;
export type UpdateJobInput = z.infer<typeof UpdateJobSchema>;
export type PublishJobInput = z.infer<typeof PublishJobSchema>;
```

### Example Job Record

```typescript
const exampleJob: Job = {
  id: "cm1a2b3c4d5e6f7g8h9i0j1k",
  title: "Senior Full Stack Developer",
  description: "We are looking for an experienced full stack developer...",
  department: "Engineering",
  location: "San Francisco, CA",
  salaryMin: 120000,
  salaryMax: 180000,
  requirements: ["React", "Node.js", "TypeScript", "PostgreSQL"],
  status: "published",
  jobType: "posting",
  createdBy: "user_12345",
  createdAt: new Date("2024-01-15T10:00:00Z"),
  updatedAt: new Date("2024-01-15T10:00:00Z")
};
```

## Validation Rules

### Input Validation (Zod Schemas)

#### CreateJobSchema

```typescript
export const CreateJobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().optional(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  requirements: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMin <= data.salaryMax;
  }
  return true;
}, {
  message: 'Minimum salary cannot be greater than maximum salary',
});
```

#### UpdateJobSchema

```typescript
export const UpdateJobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').optional(),
  description: z.string().min(50, 'Description must be at least 50 characters').optional(),
  department: z.string().min(1, 'Department is required').optional(),
  location: z.string().optional(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  requirements: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMin <= data.salaryMax;
  }
  return true;
}, {
  message: 'Minimum salary cannot be greater than maximum salary',
});
```

### Business Rules

1. **Salary Validation**: If both min and max salaries are provided, min must be ≤ max
2. **Status Transitions**: Only draft jobs can be published
3. **Required Fields**: title, description, department, and createdBy are mandatory
4. **ID Generation**: Uses CUID2 for collision-resistant unique identifiers
5. **Timestamps**: Automatically managed by database (createdAt, updatedAt)

## Repository Operations

### JobsRepository Methods

```typescript
class JobsRepository {
  // Create new job
  async create(data: Omit<NewJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job>
  
  // Find job by ID
  async findById(id: string): Promise<Job | null>
  
  // Find all jobs with optional filtering
  async findAll(filters?: {
    status?: JobStatus;
    department?: string;
    createdBy?: string;
  }): Promise<Job[]>
  
  // Update existing job
  async update(id: string, data: Partial<Omit<Job, 'id' | 'createdAt'>>): Promise<Job | null>
  
  // Delete job
  async delete(id: string): Promise<boolean>
  
  // Find published jobs only
  async findPublished(): Promise<Job[]>
}
```

## Service Layer

### JobsService Methods

```typescript
class JobsService {
  // Create new job with event publishing
  async createJob(data: CreateJobInput, createdBy: string): Promise<Job>
  
  // Get single job
  async getJob(id: string): Promise<Job | null>
  
  // List jobs with filtering
  async listJobs(filters?: FilterOptions): Promise<Job[]>
  
  // Update job
  async updateJob(id: string, data: UpdateJobInput): Promise<Job | null>
  
  // Publish draft job
  async publishJob(id: string): Promise<Job>
  
  // Check if job accepts applications
  async isJobOpen(id: string): Promise<boolean>
  
  // Get published jobs for candidates
  async getPublishedJobs(): Promise<Job[]>
}
```

### Event Publishing

The service publishes events for integration with other modules:

- **job.created**: When a new job is created
- **job.published**: When a job is published
- **job.updated**: When a job is modified

## API Endpoints

### RESTful API Structure

```
POST   /api/v1/jobs          - Create new job
GET    /api/v1/jobs          - List jobs (with filtering)
GET    /api/v1/jobs/:id      - Get specific job
PUT    /api/v1/jobs/:id      - Update job
DELETE /api/v1/jobs/:id      - Delete job
POST   /api/v1/jobs/:id/publish - Publish job
```

### Query Parameters

```typescript
// GET /api/v1/jobs?status=published&department=Engineering
interface JobQueryParams {
  status?: JobStatus;
  department?: string;
  createdBy?: string;
}
```

## Future Enhancements

### Planned Schema Evolution

The current schema is designed to support future enhancements:

1. **Requisition/Posting Separation**: The `jobType` field prepares for splitting into:
   - `job_requisitions` table (internal hiring requests)
   - `job_postings` table (external advertisements)

2. **Additional Fields**: Schema can be extended with:
   - `employmentType` (full-time, part-time, contract)
   - `remoteType` (remote, hybrid, on-site)
   - `benefits` (JSON array)
   - `publishedAt`, `expiresAt` timestamps
   - `approvedBy`, `approvedAt` for approval workflow

3. **Relationships**: Foreign keys to:
   - `departments` table
   - `users` table for proper referential integrity

## Migration Strategy

For future schema changes, follow the **Parallel Tables & Gradual Migration** approach:

1. Create new tables alongside existing
2. Build new application logic
3. Migrate data gradually
4. Switch traffic to new schema
5. Remove old tables

This ensures zero downtime and safe rollback capability.

## Testing

### Test Coverage

- **Unit Tests**: Repository and service layer methods
- **Integration Tests**: API endpoints and database operations
- **Validation Tests**: Zod schema validation
- **Business Logic Tests**: Status transitions and rules

### Sample Test Data

```typescript
const testJob = {
  title: "Software Engineer",
  description: "Join our team to build amazing software solutions...",
  department: "Engineering",
  location: "Remote",
  salaryMin: 80000,
  salaryMax: 120000,
  requirements: ["JavaScript", "React", "Node.js"]
};
```

## Security Considerations

1. **Input Validation**: All inputs validated with Zod schemas
2. **SQL Injection**: Prevented by using Drizzle ORM parameterized queries
3. **Authorization**: Jobs protected by authentication middleware
4. **Data Sanitization**: Requirements stored as JSON array (not raw text)

## Performance Considerations

1. **Indexing**: Primary key (id) and status fields indexed
2. **Pagination**: Implemented for large job lists
3. **Filtering**: Optimized queries with proper WHERE clauses
4. **Caching**: Consider Redis for frequently accessed published jobs

---

*This documentation covers the complete jobs data model as implemented in the HR Recruitment System. For API usage examples, see the Swagger documentation at `/swagger`.*