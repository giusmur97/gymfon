import cron from 'node-cron';
import { scheduleSessionReminders } from './notificationService';
export class CronService {
    constructor() {
        this.jobs = new Map();
        this.initializeJobs();
    }
    initializeJobs() {
        // Schedule session reminders to run every 15 minutes
        const reminderJob = cron.schedule('*/15 * * * *', async () => {
            console.log('Running session reminder check...');
            try {
                await scheduleSessionReminders();
            }
            catch (error) {
                console.error('Error in session reminder cron job:', error);
            }
        }, {
            scheduled: false // Don't start immediately
        });
        this.jobs.set('sessionReminders', reminderJob);
        // Schedule cleanup of old notifications (daily at 2 AM)
        const cleanupJob = cron.schedule('0 2 * * *', async () => {
            console.log('Running notification cleanup...');
            try {
                await this.cleanupOldNotifications();
            }
            catch (error) {
                console.error('Error in notification cleanup cron job:', error);
            }
        }, {
            scheduled: false
        });
        this.jobs.set('notificationCleanup', cleanupJob);
    }
    // Start all cron jobs
    start() {
        console.log('Starting cron jobs...');
        this.jobs.forEach((job, name) => {
            job.start();
            console.log(`Started cron job: ${name}`);
        });
    }
    // Stop all cron jobs
    stop() {
        console.log('Stopping cron jobs...');
        this.jobs.forEach((job, name) => {
            job.stop();
            console.log(`Stopped cron job: ${name}`);
        });
    }
    // Start specific job
    startJob(jobName) {
        const job = this.jobs.get(jobName);
        if (job) {
            job.start();
            console.log(`Started cron job: ${jobName}`);
        }
        else {
            console.error(`Cron job not found: ${jobName}`);
        }
    }
    // Stop specific job
    stopJob(jobName) {
        const job = this.jobs.get(jobName);
        if (job) {
            job.stop();
            console.log(`Stopped cron job: ${jobName}`);
        }
        else {
            console.error(`Cron job not found: ${jobName}`);
        }
    }
    // Clean up old notifications (older than 30 days)
    async cleanupOldNotifications() {
        try {
            const { PrismaClient } = await import('@prisma/client');
            const prisma = new PrismaClient();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const result = await prisma.notification.deleteMany({
                where: {
                    createdAt: {
                        lt: thirtyDaysAgo
                    },
                    isRead: true // Only delete read notifications
                }
            });
            console.log(`Cleaned up ${result.count} old notifications`);
            await prisma.$disconnect();
        }
        catch (error) {
            console.error('Error cleaning up old notifications:', error);
        }
    }
    // Get job status
    getJobStatus(jobName) {
        const job = this.jobs.get(jobName);
        return job ? job.running : false;
    }
    // List all jobs
    listJobs() {
        return Array.from(this.jobs.keys());
    }
}
// Singleton instance
export const cronService = new CronService();
