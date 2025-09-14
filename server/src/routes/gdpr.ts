import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/rbac';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const ConsentSchema = z.object({
  clientId: z.string(),
  type: z.enum(['general_privacy', 'health_data', 'marketing', 'medical_sharing']),
  isGranted: z.boolean(),
  method: z.enum(['digital_signature', 'checkbox', 'verbal', 'paper']),
  version: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional()
});

const ConsentWithdrawalSchema = z.object({
  consentId: z.string(),
  reason: z.string().optional()
});

const DataExportRequestSchema = z.object({
  clientId: z.string(),
  format: z.enum(['json', 'xml', 'pdf']).default('json')
});

// Get all consents for a client
router.get('/consents/:clientId', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { clientId } = req.params;

    const consents = await prisma.gDPRConsent.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(consents);
  } catch (error) {
    console.error('Error fetching consents:', error);
    res.status(500).json({ error: 'Failed to fetch consents' });
  }
});

// Create or update consent
router.post('/consents', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const validatedData = ConsentSchema.parse(req.body);
    const userId = req.user?.id;

    // Check if consent already exists
    const existingConsent = await prisma.gDPRConsent.findFirst({
      where: {
        clientId: validatedData.clientId,
        type: validatedData.type,
        version: validatedData.version
      }
    });

    let consent;

    if (existingConsent) {
      // Update existing consent
      consent = await prisma.gDPRConsent.update({
        where: { id: existingConsent.id },
        data: {
          isGranted: validatedData.isGranted,
          grantedAt: validatedData.isGranted ? new Date() : null,
          revokedAt: !validatedData.isGranted ? new Date() : null,
          method: validatedData.method,
          ipAddress: validatedData.ipAddress,
          userAgent: validatedData.userAgent
        }
      });
    } else {
      // Create new consent
      consent = await prisma.gDPRConsent.create({
        data: {
          clientId: validatedData.clientId,
          type: validatedData.type,
          isGranted: validatedData.isGranted,
          grantedAt: validatedData.isGranted ? new Date() : null,
          revokedAt: !validatedData.isGranted ? new Date() : null,
          method: validatedData.method,
          version: validatedData.version,
          ipAddress: validatedData.ipAddress,
          userAgent: validatedData.userAgent
        }
      });
    }

    // Log the consent action
    await prisma.auditLog.create({
      data: {
        userId: userId!,
        clientId: validatedData.clientId,
        action: existingConsent ? 'CONSENT_UPDATED' : 'CONSENT_CREATED',
        resourceType: 'GDPRConsent',
        resourceId: consent.id,
        ipAddress: validatedData.ipAddress || req.ip,
        userAgent: validatedData.userAgent || req.get('User-Agent') || '',
        changes: {
          type: validatedData.type,
          isGranted: validatedData.isGranted,
          method: validatedData.method,
          version: validatedData.version
        }
      }
    });

    res.json(consent);
  } catch (error) {
    console.error('Error creating/updating consent:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create/update consent' });
  }
});

// Withdraw consent
router.post('/consents/withdraw', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const validatedData = ConsentWithdrawalSchema.parse(req.body);
    const userId = req.user?.id;

    const consent = await prisma.gDPRConsent.update({
      where: { id: validatedData.consentId },
      data: {
        isGranted: false,
        revokedAt: new Date()
      }
    });

    // Log the withdrawal
    await prisma.auditLog.create({
      data: {
        userId: userId!,
        clientId: consent.clientId,
        action: 'CONSENT_WITHDRAWN',
        resourceType: 'GDPRConsent',
        resourceId: consent.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        changes: {
          reason: validatedData.reason,
          revokedAt: consent.revokedAt
        }
      }
    });

    res.json(consent);
  } catch (error) {
    console.error('Error withdrawing consent:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to withdraw consent' });
  }
});

// Get consent status summary for a client
router.get('/consents/:clientId/status', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { clientId } = req.params;

    const consents = await prisma.gDPRConsent.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' }
    });

    // Get the latest consent for each type
    const consentStatus = {
      general_privacy: null,
      health_data: null,
      marketing: null,
      medical_sharing: null
    };

    consents.forEach(consent => {
      if (!consentStatus[consent.type as keyof typeof consentStatus]) {
        consentStatus[consent.type as keyof typeof consentStatus] = consent;
      }
    });

    // Check if all required consents are granted
    const requiredConsents = ['general_privacy', 'health_data'];
    const hasAllRequiredConsents = requiredConsents.every(type => {
      const consent = consentStatus[type as keyof typeof consentStatus];
      return consent && consent.isGranted;
    });

    res.json({
      consents: consentStatus,
      hasAllRequiredConsents,
      lastUpdated: consents[0]?.updatedAt || null
    });
  } catch (error) {
    console.error('Error fetching consent status:', error);
    res.status(500).json({ error: 'Failed to fetch consent status' });
  }
});

