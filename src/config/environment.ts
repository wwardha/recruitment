import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z
    .string()
    .default('postgresql://postgres:postgres@localhost:5432/hr_recruitment'),
  
  // Authentication
  JWT_SECRET: z.string().default('your-super-secret-jwt-key-change-this-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // Email
  EMAIL_PROVIDER: z.enum(['sendgrid', 'ses', 'smtp']).default('sendgrid'),
  SENDGRID_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@hr-recruitment.com'),
  
  // File storage
  STORAGE_PROVIDER: z.enum(['local', 's3', 'r2']).default('local'),
  UPLOAD_PATH: z.string().default('./uploads'),
  
  // Redis
  REDIS_URL: z.string().optional(),
  
  // Feature flags
  ENABLE_AI_MATCHING: z.coerce.boolean().default(false),
  ENABLE_VIDEO_INTERVIEWS: z.coerce.boolean().default(false),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3001,http://localhost:3000'),

  // Rate limiting
  RATE_LIMIT_WINDOW: z.string().default('15m'),
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_FORMAT: z.enum(['pretty', 'json']).default('pretty'),
});

export type Environment = z.infer<typeof envSchema>;

export function loadEnvironment(): Environment {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment configuration:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

// Export parsed environment
export const env = loadEnvironment();

// Environment helpers
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';