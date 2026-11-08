import { schedule as scheduleJob, validate } from 'node-cron';

export interface CronJob {
  name: string;
  schedule: string;
  run: () => Promise<void>;
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

export const runCron = (jobs: CronJob[]): void => {
  for (const { name, schedule, run } of jobs) {
    if (!validate(schedule)) {
      throw new Error(`Invalid schedule for job ${name}: ${schedule}`);
    }

    let busy = false;
    scheduleJob(schedule, async () => {
      if (busy) {
        return;
      }
      busy = true;
      try {
        await run();
      } catch (error) {
        console.error(`[cron] ${name} failed: ${errorMessage(error)}`);
      } finally {
        busy = false;
      }
    });

    console.log(`[cron] scheduled ${name} (${schedule})`);
  }
};
