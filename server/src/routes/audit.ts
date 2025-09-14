import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/rbac';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const AuditLogQuerySchema = z.object({
  clientId: z.string().optional(),
  userId: z.string().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50)
});

const AuditLogExportSchema = z.object({
  clientId: z.string().optional(),
  userId: z.string().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  format: z.enum(['json', 'csv', 'excel']).default('json')
});

// Get audit logs with filtering and pagination
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const validatedQuery = AuditLogQuerySchema.parse(req.query);
    
    const where: any = {};
    
    if (validatedQuery.clientId) {
      where.clientId = validatedQuery.clientId;
    }
    
    if (validatedQuery.userId) {
      where.userId = validatedQuery.userId;
    }
    
    if (validatedQuery.action) {
      where.action = {
        contains: validatedQuery.action,
        mode: 'insensitive'
      };
    }
    
    if (validatedQuery.resourceType) {
      where.resourceType = validatedQuery.resourceType;
    }
    
    if (validatedQuery.startDate || validatedQuery.endDate) {
      where.timestamp = {};
      if (validatedQuery.startDate) {
        where.timestamp.gte = validatedQuery.startDate;
      }
      if (validatedQuery.endDate) {
        where.timestamp.lte = validatedQuery.endDate;
      }
    }

    const page = validatedQuery.page || 1;
    const limit = Math.min(validatedQuery.limit || 50, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    const [auditLogs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true
            }
          },
          client: {
            select: {
              firstName: true,
              lastName: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      auditLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get audit logs for a specific client
router.get('/client/:clientId', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { clientId } = req.params;
    const validatedQuery = AuditLogQuerySchema.parse(req.query);

    const where: any = { clientId };
    
    if (validatedQuery.action) {
      where.action = {
        contains: validatedQuery.action,
        mode: 'insensitive'
      };
    }
    
    if (validatedQuery.resourceType) {
      where.resourceType = validatedQuery.resourceType;
    }
    
    if (validatedQuery.startDate || validatedQuery.endDate) {
      where.timestamp = {};
      if (validatedQuery.startDate) {
        where.timestamp.gte = validatedQuery.startDate;
      }
      if (validatedQuery.endDate) {
        where.timestamp.lte = validatedQuery.endDate;
      }
    }

    const page = validatedQuery.page || 1;
    const limit = Math.min(validatedQuery.limit || 50, 100);
    const skip = (page - 1) * limit;

    const [auditLogs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      auditLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching client audit logs:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch client audit logs' });
  }
});

// Get audit log statistics
router.get('/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = {};
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate as string);
      }
    }

    const [
      totalLogs,
      actionStats,
      resourceStats,
      userStats,
      recentActivity
    ] = await Promise.all([
      prisma.auditLog.count({ where }),
      
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10
      }),
      
      prisma.auditLog.groupBy({
        by: ['resourceType'],
        where,
        _count: { resourceType: true },
        orderBy: { _count: { resourceType: 'desc' } },
        take: 10
      }),
      
      prisma.auditLog.groupBy({
        by: ['userId'],
        where,
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10
      }),
      
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true }
          },
          client: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 20
      })
    ]);

    // Get user details for user stats
    const userIds = userStats.map(stat => stat.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, role: true }
    });

    const userStatsWithDetails = userStats.map(stat => ({
      ...stat,
      user: users.find(u => u.id === stat.userId)
    }));

    res.json({
      totalLogs,
      actionStats,
      resourceStats,
      userStats: userStatsWithDetails,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({ error: 'Failed to fetch audit statistics' });
  }
});

// Export audit logs
router.post('/export', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const validatedData = AuditLogExportSchema.parse(req.body);
    
    const where: any = {};
    
    if (validatedData.clientId) {
      where.clientId = validatedData.clientId;
    }
    
    if (validatedData.userId) {
      where.userId = validatedData.userId;
    }
    
    if (validatedData.action) {
      where.action = {
        contains: validatedData.action,
        mode: 'insensitive'
      };
    }
    
    if (validatedData.resourceType) {
      where.resourceType = validatedData.resourceType;
    }
    
    if (validatedData.startDate || validatedData.endDate) {
      where.timestamp = {};
      if (validatedData.startDate) {
        where.timestamp.gte = validatedData.startDate;
      }
      if (validatedData.endDate) {
        where.timestamp.lte = validatedData.endDate;
      }
    }

    const auditLogs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        },
        client: {
          select: {
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Log the export action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'AUDIT_LOGS_EXPORTED',
        resourceType: 'AuditLog',
        resourceId: 'export',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        changes: {
          format: validatedData.format,
          filters: validatedData,
          recordCount: auditLogs.length
        }
      }
    });

    if (validatedData.format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Timestamp',
        'User',
        'User Email',
        'User Role',
        'Action',
        'Resource Type',
        'Resource ID',
        'Client',
        'Client Email',
        'IP Address',
        'User Agent',
        'Changes'
      ];

      const csvRows = auditLogs.map(log => [
        log.timestamp.toISOString(),
        log.user.name,
        log.user.email,
        log.user.role,
        log.action,
        log.resourceType,
        log.resourceId,
        log.client ? `${log.client.firstName} ${log.client.lastName}` : '',
        log.client?.user?.email || '',
        log.ipAddress,
        log.userAgent,
        JSON.stringify(log.changes)
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      // Return JSON format
      const exportData = {
        exportInfo: {
          exportedAt: new Date(),
          exportedBy: req.user!.id,
          format: validatedData.format,
          filters: validatedData,
          recordCount: auditLogs.length
        },
        auditLogs
      };

      res.json(exportData);
    }
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid export parameters', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to export audit logs' });
  }
});

// Get audit log details by ID
router.get('/:logId', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { logId } = req.params;

    const auditLog = await prisma.auditLog.findUnique({
      where: { id: logId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        },
        client: {
          select: {
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    });

    if (!auditLog) {
      return res.status(404).json({ error: 'Audit log not found' });
    }

    res.json(auditLog);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// Utility function to create audit log (can be used by other routes)
export const createAuditLog = async (data: {
  userId: string;
  clientId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  changes?: any;
}) => {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: data.userId,
        clientId: data.clientId,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        changes: data.changes
      }
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
};

export default router;