import * as express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../utils/auth';
const router = express.Router();
const prisma = new PrismaClient();
// Test endpoint without auth
router.get('/test', async (req, res) => {
    res.json({ message: 'Dashboard API is working!' });
});
// Temporary endpoint without auth for testing
router.get('/admin/analytics-test', async (req, res) => {
    try {
        const { timeRange = '30d' } = req.query;
        // Calculate date range
        const now = new Date();
        let startDate;
        switch (timeRange) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        // Get platform statistics
        const [totalUsers, totalClients, totalTrainers, activeSubscriptions, monthlyRevenue, sessionsThisMonth, coursesEnrolled, gdprRequests] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'client' } }),
            prisma.user.count({ where: { role: 'staff' } }),
            prisma.user.count({ where: { role: 'client' } }), // Assuming all clients have active subscriptions
            (await prisma.user.count({ where: { role: 'client' } })) * 50, // Mock revenue calculation
            prisma.auditLog.count({
                where: {
                    action: 'SESSION_COMPLETED',
                    timestamp: { gte: startDate }
                }
            }),
            prisma.auditLog.count({
                where: {
                    action: 'COURSE_ENROLLED',
                    timestamp: { gte: startDate }
                }
            }),
            prisma.auditLog.count({
                where: {
                    action: 'GDPR_REQUEST',
                    timestamp: { gte: startDate }
                }
            })
        ]);
        // Get daily active users for the time range
        const dailyActiveUsers = await prisma.auditLog.groupBy({
            by: ['timestamp'],
            where: {
                timestamp: { gte: startDate },
                action: { in: ['LOGIN', 'SESSION_STARTED', 'WORKOUT_COMPLETED'] }
            },
            _count: { userId: true },
            orderBy: { timestamp: 'asc' }
        });
        // Get popular features (based on audit logs)
        const popularFeatures = await prisma.auditLog.groupBy({
            by: ['resourceType'],
            where: {
                timestamp: { gte: startDate }
            },
            _count: { resourceType: true },
            orderBy: { _count: { resourceType: 'desc' } },
            take: 5
        });
        // Get user growth (monthly)
        const userGrowth = await prisma.user.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: { gte: new Date(now.getFullYear(), 0, 1) }
            },
            _count: { id: true },
            orderBy: { createdAt: 'asc' }
        });
        const stats = {
            totalUsers,
            totalClients,
            totalTrainers,
            activeSubscriptions,
            monthlyRevenue,
            sessionsThisMonth,
            coursesEnrolled,
            gdprRequests
        };
        const metrics = {
            dailyActiveUsers: dailyActiveUsers.map(item => ({
                date: item.timestamp.toISOString().split('T')[0],
                count: item._count.userId
            })),
            popularFeatures: popularFeatures.map(item => ({
                feature: item.resourceType,
                usage: item._count.resourceType
            })),
            userGrowth: userGrowth.map(item => ({
                month: item.createdAt.toLocaleDateString('it-IT', { month: 'short' }),
                users: item._count.id
            }))
        };
        res.json({ stats, metrics });
    }
    catch (error) {
        console.error('Error fetching admin analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});
// Admin Analytics
router.get('/admin/analytics', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const { timeRange = '30d' } = req.query;
        // Calculate date range
        const now = new Date();
        let startDate;
        switch (timeRange) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        // Get platform statistics
        const [totalUsers, totalClients, totalTrainers, activeSubscriptions, monthlyRevenue, sessionsThisMonth, coursesEnrolled, gdprRequests] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'client' } }),
            prisma.user.count({ where: { role: 'staff' } }),
            prisma.user.count({ where: { role: 'client' } }), // Assuming all clients have active subscriptions
            (await prisma.user.count({ where: { role: 'client' } })) * 50, // Mock revenue calculation
            prisma.auditLog.count({
                where: {
                    action: 'SESSION_COMPLETED',
                    timestamp: { gte: startDate }
                }
            }),
            prisma.auditLog.count({
                where: {
                    action: 'COURSE_ENROLLED',
                    timestamp: { gte: startDate }
                }
            }),
            prisma.auditLog.count({
                where: {
                    action: 'GDPR_REQUEST',
                    timestamp: { gte: startDate }
                }
            })
        ]);
        // Get daily active users for the time range
        const dailyActiveUsers = await prisma.auditLog.groupBy({
            by: ['timestamp'],
            where: {
                timestamp: { gte: startDate },
                action: { in: ['LOGIN', 'SESSION_STARTED', 'WORKOUT_COMPLETED'] }
            },
            _count: { userId: true },
            orderBy: { timestamp: 'asc' }
        });
        // Get popular features (based on audit logs)
        const popularFeatures = await prisma.auditLog.groupBy({
            by: ['resourceType'],
            where: {
                timestamp: { gte: startDate }
            },
            _count: { resourceType: true },
            orderBy: { _count: { resourceType: 'desc' } },
            take: 5
        });
        // Get user growth (monthly)
        const userGrowth = await prisma.user.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: { gte: new Date(now.getFullYear(), 0, 1) }
            },
            _count: { id: true },
            orderBy: { createdAt: 'asc' }
        });
        const stats = {
            totalUsers,
            totalClients,
            totalTrainers,
            activeSubscriptions,
            monthlyRevenue,
            sessionsThisMonth,
            coursesEnrolled,
            gdprRequests
        };
        const metrics = {
            dailyActiveUsers: dailyActiveUsers.map(item => ({
                date: item.timestamp.toISOString().split('T')[0],
                count: item._count.userId
            })),
            popularFeatures: popularFeatures.map(item => ({
                feature: item.resourceType,
                usage: item._count.resourceType
            })),
            userGrowth: userGrowth.map(item => ({
                month: item.createdAt.toLocaleDateString('it-IT', { month: 'short' }),
                users: item._count.id
            }))
        };
        res.json({ stats, metrics });
    }
    catch (error) {
        console.error('Error fetching admin analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});
// Trainer Dashboard
router.get('/trainer/overview', authenticateToken, requireRole(['staff']), async (req, res) => {
    try {
        const currentUser = req.user;
        // Get trainer statistics
        const [totalClients, activeWorkoutPlans, upcomingSessions, monthlyRevenue, completedSessions, activeCourses] = await Promise.all([
            prisma.user.count({ where: { role: 'client' } }), // All clients for now
            prisma.auditLog.count({
                where: {
                    action: 'WORKOUT_PLAN_CREATED',
                    userId: currentUser.id
                }
            }),
            prisma.auditLog.count({
                where: {
                    action: 'SESSION_SCHEDULED',
                    userId: currentUser.id,
                    timestamp: { gte: new Date() }
                }
            }),
            (await prisma.user.count({ where: { role: 'client' } })) * 25, // Mock revenue
            prisma.auditLog.count({
                where: {
                    action: 'SESSION_COMPLETED',
                    userId: currentUser.id
                }
            }),
            prisma.auditLog.count({
                where: {
                    action: 'COURSE_CREATED',
                    userId: currentUser.id
                }
            })
        ]);
        // Get recent activities
        const recentActivities = await prisma.auditLog.findMany({
            where: {
                userId: currentUser.id
            },
            include: {
                client: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { timestamp: 'desc' },
            take: 10
        });
        const stats = {
            totalClients,
            activeWorkoutPlans,
            upcomingSessions,
            monthlyRevenue,
            completedSessions,
            activeCourses
        };
        const activities = recentActivities.map(activity => ({
            id: activity.id,
            type: activity.action.toLowerCase().includes('session') ? 'session' :
                activity.action.toLowerCase().includes('workout') ? 'workout' :
                    activity.action.toLowerCase().includes('client') ? 'client' : 'course',
            title: activity.action.replace(/_/g, ' ').toLowerCase(),
            description: activity.details || 'No description available',
            timestamp: activity.timestamp,
            clientName: activity.client ? `${activity.client.firstName} ${activity.client.lastName}` : undefined
        }));
        res.json({ stats, activities });
    }
    catch (error) {
        console.error('Error fetching trainer overview:', error);
        res.status(500).json({ error: 'Failed to fetch trainer data' });
    }
});
// Client Management
router.get('/admin/clients', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;
        const where = { role: 'client' };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (status && status !== 'all') {
            where.status = status;
        }
        const clients = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                preferences: true
            },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
        });
        const totalClients = await prisma.user.count({ where });
        // Get additional data for each client
        const clientsWithDetails = await Promise.all(clients.map(async (client) => {
            const preferences = client.preferences;
            // Get recent activities
            const recentActivities = await prisma.auditLog.findMany({
                where: { clientId: client.id },
                orderBy: { timestamp: 'desc' },
                take: 5
            });
            const workoutsCompleted = recentActivities.filter(a => a.action === 'WORKOUT_COMPLETED').length;
            const adherenceRate = recentActivities.length > 0 ?
                (workoutsCompleted / recentActivities.length) * 100 : 0;
            return {
                id: client.id,
                name: client.name,
                email: client.email,
                joinDate: client.createdAt,
                status: 'active', // Default status
                currentPrograms: {
                    workout: preferences?.currentWorkoutPlan || 'Nessun piano attivo',
                    nutrition: preferences?.currentNutritionPlan || 'Nessun piano attivo'
                },
                nextSession: null, // Would need session management
                progress: {
                    workoutsCompleted,
                    adherenceRate: Math.round(adherenceRate)
                }
            };
        }));
        res.json({
            clients: clientsWithDetails,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: totalClients,
                pages: Math.ceil(totalClients / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
});
// Client Dashboard
router.get('/client/overview', authenticateToken, requireRole(['client']), async (req, res) => {
    try {
        const currentUser = req.user;
        const preferences = currentUser.preferences;
        // Get current programs
        const currentPrograms = [
            {
                id: '1',
                type: 'workout',
                title: preferences?.currentWorkoutPlan || 'Nessun piano attivo',
                description: 'Piano di allenamento personalizzato',
                progress: preferences?.workoutProgress || 0,
                trainer: 'Marco Trainer' // Would need trainer assignment
            },
            {
                id: '2',
                type: 'nutrition',
                title: preferences?.currentNutritionPlan || 'Nessun piano attivo',
                description: 'Piano nutrizionale personalizzato',
                progress: preferences?.nutritionProgress || 0,
                trainer: 'Marco Trainer'
            }
        ];
        // Get upcoming sessions (mock for now)
        const upcomingSessions = [
            {
                id: '1',
                type: 'personal_training',
                title: 'Allenamento Personalizzato',
                date: new Date(Date.now() + 24 * 60 * 60 * 1000),
                trainer: 'Marco Trainer',
                location: 'Palestra'
            }
        ];
        // Get achievements
        const achievements = await prisma.auditLog.findMany({
            where: {
                clientId: currentUser.id,
                action: 'MILESTONE_ACHIEVED'
            },
            orderBy: { timestamp: 'desc' },
            take: 5
        });
        const achievementsList = achievements.map(achievement => ({
            id: achievement.id,
            title: achievement.details || 'Obiettivo raggiunto',
            description: 'Hai completato un obiettivo importante!',
            date: achievement.timestamp,
            type: 'milestone'
        }));
        res.json({
            currentPrograms,
            upcomingSessions,
            achievements: achievementsList
        });
    }
    catch (error) {
        console.error('Error fetching client overview:', error);
        res.status(500).json({ error: 'Failed to fetch client data' });
    }
});
// System Settings
router.get('/admin/settings', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        // Get system settings from database or return defaults
        const settings = {
            platformName: 'Gym Fonty',
            maintenanceMode: false,
            registrationEnabled: true,
            maxUsers: 1000,
            sessionTimeout: 30,
            gdprCompliance: true
        };
        res.json(settings);
    }
    catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});
// Update System Settings
router.put('/admin/settings', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const { platformName, maintenanceMode, registrationEnabled, maxUsers, sessionTimeout, gdprCompliance } = req.body;
        // Update settings in database (would need a settings table)
        // For now, just return success
        res.json({ message: 'Settings updated successfully' });
    }
    catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});
export default router;
