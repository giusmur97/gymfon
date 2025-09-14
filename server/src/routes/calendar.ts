import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../utils/auth';
import { GoogleCalendarService, getGoogleCalendarService, syncAllTrainerSessions } from '../services/googleCalendar';
import { notificationService } from '../services/notificationService';

const router = express.Router();
const prisma = new PrismaClient();

// Get calendar sessions for trainer
router.get('/sessions', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { startDate, endDate, clientId, status, type } = req.query;
    const trainerId = req.user.id;

    const whereClause: any = {
      trainerId: trainerId
    };

    // Date range filter
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    // Client filter
    if (clientId) {
      whereClause.clientId = clientId;
    }

    // Status filter
    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      whereClause.status = {
        in: statuses
      };
    }

    // Type filter
    if (type) {
      const types = Array.isArray(type) ? type : [type];
      whereClause.type = {
        in: types
      };
    }

    const sessions = await prisma.trainingSession.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Transform sessions for calendar component
    const calendarSessions = sessions.map(session => ({
      id: session.id,
      clientId: session.clientId,
      clientName: session.client.name,
      date: session.date,
      duration: session.duration,
      type: session.type,
      status: session.status,
      location: session.location,
      notes: session.notes,
      meetingLink: session.meetingLink,
      price: session.price
    }));

    res.json(calendarSessions);
  } catch (error) {
    console.error('Error fetching calendar sessions:', error);
    res.status(500).json({ error: 'Failed to fetch calendar sessions' });
  }
});

