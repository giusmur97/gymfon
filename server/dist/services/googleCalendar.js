import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class GoogleCalendarService {
    constructor(config) {
        this.oauth2Client = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri);
        if (config.refreshToken) {
            this.oauth2Client.setCredentials({
                refresh_token: config.refreshToken,
                access_token: config.accessToken
            });
        }
        this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    }
    // Generate OAuth URL for initial setup
    generateAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
        ];
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
    }
    // Exchange authorization code for tokens
    async getTokens(code) {
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);
        return {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token
        };
    }
    // Create calendar event
    async createEvent(calendarId, eventData) {
        try {
            const response = await this.calendar.events.insert({
                calendarId: calendarId,
                resource: eventData
            });
            return response.data.id;
        }
        catch (error) {
            console.error('Error creating Google Calendar event:', error);
            throw new Error('Failed to create calendar event');
        }
    }
    // Update calendar event
    async updateEvent(calendarId, eventId, eventData) {
        try {
            await this.calendar.events.update({
                calendarId: calendarId,
                eventId: eventId,
                resource: eventData
            });
        }
        catch (error) {
            console.error('Error updating Google Calendar event:', error);
            throw new Error('Failed to update calendar event');
        }
    }
    // Delete calendar event
    async deleteEvent(calendarId, eventId) {
        try {
            await this.calendar.events.delete({
                calendarId: calendarId,
                eventId: eventId
            });
        }
        catch (error) {
            console.error('Error deleting Google Calendar event:', error);
            throw new Error('Failed to delete calendar event');
        }
    }
    // Get events from calendar
    async getEvents(calendarId, timeMin, timeMax) {
        try {
            const response = await this.calendar.events.list({
                calendarId: calendarId,
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                singleEvents: true,
                orderBy: 'startTime'
            });
            return response.data.items || [];
        }
        catch (error) {
            console.error('Error fetching Google Calendar events:', error);
            throw new Error('Failed to fetch calendar events');
        }
    }
    // Check for conflicts
    async checkConflicts(calendarId, startTime, endTime, excludeEventId) {
        try {
            const events = await this.getEvents(calendarId, startTime, endTime);
            const conflicts = events.filter(event => {
                if (excludeEventId && event.id === excludeEventId) {
                    return false;
                }
                const eventStart = new Date(event.start.dateTime || event.start.date);
                const eventEnd = new Date(event.end.dateTime || event.end.date);
                return ((startTime >= eventStart && startTime < eventEnd) ||
                    (endTime > eventStart && endTime <= eventEnd) ||
                    (startTime <= eventStart && endTime >= eventEnd));
            });
            return conflicts.length > 0;
        }
        catch (error) {
            console.error('Error checking calendar conflicts:', error);
            return false;
        }
    }
    // Sync training session to Google Calendar
    async syncTrainingSession(session, calendarId) {
        try {
            const startTime = new Date(session.date);
            const endTime = new Date(startTime.getTime() + session.duration * 60000);
            const eventData = {
                summary: `Training Session - ${session.client.name}`,
                description: `
Training Session Details:
- Client: ${session.client.name}
- Type: ${session.type}
- Duration: ${session.duration} minutes
${session.notes ? `- Notes: ${session.notes}` : ''}
${session.location ? `- Location: ${session.location}` : ''}
${session.meetingLink ? `- Meeting Link: ${session.meetingLink}` : ''}
        `.trim(),
                start: {
                    dateTime: startTime.toISOString(),
                    timeZone: 'Europe/Rome' // You might want to make this configurable
                },
                end: {
                    dateTime: endTime.toISOString(),
                    timeZone: 'Europe/Rome'
                },
                location: session.location || undefined,
                attendees: [
                    {
                        email: session.client.email,
                        displayName: session.client.name
                    }
                ]
            };
            if (session.googleCalendarEventId) {
                // Update existing event
                await this.updateEvent(calendarId, session.googleCalendarEventId, eventData);
                return session.googleCalendarEventId;
            }
            else {
                // Create new event
                const eventId = await this.createEvent(calendarId, eventData);
                return eventId;
            }
        }
        catch (error) {
            console.error('Error syncing training session to Google Calendar:', error);
            return null;
        }
    }
    // Remove training session from Google Calendar
    async removeTrainingSession(calendarId, eventId) {
        try {
            await this.deleteEvent(calendarId, eventId);
        }
        catch (error) {
            console.error('Error removing training session from Google Calendar:', error);
            // Don't throw error here as the session might still need to be deleted from our DB
        }
    }
}
// Helper function to get Google Calendar service for a user
export async function getGoogleCalendarService(userId) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                preferences: true
            }
        });
        if (!user?.preferences) {
            return null;
        }
        const preferences = user.preferences;
        const googleCalendarConfig = preferences.googleCalendar;
        if (!googleCalendarConfig?.refreshToken) {
            return null;
        }
        return new GoogleCalendarService({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            redirectUri: process.env.GOOGLE_REDIRECT_URI,
            refreshToken: googleCalendarConfig.refreshToken,
            accessToken: googleCalendarConfig.accessToken
        });
    }
    catch (error) {
        console.error('Error getting Google Calendar service:', error);
        return null;
    }
}
// Sync all trainer sessions to Google Calendar
export async function syncAllTrainerSessions(trainerId) {
    try {
        const calendarService = await getGoogleCalendarService(trainerId);
        if (!calendarService) {
            console.log('Google Calendar not configured for trainer:', trainerId);
            return;
        }
        const user = await prisma.user.findUnique({
            where: { id: trainerId },
            select: {
                preferences: true
            }
        });
        const preferences = user?.preferences;
        const calendarId = preferences?.googleCalendar?.calendarId || 'primary';
        // Get sessions from the last 30 days and next 90 days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 90);
        const sessions = await prisma.trainingSession.findMany({
            where: {
                trainerId: trainerId,
                date: {
                    gte: startDate,
                    lte: endDate
                },
                status: {
                    in: ['scheduled', 'confirmed']
                }
            },
            include: {
                client: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        for (const session of sessions) {
            const eventId = await calendarService.syncTrainingSession(session, calendarId);
            if (eventId && !session.googleCalendarEventId) {
                // Update session with Google Calendar event ID
                await prisma.trainingSession.update({
                    where: { id: session.id },
                    data: { googleCalendarEventId: eventId }
                });
            }
        }
        console.log(`Synced ${sessions.length} sessions to Google Calendar for trainer ${trainerId}`);
    }
    catch (error) {
        console.error('Error syncing trainer sessions to Google Calendar:', error);
    }
}
