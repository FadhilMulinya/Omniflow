/**
 * Background Job Service
 * This service handles scheduled and background processing tasks
 */

interface BackgroundJobOptions {
  interval?: number; // in milliseconds
}

export class BackgroundService {
  private jobs: Map<
    string,
    {
      fn: Function;
      interval: number;
      lastRun: number;
      isRunning: boolean;
    }
  > = new Map();

  private timerId: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor() {
    // Start processing on initialization
    this.startProcessing();
  }

  registerJob(jobId: string, fn: Function, options: BackgroundJobOptions = {}) {
    this.jobs.set(jobId, {
      fn,
      interval: options.interval || 60000, // Default to 1 minute
      lastRun: 0,
      isRunning: false,
    });

    console.log(`Registered background job: ${jobId}`);
    return jobId;
  }

  removeJob(jobId: string) {
    if (this.jobs.has(jobId)) {
      this.jobs.delete(jobId);
      console.log(`Removed background job: ${jobId}`);
      return true;
    }
    return false;
  }

  startProcessing() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.timerId = setInterval(() => this.processJobs(), 1000); // Check jobs every second
    console.log('Background job processing started');
  }

  stopProcessing() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isProcessing = false;
    console.log('Background job processing stopped');
  }

  public async processJobs() {
    const now = Date.now();

    for (const [jobId, job] of this.jobs.entries()) {
      // Skip if already running or if it's not time to run yet
      if (job.isRunning || job.lastRun + job.interval > now) {
        continue;
      }

      // Mark as running and update last run time
      job.isRunning = true;
      job.lastRun = now;

      try {
        await Promise.resolve(job.fn());
      } catch (error) {
        console.error(`Error executing background job ${jobId}:`, error);
      } finally {
        job.isRunning = false;
      }
    }
  }
}

// Create and export a singleton instance
export const backgroundService = new BackgroundService();