// Request data export for GDPR compliance
router.post('/data-export', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const validatedData = DataExportRequestSchema.parse(req.body);
    const userId = req.user?.id;

    // Get all client data
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: validatedData.clientId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        bodyMeasurements: {
          include: {
            measurer: {
              select: { name: true, email: true }
            }
          }
        },
        photos: {
          include: {
            uploader: {
              select: { name: true, email: true }
            }
          }
        },
        documents: {
          include: {
            uploader: {
              select: { name: true, email: true }
            }
          }
        },
        gdprConsents: true,
        auditLogs: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    if (!clientProfile) {
      return res.status(404).json({ error: 'Client profile not found' });
    }

    // Get additional user data
    const [workoutPlans, nutritionPlans, trainingSessions] = await Promise.all([
      prisma.workoutPlan.findMany({
        where: { clientId: validatedData.clientId },
        include: {
          trainer: { select: { name: true, email: true } },
          workouts: {
            include: {
              exercises: true
            }
          }
        }
      }),
      prisma.nutritionPlan.findMany({
        where: { clientId: validatedData.clientId },
        include: {
          trainer: { select: { name: true, email: true } }
        }
      }),
      prisma.trainingSession.findMany({
        where: { clientId: validatedData.clientId },
        include: {
          trainer: { select: { name: true, email: true } }
        }
      })
    ]);

    const exportData = {
      exportInfo: {
        requestedAt: new Date(),
        requestedBy: userId,
        format: validatedData.format,
        clientId: validatedData.clientId
      },
      personalData: {
        profile: clientProfile,
        workoutPlans,
        nutritionPlans,
        trainingSessions
      },
      gdprInfo: {
        consents: clientProfile.gdprConsents,
        auditTrail: clientProfile.auditLogs
      }
    };

    // Log the export request
    await prisma.auditLog.create({
      data: {
        userId: userId!,
        clientId: validatedData.clientId,
        action: 'DATA_EXPORT_REQUESTED',
        resourceType: 'ClientProfile',
        resourceId: clientProfile.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        changes: {
          format: validatedData.format,
          exportedDataTypes: ['profile', 'measurements', 'photos', 'documents', 'workouts', 'nutrition', 'sessions', 'consents', 'audit_logs']
        }
      }
    });

    res.json(exportData);
  } catch (error) {
    console.error('Error exporting data:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Delete client data (GDPR right to be forgotten)
router.delete('/data/:clientId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { clientId } = req.params;
    const userId = req.user?.id;

    // First, log the deletion request
    await prisma.auditLog.create({
      data: {
        userId: userId!,
        clientId,
        action: 'DATA_DELETION_REQUESTED',
        resourceType: 'ClientProfile',
        resourceId: clientId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        changes: {
          reason: 'GDPR_RIGHT_TO_BE_FORGOTTEN'
        }
      }
    });

    // Delete in correct order to handle foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete audit logs
      await tx.auditLog.deleteMany({ where: { clientId } });
      
      // Delete GDPR consents
      await tx.gDPRConsent.deleteMany({ where: { clientId } });
      
      // Delete documents
      await tx.clientDocument.deleteMany({ where: { clientId } });
      
      // Delete photos
      await tx.clientPhoto.deleteMany({ where: { clientId } });
      
      // Delete body measurements
      await tx.bodyMeasurement.deleteMany({ where: { clientId } });
      
      // Delete training sessions
      await tx.trainingSession.deleteMany({ where: { clientId } });
      
      // Delete nutrition plans
      await tx.nutritionPlan.deleteMany({ where: { clientId } });
      
      // Delete workout plans and related data
      const workoutPlans = await tx.workoutPlan.findMany({ where: { clientId } });
      for (const plan of workoutPlans) {
        const workouts = await tx.workout.findMany({ where: { workoutPlanId: plan.id } });
        for (const workout of workouts) {
          await tx.exercise.deleteMany({ where: { workoutId: workout.id } });
        }
        await tx.workout.deleteMany({ where: { workoutPlanId: plan.id } });
      }
      await tx.workoutPlan.deleteMany({ where: { clientId } });
      
      // Delete client profile
      await tx.clientProfile.delete({ where: { userId: clientId } });
      
      // Anonymize user account (keep for referential integrity but remove personal data)
      await tx.user.update({
        where: { id: clientId },
        data: {
          name: 'DELETED_USER',
          email: `deleted_${Date.now()}@example.com`,
          passwordHash: 'DELETED',
          bio: null,
          avatar: null,
          preferences: null,
          addresses: null,
          nutritionalPreferences: null
        }
      });
    });

    res.json({ message: 'Client data successfully deleted' });
  } catch (error) {
    console.error('Error deleting client data:', error);
    res.status(500).json({ error: 'Failed to delete client data' });
  }
});

export default router;