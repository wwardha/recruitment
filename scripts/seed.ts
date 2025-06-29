#!/usr/bin/env bun

import { createDatabase } from '../src/shared/infrastructure/database';
import { JobsRepository } from '../src/modules/jobs/jobs.repository';
import { JobStatus } from '../src/modules/jobs/jobs.types';
import { env } from '../src/config/environment';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    const db = createDatabase(env.DATABASE_URL);
    const jobsRepo = new JobsRepository(db);
    
    // Check for force flag
    const forceFlag = process.argv.includes('--force');
    
    // Check if data already exists
    const existingJobs = await jobsRepo.findAll();
    if (existingJobs.length > 0 && !forceFlag) {
      console.log(`📋 Database already has ${existingJobs.length} jobs. Skipping seeding.`);
      console.log('💡 Use --force flag to reseed: bun run db:seed --force');
      process.exit(0);
    }
    
    if (forceFlag && existingJobs.length > 0) {
      console.log(`🔄 Force flag detected. Clearing existing ${existingJobs.length} jobs...`);
      // Note: In a real app, you might want to be more selective about what to delete
      for (const job of existingJobs) {
        await jobsRepo.delete(job.id);
      }
      console.log('✅ Existing data cleared.');
    }
    
    // Seed jobs
    const sampleJobs = [
      {
        title: 'Senior Full Stack Developer',
        description: 'We are looking for an experienced full stack developer to join our engineering team. You will work with React, Node.js, and PostgreSQL to build scalable web applications.',
        department: 'Engineering',
        location: 'San Francisco, CA',
        salaryMin: 120000,
        salaryMax: 180000,
        requirements: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        status: JobStatus.PUBLISHED,
        createdBy: 'seed-user',
      },
      {
        title: 'Product Manager',
        description: 'Join our product team to drive the vision and strategy for our HR technology platform. You will work closely with engineering and design teams.',
        department: 'Product',
        location: 'Remote',
        salaryMin: 130000,
        salaryMax: 170000,
        requirements: ['Product Management', 'Agile', 'Data Analysis'],
        status: JobStatus.PUBLISHED,
        createdBy: 'seed-user',
      },
      {
        title: 'UX Designer',
        description: 'We need a talented UX designer to create intuitive and beautiful user experiences for our recruitment platform.',
        department: 'Design',
        location: 'New York, NY',
        salaryMin: 90000,
        salaryMax: 130000,
        requirements: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
        status: JobStatus.DRAFT,
        createdBy: 'seed-user',
      },
    ];
    
    console.log(`📝 Creating ${sampleJobs.length} sample jobs...`);
    
    for (const job of sampleJobs) {
      await jobsRepo.create(job);
      console.log(`  ✅ Created job: ${job.title}`);
    }
    
    console.log('✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
