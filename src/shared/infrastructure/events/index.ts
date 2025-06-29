import { EventEmitter } from 'events';

export interface DomainEvent {
  type: string;
  payload: any;
  metadata: {
    timestamp: Date;
    correlationId: string;
    userId?: string;
  };
}

export class EventBus extends EventEmitter {
  publish(event: string, payload: any): void {
    console.log(`[EventBus] Publishing event: ${event}`, payload);
    this.emit(event, payload);
  }

  subscribe(event: string, handler: (payload: any) => void): void {
    console.log(`[EventBus] Subscribing to event: ${event}`);
    this.on(event, handler);
  }

  unsubscribe(event: string, handler: (payload: any) => void): void {
    this.off(event, handler);
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Event type constants
export const EventTypes = {
  // Job events
  JOB_CREATED: 'job.created',
  JOB_UPDATED: 'job.updated',
  JOB_PUBLISHED: 'job.published',
  JOB_CLOSED: 'job.closed',
  JOB_DELETED: 'job.deleted',
  
  // Candidate events
  CANDIDATE_REGISTERED: 'candidate.registered',
  CANDIDATE_UPDATED: 'candidate.updated',
  
  // Application events
  APPLICATION_SUBMITTED: 'application.submitted',
  APPLICATION_UPDATED: 'application.updated',
  APPLICATION_WITHDRAWN: 'application.withdrawn',
} as const;
