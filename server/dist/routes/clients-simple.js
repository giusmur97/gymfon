import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../utils/auth';
import { personalInfoSchema, sportsAnamnesisSchema, physiologicalAnamnesisSchema, pathologicalAnamnesisSchema, detailedNutritionDiarySchema, generalInfoSchema, trainingPreferencesSchema, supplementationSchema, eligibilitySchema, privacyConsentsSchema, extendedClientFullProfileSchema, } from '../utils/validation';
const router = Router();
const prisma = new PrismaClient();
// Get all clients (admin only)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        if (currentUser.role !== 'admin' && currentUser.role !== 'staff') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const clients = await prisma.user.findMany({
            where: { role: 'client' },
            select: {
                id: true,
                name: true,
                email: true,
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
// Create client manually (admin or staff)
const addManualSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
});
router.post('/add-manual', authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        if (currentUser.role !== 'admin' && currentUser.role !== 'staff') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const parsed = addManualSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
        }
        const { name, email } = parsed.data;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        const client = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: 'oauth',
                role: 'client',
                hasActiveSessions: true,
                preferences: {
                    theme: 'system',
                    language: 'it',
                    notifications: { email: true, push: true, marketing: false },
                },
            },
            select: { id: true, name: true, email: true, role: true, hasActiveSessions: true, createdAt: true },
        });
        return res.status(201).json({ message: 'Client added successfully', client });
    }
    catch (error) {
        console.error('Add manual client error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Get client by ID
router.get('/:clientId', authenticateToken, async (req, res) => {
    try {
        const { clientId } = req.params;
        const currentUser = req.user;
        const client = await prisma.user.findUnique({
            where: { id: clientId },
            select: {
                id: true,
                name: true,
                email: true,
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
export default router;
// ================= User Permissions =================
router.get('/me/permissions', authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        const permissions = {
            role: currentUser.role,
            userId: currentUser.id,
            hasActiveSessions: currentUser.hasActiveSessions,
            hasGestionaleAccess: currentUser.hasActiveSessions || currentUser.role === 'admin' || currentUser.role === 'staff',
            permissions: {
                canManageWorkouts: currentUser.role === 'admin' || currentUser.role === 'staff',
                canManageClients: currentUser.role === 'admin' || currentUser.role === 'staff',
                canViewAnalytics: currentUser.role === 'admin',
                canManageSystem: currentUser.role === 'admin',
            },
            clientPermissions: currentUser.role === 'client' ? {
                canEditProfile: currentUser.hasActiveSessions,
                canViewProgress: currentUser.hasActiveSessions,
                canBookSessions: currentUser.hasActiveSessions,
            } : null,
        };
        return res.json(permissions);
    }
    catch (error) {
        console.error('Get permissions error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// ================= Client Profile (Modular Sections) =================
// Get full client profile (JSON stored in user.preferences.clientProfile)
router.get('/:clientId/profile', authenticateToken, async (req, res) => {
    try {
        const { clientId } = req.params;
        const client = await prisma.user.findUnique({
            where: { id: clientId, role: 'client' },
            select: { id: true, name: true, email: true, preferences: true, updatedAt: true },
        });
        if (!client)
            return res.status(404).json({ error: 'Client not found' });
        const profile = (client.preferences || {}).clientProfile || {};
        return res.json({ client: { ...client, profile } });
    }
    catch (error) {
        console.error('Get client profile error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Update basic client info (admin or staff)
const updateBasicSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
});
router.patch('/:clientId/basic', authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        if (currentUser.role !== 'admin' && currentUser.role !== 'staff') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const { clientId } = req.params;
        const parsed = updateBasicSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
        }
        const data = {};
        if (parsed.data.name)
            data.name = parsed.data.name;
        if (parsed.data.email) {
            // Check unique email
            const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
            if (exists && exists.id !== clientId) {
                return res.status(400).json({ error: 'Email already in use' });
            }
            data.email = parsed.data.email;
        }
        const updated = await prisma.user.update({
            where: { id: clientId, role: 'client' },
            data,
            select: { id: true, name: true, email: true, updatedAt: true }
        });
        return res.json({ message: 'Client updated', client: updated });
    }
    catch (error) {
        console.error('Update basic client error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Update specific profile section
router.put('/:clientId/profile/:section', authenticateToken, async (req, res) => {
    try {
        const { clientId, section } = req.params;
        // Validate input by section
        let validated;
        switch (section) {
            case 'personalInfo':
                validated = personalInfoSchema.parse(req.body);
                break;
            case 'generalInfo':
                validated = generalInfoSchema.parse(req.body);
                break;
            case 'sportsHistory':
                validated = sportsAnamnesisSchema.parse(req.body);
                break;
            case 'physiologicalHistory':
                validated = physiologicalAnamnesisSchema.parse(req.body);
                break;
            case 'pathologicalHistory':
                validated = pathologicalAnamnesisSchema.parse(req.body);
                break;
            case 'nutritionDiary':
                validated = detailedNutritionDiarySchema.parse(req.body);
                break;
            case 'trainingPreferences':
                validated = trainingPreferencesSchema.parse(req.body);
                break;
            case 'supplementation':
                validated = supplementationSchema.parse(req.body);
                break;
            case 'eligibility':
                validated = eligibilitySchema.parse(req.body);
                break;
            case 'privacyConsents':
                validated = privacyConsentsSchema.parse(req.body);
                break;
            default:
                return res.status(400).json({ error: 'Invalid profile section' });
        }
        const client = await prisma.user.findUnique({
            where: { id: clientId, role: 'client' },
            select: { preferences: true },
        });
        if (!client)
            return res.status(404).json({ error: 'Client not found' });
        const prefs = client.preferences || {};
        const profile = prefs.clientProfile || {};
        const updatedProfile = { ...profile, [section]: validated };
        const updated = await prisma.user.update({
            where: { id: clientId },
            data: { preferences: { ...prefs, clientProfile: updatedProfile } },
            select: { id: true, email: true, name: true, preferences: true, updatedAt: true },
        });
        return res.json({ message: 'Section updated', client: updated });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        console.error('Update profile section error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Save full profile (upsert of multiple sections at once)
router.put('/:clientId/profile', authenticateToken, async (req, res) => {
    try {
        const { clientId } = req.params;
        const validated = extendedClientFullProfileSchema.parse(req.body);
        const client = await prisma.user.findUnique({
            where: { id: clientId, role: 'client' },
            select: { preferences: true },
        });
        if (!client)
            return res.status(404).json({ error: 'Client not found' });
        const prefs = client.preferences || {};
        const profile = prefs.clientProfile || {};
        const updatedProfile = { ...profile, ...validated };
        const updated = await prisma.user.update({
            where: { id: clientId },
            data: { preferences: { ...prefs, clientProfile: updatedProfile } },
            select: { id: true, email: true, name: true, preferences: true, updatedAt: true },
        });
        return res.json({ message: 'Profile updated', client: updated });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        console.error('Update full profile error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// Export full profile as JSON
router.get('/:clientId/profile-export', authenticateToken, async (req, res) => {
    try {
        const { clientId } = req.params;
        const client = await prisma.user.findUnique({
            where: { id: clientId, role: 'client' },
            select: { id: true, name: true, email: true, preferences: true },
        });
        if (!client)
            return res.status(404).json({ error: 'Client not found' });
        const profile = (client.preferences || {}).clientProfile || {};
        const payload = { id: client.id, name: client.name, email: client.email, profile };
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="client_${client.id}_profile.json"`);
        return res.status(200).send(JSON.stringify(payload, null, 2));
    }
    catch (error) {
        console.error('Export profile error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
