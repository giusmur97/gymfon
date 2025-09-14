import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  sessionReminders: {
    enabled: boolean;
    timeBefore: number; // minutes before session
  };
  sessionUpdates: boolean;
  sessionCancellations: boolean;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class NotificationService {
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Create in-app notification
  async createInAppNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    data?: any
  ): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          data: data || {},
          isRead: false
        }
      });
    } catch (error) {
      console.error('Error creating in-app notification:', error);
    }
  }

  // Send email notification
  async sendEmail(
    to: string,
    template: EmailTemplate,
    fromName?: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: `${fromName || 'Personal Trainer Platform'} <${process.env.SMTP_FROM}>`,
        to,
        subject: template.subject,
        text: template.text,
        html: template.html
      };

      await this.emailTransporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Get user notification preferences
  async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true }
      });

      const preferences = (user?.preferences as any) || {};
      const notifications = preferences.notifications || {};

      return {
        email: notifications.email !== false, // Default to true
        inApp: notifications.inApp !== false, // Default to true
        sessionReminders: {
          enabled: notifications.sessionReminders?.enabled !== false, // Default to true
          timeBefore: notifications.sessionReminders?.timeBefore || 60 // Default 1 hour
        },
        sessionUpdates: notifications.sessionUpdates !== false, // Default to true
        sessionCancellations: notifications.sessionCancellations !== false // Default to true
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        email: true,
        inApp: true,
        sessionReminders: { enabled: true, timeBefore: 60 },
        sessionUpdates: true,
        sessionCancellations: true
      };
    }
  }

  // Send session reminder
  async sendSessionReminder(sessionId: string): Promise<void> {
    try {
      const session = await prisma.trainingSession.findUnique({
        where: { id: sessionId },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          trainer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!session) {
        console.error('Session not found for reminder:', sessionId);
        return;
      }

      // Get notification preferences for both client and trainer
      const clientPrefs = await this.getUserNotificationPreferences(session.clientId);
      const trainerPrefs = await this.getUserNotificationPreferences(session.trainerId);

      const sessionDate = new Date(session.date);
      const formattedDate = sessionDate.toLocaleDateString();
      const formattedTime = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Send reminder to client
      if (clientPrefs.sessionReminders.enabled) {
        const clientTemplate = this.generateSessionReminderTemplate(
          session.client.name,
          session.trainer.name,
          formattedDate,
          formattedTime,
          session.duration,
          session.location,
          session.meetingLink,
          'client'
        );

        // In-app notification
        if (clientPrefs.inApp) {
          await this.createInAppNotification(
            session.clientId,
            'Session Reminder',
            `Your training session with ${session.trainer.name} is starting soon`,
            'session_reminder',
            { sessionId: session.id }
          );
        }

        // Email notification
        if (clientPrefs.email) {
          await this.sendEmail(session.client.email, clientTemplate, session.trainer.name);
        }
      }

      // Send reminder to trainer
      if (trainerPrefs.sessionReminders.enabled) {
        const trainerTemplate = this.generateSessionReminderTemplate(
          session.trainer.name,
          session.client.name,
          formattedDate,
          formattedTime,
          session.duration,
          session.location,
          session.meetingLink,
          'trainer'
        );

        // In-app notification
        if (trainerPrefs.inApp) {
          await this.createInAppNotification(
            session.trainerId,
            'Session Reminder',
            `Your training session with ${session.client.name} is starting soon`,
            'session_reminder',
            { sessionId: session.id }
          );
        }

        // Email notification
        if (trainerPrefs.email) {
          await this.sendEmail(session.trainer.email, trainerTemplate);
        }
      }

      console.log(`Session reminder sent for session ${sessionId}`);
    } catch (error) {
      console.error('Error sending session reminder:', error);
    }
  }

  // Send session update notification
  async sendSessionUpdateNotification(
    sessionId: string,
    updateType: 'created' | 'updated' | 'cancelled',
    changes?: any
  ): Promise<void> {
    try {
      const session = await prisma.trainingSession.findUnique({
        where: { id: sessionId },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          trainer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!session) return;

      const clientPrefs = await this.getUserNotificationPreferences(session.clientId);
      const trainerPrefs = await this.getUserNotificationPreferences(session.trainerId);

      const sessionDate = new Date(session.date);
      const formattedDate = sessionDate.toLocaleDateString();
      const formattedTime = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let title: string;
      let message: string;
      let notificationType: string;

      switch (updateType) {
        case 'created':
          title = 'New Session Scheduled';
          message = `A new training session has been scheduled`;
          notificationType = 'session_created';
          break;
        case 'updated':
          title = 'Session Updated';
          message = `Your training session has been updated`;
          notificationType = 'session_updated';
          break;
        case 'cancelled':
          title = 'Session Cancelled';
          message = `Your training session has been cancelled`;
          notificationType = 'session_cancelled';
          break;
      }

      // Notify client
      if ((updateType === 'cancelled' && clientPrefs.sessionCancellations) || 
          (updateType !== 'cancelled' && clientPrefs.sessionUpdates)) {
        
        if (clientPrefs.inApp) {
          await this.createInAppNotification(
            session.clientId,
            title,
            `${message} with ${session.trainer.name} on ${formattedDate} at ${formattedTime}`,
            notificationType,
            { sessionId: session.id, changes }
          );
        }

        if (clientPrefs.email) {
          const template = this.generateSessionUpdateTemplate(
            session.client.name,
            session.trainer.name,
            formattedDate,
            formattedTime,
            updateType,
            session,
            changes
          );
          await this.sendEmail(session.client.email, template, session.trainer.name);
        }
      }

      // Notify trainer (usually for cancellations or client-initiated changes)
      if (updateType === 'cancelled' && trainerPrefs.sessionCancellations) {
        if (trainerPrefs.inApp) {
          await this.createInAppNotification(
            session.trainerId,
            title,
            `${message} with ${session.client.name} on ${formattedDate} at ${formattedTime}`,
            notificationType,
            { sessionId: session.id, changes }
          );
        }

        if (trainerPrefs.email) {
          const template = this.generateSessionUpdateTemplate(
            session.trainer.name,
            session.client.name,
            formattedDate,
            formattedTime,
            updateType,
            session,
            changes
          );
          await this.sendEmail(session.trainer.email, template);
        }
      }
    } catch (error) {
      console.error('Error sending session update notification:', error);
    }
  }

  // Generate session reminder email template
  private generateSessionReminderTemplate(
    recipientName: string,
    otherPersonName: string,
    date: string,
    time: string,
    duration: number,
    location?: string,
    meetingLink?: string,
    recipientType: 'client' | 'trainer' = 'client'
  ): EmailTemplate {
    const isTrainer = recipientType === 'trainer';
    const sessionWith = isTrainer ? `with ${otherPersonName}` : `with your trainer ${otherPersonName}`;
    
    const subject = `Reminder: Training Session ${sessionWith} Today`;
    
    const text = `
Hi ${recipientName},

This is a reminder that you have a training session ${sessionWith} scheduled for:

Date: ${date}
Time: ${time}
Duration: ${duration} minutes
${location ? `Location: ${location}` : ''}
${meetingLink ? `Meeting Link: ${meetingLink}` : ''}

${isTrainer ? 'Please make sure you\'re prepared for the session.' : 'Please arrive on time and bring any necessary equipment.'}

Best regards,
Personal Trainer Platform
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Session Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Training Session Reminder</h2>
        
        <p>Hi ${recipientName},</p>
        
        <p>This is a reminder that you have a training session ${sessionWith} scheduled for:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Duration:</strong> ${duration} minutes</p>
            ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
            ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
        </div>
        
        <p>${isTrainer ? 'Please make sure you\'re prepared for the session.' : 'Please arrive on time and bring any necessary equipment.'}</p>
        
        <p>Best regards,<br>Personal Trainer Platform</p>
    </div>
</body>
</html>
    `;

    return { subject, text, html };
  }

  // Generate session update email template
  private generateSessionUpdateTemplate(
    recipientName: string,
    otherPersonName: string,
    date: string,
    time: string,
    updateType: 'created' | 'updated' | 'cancelled',
    session: any,
    changes?: any
  ): EmailTemplate {
    let subject: string;
    let actionText: string;

    switch (updateType) {
      case 'created':
        subject = `New Training Session Scheduled with ${otherPersonName}`;
        actionText = 'A new training session has been scheduled';
        break;
      case 'updated':
        subject = `Training Session Updated - ${otherPersonName}`;
        actionText = 'Your training session has been updated';
        break;
      case 'cancelled':
        subject = `Training Session Cancelled - ${otherPersonName}`;
        actionText = 'Your training session has been cancelled';
        break;
    }

    const text = `
Hi ${recipientName},

${actionText} with ${otherPersonName}.

Session Details:
Date: ${date}
Time: ${time}
Duration: ${session.duration} minutes
${session.location ? `Location: ${session.location}` : ''}
${session.meetingLink ? `Meeting Link: ${session.meetingLink}` : ''}
${session.notes ? `Notes: ${session.notes}` : ''}

${updateType === 'cancelled' ? 'If you have any questions, please contact your trainer.' : 'Please make note of any changes.'}

Best regards,
Personal Trainer Platform
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Session ${updateType === 'created' ? 'Scheduled' : updateType === 'updated' ? 'Updated' : 'Cancelled'}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: ${updateType === 'cancelled' ? '#dc2626' : '#2563eb'};">
            Training Session ${updateType === 'created' ? 'Scheduled' : updateType === 'updated' ? 'Updated' : 'Cancelled'}
        </h2>
        
        <p>Hi ${recipientName},</p>
        
        <p>${actionText} with ${otherPersonName}.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Session Details:</h3>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Duration:</strong> ${session.duration} minutes</p>
            ${session.location ? `<p><strong>Location:</strong> ${session.location}</p>` : ''}
            ${session.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${session.meetingLink}">${session.meetingLink}</a></p>` : ''}
            ${session.notes ? `<p><strong>Notes:</strong> ${session.notes}</p>` : ''}
        </div>
        
        <p>${updateType === 'cancelled' ? 'If you have any questions, please contact your trainer.' : 'Please make note of any changes.'}</p>
        
        <p>Best regards,<br>Personal Trainer Platform</p>
    </div>
</body>
</html>
    `;

    return { subject, text, html };
  }
}

// Singleton instance
export const notificationService = new NotificationService();

// Schedule session reminders
export async function scheduleSessionReminders(): Promise<void> {
  try {
    // Find sessions that need reminders (within the next 2 hours)
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const upcomingSessions = await prisma.trainingSession.findMany({
      where: {
        date: {
          gte: now,
          lte: twoHoursFromNow
        },
        status: {
          in: ['scheduled', 'confirmed']
        }
      },
      include: {
        client: {
          select: {
            id: true,
            preferences: true
          }
        },
        trainer: {
          select: {
            id: true,
            preferences: true
          }
        }
      }
    });

    for (const session of upcomingSessions) {
      // Check if we should send reminder based on user preferences
      const clientPrefs = await notificationService.getUserNotificationPreferences(session.clientId);
      const trainerPrefs = await notificationService.getUserNotificationPreferences(session.trainerId);

      const sessionTime = new Date(session.date);
      const timeDiff = sessionTime.getTime() - now.getTime();
      const minutesUntilSession = Math.floor(timeDiff / (1000 * 60));

      // Send reminder if within the specified time window
      if (clientPrefs.sessionReminders.enabled && minutesUntilSession <= clientPrefs.sessionReminders.timeBefore) {
        await notificationService.sendSessionReminder(session.id);
      }
    }

    console.log(`Processed ${upcomingSessions.length} upcoming sessions for reminders`);
  } catch (error) {
    console.error('Error scheduling session reminders:', error);
  }
}