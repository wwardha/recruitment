import { z } from 'zod';

// Job status enum
export const JobStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed',
  FILLED: 'filled'
} as const;

export type JobStatus = typeof JobStatus[keyof typeof JobStatus];

// Job type enum (REQUISITION vs POSTING)
export const JobType = {
  REQUISITION: 'requisition',
  POSTING: 'posting'
} as const;

export type JobType = typeof JobType[keyof typeof JobType];

// Zod schemas for validation
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

export const PublishJobSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export type CreateJobInput = z.infer<typeof CreateJobSchema>;
export type UpdateJobInput = z.infer<typeof UpdateJobSchema>;
export type PublishJobInput = z.infer<typeof PublishJobSchema>;