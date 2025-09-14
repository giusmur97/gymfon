import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../utils/auth';
import { protectAdminRoute, protectClientProfileRoute, requirePermission, enableClientFeatures, disableClientFeatures } from '../middleware/rbac';
const router = Router();
const prisma = new PrismaClient();
// Get all clients (admin only)
router.get('/', authenticateToken, ...protectAdminRoute, async (req, res) => {
    try {
        const clients = await prisma.user.findMany({
            where: { role: 'client' },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                hasActiveSessions: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ clients });
    }
    catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get client by ID (admin/staff or own profile)
router.get('/:clientId', authenticateToken, ...protectClientProfileRoute, async (req, res) => {
    try {
        const { clientId } = req.params;
        const currentUser = req.user;
        const client = await prisma.user.findUnique({
            where: { id: clientId },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                hasActiveSessions: true,
                preferences: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        // Check if user can view this client
        if (currentUser.role === 'client' && client.id !== currentUser.id) {
            return res.status(403).json({ error: 'Can only access own profile' });
        }
        res.json({ client });
    }
    catch (error) {
        console.error('Get client error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Add client manually (admin only)
router.post('/add-manual', authenticateToken, requirePermission('canAddClientsManually'), async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({
                error: 'Name and email are required',
                code: 'VALIDATION_ERROR'
            });
        }
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({
                error: 'User with this email already exists',
                code: 'USER_EXISTS'
            });
        }
        // Create client with active sessions enabled
        const client = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: 'oauth', // Will need to set password later
                role: 'client',
                hasActiveSessions: true, // Manually added clients get access
                preferences: {
                    theme: 'system',
                    language: 'en',
                    notifications: {
                        email: true,
                        push: true,
                        marketing: false,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                hasActiveSessions: true,
                createdAt: true,
            },
        });
        res.status(201).json({
            message: 'Client added successfully',
            client,
        });
    }
    catch (error) {
        console.error('Add client error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Enable client features (when sessions are purchased)
router.post('/:clientId/enable-features', authenticateToken, requirePermission('canManageAllClients'), async (req, res) => {
    try {
        const { clientId } = req.params;
        // Verify client exists
        const client = await prisma.user.findUnique({
            where: { id: clientId, role: 'client' },
        });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        await enableClientFeatures(clientId);
        res.json({
            message: 'Client features enabled successfully',
            clientId,
        });
    }
    catch (error) {
        console.error('Enable client features error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Disable client features (when sessions expire)
router.post('/:clientId/disable-features', authenticateToken, requirePermission('canManageAllClients'), async (req, res) => {
    try {
        const { clientId } = req.params;
        // Verify client exists
        const client = await prisma.user.findUnique({
            where: { id: clientId, role: 'client' },
        });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        await disableClientFeatures(clientId);
        res.json({
            message: 'Client features disabled successfully',
            clientId,
        });
    }
    catch (error) {
        console.error('Disable client features error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get client access status
router.get('/:clientId/access-status', authenticateToken, ...protectClientProfileRoute, async (req, res) => {
    try {
        const { clientId } = req.params;
        const currentUser = req.user;
        const client = await prisma.user.findUnique({
            where: { id: clientId },
            select: {
                id: true,
                role: true,
                hasActiveSessions: true,
            },
        });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        // Check if user can view this client's access status
        if (currentUser.role === 'client' && client.id !== currentUser.id) {
            return res.status(403).json({ error: 'Can only access own status' });
        }
        const accessLevel = client.role === 'client'
            ? (client.hasActiveSessions ? 'full' : 'none')
            : 'full';
        res.json({
            clientId: client.id,
            hasActiveSessions: client.hasActiveSessions,
            accessLevel,
            canAccessGestionale: client.role !== 'client' || client.hasActiveSessions,
        });
    }
    catch (error) {
        console.error('Get access status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get user permissions (for frontend to determine UI visibility)
router.get('/me/permissions', authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        const permissions = req.permissions || {};
        const clientPermissions = req.clientPermissions || {};
        const hasGestionaleAccess = req.hasGestionaleAccess || false;
        res.json({
            userId: currentUser.id,
            role: currentUser.role,
            hasActiveSessions: currentUser.hasActiveSessions,
            permissions,
            clientPermissions,
            hasGestionaleAccess,
        });
    }
    catch (error) {
        console.error('Get permissions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
export default router;
// Import validation schemas
import { personalInfoSchema, sportsAnamnesisSchema, physiologicalAnamnesisSchema, pathologicalAnamnesisSchema, nutritionDiarySchema } from '../utils/validation';
// Update client profile section
router.put('/:clientId/profile', authenticateToken, ...protectClientProfileRoute, async (req, res) => {
    try {
        const { clientId } = req.params;
        const currentUser = req.user;
        // Validate input
        const validatedData = clientProfileSchema.parse(req.body);
        // Check if user can edit this client
        if (currentUser.role === 'client' && clientId !== currentUser.id) {
            return res.status(403).json({ error: 'Can only edit own profile' });
        }
        // Check if client exists
        const existingClient = await prisma.user.findUnique({
            where: { id: clientId, role: 'client' },
        });
        if (!existingClient) {
            return res.status(404).json({ error: 'Client not found' });
        }
        // Update client profile
        const updatedClient = await prisma.user.update({
            where: { id: clientId },
            data: {
                preferences: {
                    ...(existingClient.preferences || {}),
                    clientProfile: validatedData,
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                preferences: true,
                updatedAt: true,
            },
        });
        res.json({
            message: 'Client profile updated successfully',
            client: updatedClient,
        });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors,
            });
        }
        console.error('Update client profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get client profile
router.get('/:clientId/profile', authenticateToken, ...protectClientProfileRoute, async (req, res) => {
    try {
        const { clientId } = req.params;
        const currentUser = req.user;
        // Check if user can view this client
        if (currentUser.role === 'client' && clientId !== currentUser.id) {
            return res.status(403).json({ error: 'Can only access own profile' });
        }
        const client = await prisma.user.findUnique({
            where: { id: clientId, role: 'client' },
            select: {
                id: true,
                name: true,
                email: true,
                preferences: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        const clientProfile = client.preferences?.clientProfile || {};
        res.json({
            client: {
                ...client,
                profile: clientProfile,
            },
        });
    }
    catch (error) {
        console.error('Get client profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update specific profile section
router.put('/:clientId/profile/:section', authenticateToken, ...protectClientProfileRoute, async (req, res) => {
    try {
        const { clientId, section } = req.params;
        const currentUser = req.user;
        // Check if user can edit this client
        if (currentUser.role === 'client' && clientId !== currentUser.id) {
            return res.status(403).json({ error: 'Can only edit own profile' });
        }
        // Validate section data based on section type
        let validatedData;
        switch (section) {
            case 'personalInfo':
                validatedData = personalInfoSchema.parse(req.body);
                break;
            case 'sportsHistory':
                validatedData = sportsAnamnesisSchema.parse(req.body);
                break;
            case 'physiologicalHistory':
                validatedData = physiologicalAnamnesisSchema.parse(req.body);
                break;
            case 'pathologicalHistory':
                validatedData = pathologicalAnamnesisSchema.parse(req.body);
                break;
            case 'nutritionDiary':
                validatedData = nutritionDiarySchema.parse(req.body);
                break;
            default:
                return res.status(400).json({ error: 'Invalid profile section' });
        }
        // Get existing client
        const existingClient = await prisma.user.findUnique({
            where: { id: clientId, role: 'client' },
            select: { preferences: true },
        });
        if (!existingClient) {
            return res.status(404).json({ error: 'Client not found' });
        }
        const currentPreferences = existingClient.preferences || {};
        const currentProfile = currentPreferences.clientProfile || {};
        // Update specific section
        const updatedProfile = {
            ...currentProfile,
            [section]: validatedData,
        };
        // Update client
        const updatedClient = await prisma.user.update({
            where: { id: clientId },
            data: {
                preferences: {
                    ...currentPreferences,
                    clientProfile: updatedProfile,
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                preferences: true,
                updatedAt: true,
            },
        });
        res.json({
            message: `${section} updated successfully`,
            section,
            data: validatedData,
            client: updatedClient,
        });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors,
            });
        }
        console.error('Update profile section error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}); // Impor
// Import body measurement validation
import { bodyMeasurementSchema } from '../utils/validation';
// Get client body measurements
router.get('/:clientId/measurements', authenticateToken, ...protectClientProfileRoute, async (req, res) => {
    try {
        const { clientId } = req.params;
        const currentUser = req.user;
        // Check if user can view this client's measurements
        if (currentUser.role === 'client' && clientId !== currentUser.id) {
            return res.status(403).json({ error: 'Can only access own measurements' });
        }
        // For now, store measurements in user preferences until we have the full database schema
        const client = await prisma.user.findUnique({
            where: { id: clientId, role: 'client' },
            select: { preferences: true },
        });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        const measurements = client.preferences?.bodyMeasurements || [];
        // Sort by date (newest first)
        measurements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        res.json({ measurements });
    }
    catch (error) {
        console.error('Get measurements error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Add new body measurement
router.post('/:clientId/measurements', authenticateToken, requirePermission('canManageAllClients'), async (req, res) => {
    try {
        const { clientId } = req.params;
        const currentUser = req.user;
        // Validate input
        const validatedData = bodyMeasurementSchema.parse(req.body);
        // Check if client exists
        const client = await prisma.user.findUnique({
            where: { id: clientId, role: 'client' },
            select: { preferences: true },
        });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        const currentPreferences = client.preferences || {};
        const currentMeasurements = currentPreferences.bodyMeasurements || [];
        // Create new measurement with ID and measurer info
        const newMeasurement = {
            id: `measurement_${Date.now()}`,
            ...validatedData,
            measuredBy: currentUser.id,
            measuredByName: currentUser.name,
            createdAt: new Date().toISOString(),
        };
        // Add to measurements array
        const updatedMeasurements = [newMeasurement, ...currentMeasurements];
        // Update client preferences
        await prisma.user.update({
            where: { id: clientId },
            data: {
                preferences: {
                    ...currentPreferences,
                    bodyMeasurements: updatedMeasurements,
                },
            },
        });
        res.status(201).json({
            message: 'Measurement added successfully',
            measurement: newMeasurement,
        });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors,
            });
        }
        console.error('Add measurement error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update body measurement
router.put('/:clientId/measurements/:measurementId', authenticateToken, requirePermission('canManageAllClients'), async (req, res) => {
    try {
        const { clientId, measurementId } = req.params;
        // Validate input
        const validatedData = bodyMeasurementSchema.parse(req.body);
        // Get client
        const client = await prisma.user.findUnique({
            where: { id: clientId, role: 'client' },
            select: { preferences: true },
        });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        const currentPreferences = client.preferences || {};
        const currentMeasurements = currentPreferences.bodyMeasurements || [];
        // Find and update measurement
        const measurementIndex = currentMeasurements.findIndex((m) => m.id === measurementId);
        if (measurementIndex === -1) {
            return res.status(404).json({ error: 'Measurement not found' });
        }
        const updatedMeasurement = {
            ...currentMeasurements[measurementIndex],
            ...validatedData,
            updatedAt: new Date().toISOString(),
        };
        currentMeasurements[measurementIndex] = updatedMeasurement;
        // Update client preferences
        await prisma.user.update({
            where: { id: clientId },
            data: {
                preferences: {
                    ...currentPreferences,
                    bodyMeasurements: currentMeasurements,
                },
            },
        });
        res.json({
            message: 'Measurement updated successfully',
            measurement: updatedMeasurement,
        });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors,
            });
        }
        console.error('Update measurement error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete body measurement
router.delete('/:clientId/measurements/:measurementId', authenticateToken, requirePermission('canManageAllClients'), async (req, res) => {
    try {
        const { clientId, measurementId } = req.params;
        // Get client
        const client = await prisma.user.findUnique({
            where: { id: clientId, role: 'client' },
            select: { preferences: true },
        });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        const currentPreferences = client.preferences || {};
        const currentMeasurements = currentPreferences.bodyMeasurements || [];
        // Filter out the measurement to delete
        const updatedMeasurements = currentMeasurements.filter((m) => m.id !== measurementId);
        if (updatedMeasurements.length === currentMeasurements.length) {
            return res.status(404).json({ error: 'Measurement not found' });
        }
        // Update client preferences
        await prisma.user.update({
            where: { id: clientId },
            data: {
                preferences: {
                    ...currentPreferences,
                    bodyMeasurements: updatedMeasurements,
                },
            },
        });
        res.json({ message: 'Measurement deleted successfully' });
    }
    catch (error) {
        console.error('Delete measurement error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get measurement analytics/trends
router.get('/:clientId/measurements/analytics', authenticateToken, ...protectClientProfileRoute, async (req, res) => {
    try {
        const { clientId } = req.params;
        const { timeRange = 'year' } = req.query;
        const currentUser = req.user;
        // Check if user can view this client's analytics
        if (currentUser.role === 'client' && clientId !== currentUser.id) {
            return res.status(403).json({ error: 'Can only access own analytics' });
        }
        // Get client measurements
        const client = await prisma.user.findUnique({
            where: { id: clientId, role: 'client' },
            select: { preferences: true },
        });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        const measurements = client.preferences?.bodyMeasurements || [];
        // Filter by time range
        const now = new Date();
        let startDate;
        switch (timeRange) {
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                break;
            case 'year':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            default:
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        }
        const filteredMeasurements = measurements.filter((m) => new Date(m.date) >= startDate).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (filteredMeasurements.length === 0) {
            return res.json({
                analytics: {
                    weightTrend: null,
                    bodyFatTrend: null,
                    circumferencesTrend: {},
                    dataPoints: [],
                },
            });
        }
        // Calculate trends
        const calculateTrend = (field) => {
            const values = filteredMeasurements
                .filter((m) => m[field] != null)
                .map((m) => ({ date: m.date, value: m[field] }));
            if (values.length < 2)
                return null;
            const current = values[values.length - 1].value;
            const previous = values[0].value;
            const change = current - previous;
            const changePercentage = (change / previous) * 100;
            return {
                current,
                previous,
                change,
                changePercentage,
                trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
                dataPoints: values,
            };
        };
        // Calculate circumferences trends
        const circumferencesTrend = {};
        const circumferenceFields = ['chest', 'waist', 'hips', 'thigh', 'arm', 'forearm', 'neck', 'calf'];
        circumferenceFields.forEach(field => {
            const values = filteredMeasurements
                .filter((m) => m.circumferences?.[field] != null)
                .map((m) => ({ date: m.date, value: m.circumferences[field] }));
            if (values.length >= 2) {
                circumferencesTrend[field] = calculateTrend(`circumferences.${field}`);
            }
        });
        const analytics = {
            weightTrend: calculateTrend('weight'),
            bodyFatTrend: calculateTrend('bodyFat'),
            muscleMassTrend: calculateTrend('muscleMass'),
            bodyWaterTrend: calculateTrend('bodyWater'),
            circumferencesTrend,
            totalMeasurements: filteredMeasurements.length,
            timeRange,
            startDate: startDate.toISOString(),
            endDate: now.toISOString(),
        };
        res.json({ analytics });
    }
    catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