// Get trainer availability
router.get('/availability', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const trainerId = req.user.id;

    const availability = await prisma.availability.findMany({
      where: {
        trainerId: trainerId
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    res.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Update trainer availability
router.put('/availability', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const trainerId = req.user.id;
    const { availability } = req.body;

    // Delete existing availability
    await prisma.availability.deleteMany({
      where: {
        trainerId: trainerId
      }
    });

    // Create new availability records
    const availabilityRecords = availability.map((slot: any) => ({
      trainerId: trainerId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable
    }));

    await prisma.availability.createMany({
      data: availabilityRecords
    });

    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Create new session
router.post('/sessions', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const trainerId = req.user.id;
    const {
      clientId,
      type,
      date,
      duration,
      location,
      meetingLink,
      notes,
      price
    } = req.body;

    // Validate client exists and has active sessions
    const client = await prisma.user.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    if (!client.hasActiveSessions) {
      return res.status(400).json({ error: 'Client does not have active sessions' });
    }

    // Check for scheduling conflicts
    const conflictingSessions = await prisma.trainingSession.findMany({
      where: {
        trainerId: trainerId,
        date: {
          gte: new Date(date),
          lt: new Date(new Date(date).getTime() + duration * 60000)
        },
        status: {
          in: ['scheduled', 'confirmed']
        }
      }
    });

    if (conflictingSessions.length > 0) {
      return res.status(400).json({ error: 'Time slot conflicts with existing session' });
    }

    const session = await prisma.trainingSession.create({
      data: {
        trainerId,
        clientId,
        type,
        date: new Date(date),
        duration,
        location,
        meetingLink,
        notes,
        price: price || 0,
        status: 'scheduled'
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Sync to Google Calendar if configured
    try {
      const calendarService = await getGoogleCalendarService(trainerId);
      if (calendarService) {
        const user = await prisma.user.findUnique({
          where: { id: trainerId },
          select: { preferences: true }
        });
        const preferences = user?.preferences as any;
        const calendarId = preferences?.googleCalendar?.calendarId || 'primary';
        
        if (preferences?.googleCalendar?.syncEnabled) {
          const eventId = await calendarService.syncTrainingSession(session, calendarId);
          if (eventId) {
            await prisma.trainingSession.update({
              where: { id: session.id },
              data: { googleCalendarEventId: eventId }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error syncing session to Google Calendar:', error);
      // Don't fail the session creation if calendar sync fails
    }

    // Send notification about new session
    try {
      await notificationService.sendSessionUpdateNotification(session.id, 'created');
    } catch (error) {
      console.error('Error sending session creation notification:', error);
      // Don't fail the session creation if notification fails
    }

    // Transform for response
    const calendarSession = {
      id: session.id,
      clientId: session.clientId,
      clientName: session.client.name,
      date: session.date,
      duration: session.duration,
      type: session.type,
      status: session.status,
      location: session.location,
      notes: session.notes,
      meetingLink: session.meetingLink,
      price: session.price
    };

    res.status(201).json(calendarSession);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Update session
router.put('/sessions/:id', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { id } = req.params;
    const trainerId = req.user.id;
    const {
      clientId,
      type,
      date,
      duration,
      location,
      meetingLink,
      notes,
      status,
      price
    } = req.body;

    // Verify session belongs to trainer
    const existingSession = await prisma.trainingSession.findFirst({
      where: {
        id: id,
        trainerId: trainerId
      }
    });

    if (!existingSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check for conflicts if date/time is being changed
    if (date && (new Date(date).getTime() !== existingSession.date.getTime() || duration !== existingSession.duration)) {
      const conflictingSessions = await prisma.trainingSession.findMany({
        where: {
          trainerId: trainerId,
          id: { not: id },
          date: {
            gte: new Date(date),
            lt: new Date(new Date(date).getTime() + (duration || existingSession.duration) * 60000)
          },
          status: {
            in: ['scheduled', 'confirmed']
          }
        }
      });

      if (conflictingSessions.length > 0) {
        return res.status(400).json({ error: 'Time slot conflicts with existing session' });
      }
    }

    const updatedSession = await prisma.trainingSession.update({
      where: { id },
      data: {
        ...(clientId && { clientId }),
        ...(type && { type }),
        ...(date && { date: new Date(date) }),
        ...(duration && { duration }),
        ...(location !== undefined && { location }),
        ...(meetingLink !== undefined && { meetingLink }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
        ...(price !== undefined && { price })
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Sync to Google Calendar if configured
    try {
      const calendarService = await getGoogleCalendarService(trainerId);
      if (calendarService) {
        const user = await prisma.user.findUnique({
          where: { id: trainerId },
          select: { preferences: true }
        });
        const preferences = user?.preferences as any;
        const calendarId = preferences?.googleCalendar?.calendarId || 'primary';
        
        if (preferences?.googleCalendar?.syncEnabled) {
          const eventId = await calendarService.syncTrainingSession(updatedSession, calendarId);
          if (eventId && !updatedSession.googleCalendarEventId) {
            await prisma.trainingSession.update({
              where: { id },
              data: { googleCalendarEventId: eventId }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error syncing updated session to Google Calendar:', error);
      // Don't fail the session update if calendar sync fails
    }

    // Send notification about session update
    try {
      const changes = {
        ...(clientId && { clientId }),
        ...(type && { type }),
        ...(date && { date: new Date(date) }),
        ...(duration && { duration }),
        ...(location !== undefined && { location }),
        ...(meetingLink !== undefined && { meetingLink }),
        ...(notes !== undefined && { notes }),
        ...(status && { status }),
        ...(price !== undefined && { price })
      };
      
      if (Object.keys(changes).length > 0) {
        await notificationService.sendSessionUpdateNotification(id, 'updated', changes);
      }
    } catch (error) {
      console.error('Error sending session update notification:', error);
      // Don't fail the session update if notification fails
    }

    // Transform for response
    const calendarSession = {
      id: updatedSession.id,
      clientId: updatedSession.clientId,
      clientName: updatedSession.client.name,
      date: updatedSession.date,
      duration: updatedSession.duration,
      type: updatedSession.type,
      status: updatedSession.status,
      location: updatedSession.location,
      notes: updatedSession.notes,
      meetingLink: updatedSession.meetingLink,
      price: updatedSession.price
    };

    res.json(calendarSession);
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Delete session
router.delete('/sessions/:id', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { id } = req.params;
    const trainerId = req.user.id;

    // Verify session belongs to trainer
    const existingSession = await prisma.trainingSession.findFirst({
      where: {
        id: id,
        trainerId: trainerId
      }
    });

    if (!existingSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Remove from Google Calendar if synced
    if (existingSession.googleCalendarEventId) {
      try {
        const calendarService = await getGoogleCalendarService(trainerId);
        if (calendarService) {
          const user = await prisma.user.findUnique({
            where: { id: trainerId },
            select: { preferences: true }
          });
          const preferences = user?.preferences as any;
          const calendarId = preferences?.googleCalendar?.calendarId || 'primary';
          
          await calendarService.removeTrainingSession(calendarId, existingSession.googleCalendarEventId);
        }
      } catch (error) {
        console.error('Error removing session from Google Calendar:', error);
        // Continue with deletion even if calendar removal fails
      }
    }

    // Send notification about session cancellation before deletion
    try {
      await notificationService.sendSessionUpdateNotification(id, 'cancelled');
    } catch (error) {
      console.error('Error sending session cancellation notification:', error);
      // Continue with deletion even if notification fails
    }

    await prisma.trainingSession.delete({
      where: { id }
    });

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Get available time slots for booking
router.get('/available-slots', authenticateToken, async (req, res) => {
  try {
    const { trainerId, date, duration = 60 } = req.query;

    if (!trainerId || !date) {
      return res.status(400).json({ error: 'Trainer ID and date are required' });
    }

    const targetDate = new Date(date as string);
    const dayOfWeek = targetDate.getDay();

    // Get trainer availability for the day
    const availability = await prisma.availability.findMany({
      where: {
        trainerId: trainerId as string,
        dayOfWeek: dayOfWeek,
        isAvailable: true
      }
    });

    if (availability.length === 0) {
      return res.json([]);
    }

    // Get existing sessions for the day
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existingSessions = await prisma.trainingSession.findMany({
      where: {
        trainerId: trainerId as string,
        date: {
          gte: dayStart,
          lte: dayEnd
        },
        status: {
          in: ['scheduled', 'confirmed']
        }
      }
    });

    // Calculate available slots
    const availableSlots = [];
    const sessionDuration = parseInt(duration as string);

    for (const slot of availability) {
      const [startHour, startMinute] = slot.startTime.split(':').map(Number);
      const [endHour, endMinute] = slot.endTime.split(':').map(Number);

      const slotStart = new Date(targetDate);
      slotStart.setHours(startHour, startMinute, 0, 0);
      
      const slotEnd = new Date(targetDate);
      slotEnd.setHours(endHour, endMinute, 0, 0);

      // Generate 30-minute intervals within the availability window
      let currentTime = new Date(slotStart);
      
      while (currentTime.getTime() + sessionDuration * 60000 <= slotEnd.getTime()) {
        const sessionEnd = new Date(currentTime.getTime() + sessionDuration * 60000);
        
        // Check if this slot conflicts with existing sessions
        const hasConflict = existingSessions.some(session => {
          const sessionStart = new Date(session.date);
          const sessionEndTime = new Date(session.date.getTime() + session.duration * 60000);
          
          return (
            (currentTime >= sessionStart && currentTime < sessionEndTime) ||
            (sessionEnd > sessionStart && sessionEnd <= sessionEndTime) ||
            (currentTime <= sessionStart && sessionEnd >= sessionEndTime)
          );
        });

        if (!hasConflict) {
          availableSlots.push({
            startTime: currentTime.toISOString(),
            endTime: sessionEnd.toISOString(),
            duration: sessionDuration
          });
        }

        // Move to next 30-minute slot
        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }
    }

    res.json(availableSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

export default router;

// Google Calendar Integration Routes

// Get Google Calendar authorization URL
router.get('/google-calendar/auth-url', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Google Calendar integration not configured' });
    }

    const calendarService = new GoogleCalendarService({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_ORIGIN}/calendar/google-callback`
    });

    const authUrl = calendarService.generateAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google Calendar auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

// Handle Google Calendar OAuth callback
router.post('/google-calendar/callback', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const calendarService = new GoogleCalendarService({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_ORIGIN}/calendar/google-callback`
    });

    const tokens = await calendarService.getTokens(code);

    // Update user preferences with Google Calendar tokens
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    const preferences = (user?.preferences as any) || {};
    preferences.googleCalendar = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      calendarId: 'primary', // Default to primary calendar
      syncEnabled: true,
      lastSyncAt: new Date().toISOString()
    };

    await prisma.user.update({
      where: { id: userId },
      data: { preferences }
    });

    // Perform initial sync
    await syncAllTrainerSessions(userId);

    res.json({ message: 'Google Calendar integration configured successfully' });
  } catch (error) {
    console.error('Error handling Google Calendar callback:', error);
    res.status(500).json({ error: 'Failed to configure Google Calendar integration' });
  }
});

// Get Google Calendar sync status
router.get('/google-calendar/status', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    const preferences = (user?.preferences as any) || {};
    const googleCalendar = preferences.googleCalendar || {};

    res.json({
      isConfigured: !!googleCalendar.refreshToken,
      syncEnabled: googleCalendar.syncEnabled || false,
      calendarId: googleCalendar.calendarId || 'primary',
      lastSyncAt: googleCalendar.lastSyncAt || null
    });
  } catch (error) {
    console.error('Error getting Google Calendar status:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

// Update Google Calendar sync settings
router.put('/google-calendar/settings', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const userId = req.user.id;
    const { syncEnabled, calendarId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    const preferences = (user?.preferences as any) || {};
    
    if (!preferences.googleCalendar?.refreshToken) {
      return res.status(400).json({ error: 'Google Calendar not configured' });
    }

    preferences.googleCalendar = {
      ...preferences.googleCalendar,
      syncEnabled: syncEnabled !== undefined ? syncEnabled : preferences.googleCalendar.syncEnabled,
      calendarId: calendarId || preferences.googleCalendar.calendarId
    };

    await prisma.user.update({
      where: { id: userId },
      data: { preferences }
    });

    res.json({ message: 'Google Calendar settings updated successfully' });
  } catch (error) {
    console.error('Error updating Google Calendar settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Manually trigger sync
router.post('/google-calendar/sync', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    const preferences = (user?.preferences as any) || {};
    
    if (!preferences.googleCalendar?.refreshToken) {
      return res.status(400).json({ error: 'Google Calendar not configured' });
    }

    if (!preferences.googleCalendar?.syncEnabled) {
      return res.status(400).json({ error: 'Google Calendar sync is disabled' });
    }

    await syncAllTrainerSessions(userId);

    // Update last sync time
    preferences.googleCalendar.lastSyncAt = new Date().toISOString();
    await prisma.user.update({
      where: { id: userId },
      data: { preferences }
    });

    res.json({ message: 'Sync completed successfully' });
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error);
    res.status(500).json({ error: 'Failed to sync with Google Calendar' });
  }
});

// Disconnect Google Calendar
router.delete('/google-calendar/disconnect', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    const preferences = (user?.preferences as any) || {};
    delete preferences.googleCalendar;

    await prisma.user.update({
      where: { id: userId },
      data: { preferences }
    });

    // Clear Google Calendar event IDs from sessions
    await prisma.trainingSession.updateMany({
      where: { trainerId: userId },
      data: { googleCalendarEventId: null }
    });

    res.json({ message: 'Google Calendar disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    res.status(500).json({ error: 'Failed to disconnect Google Calendar' });
  }
});