import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// Hash password with bcrypt
export async function hashPassword(password) {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
}
// Verify password with bcrypt
export async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}
// Generate JWT token
export function generateToken(user) {
    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
    };
    return jwt.sign(payload, process.env.JWT_SECRET ?? 'dev', {
        expiresIn: '7d',
        issuer: 'personal-trainer-platform',
        audience: 'personal-trainer-platform-users',
    });
}
// Generate refresh token
export function generateRefreshToken(userId) {
    return jwt.sign({ sub: userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET ?? 'dev-refresh', { expiresIn: '30d' });
}
// Verify JWT token
export function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET ?? 'dev');
    }
    catch (error) {
        throw new Error('Invalid token');
    }
}
// Middleware to authenticate requests
export async function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    try {
        const decoded = verifyToken(token);
        const user = await prisma.user.findUnique({
            where: { id: decoded.sub },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                hasActiveSessions: true,
                avatar: true,
                preferences: true,
            },
        });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}
// Middleware to check user role
export function requireRole(roles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!roles.includes(user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
}
// Check if user profile is complete
export async function checkProfileCompletion(userId, role) {
    if (!role || role === "")
        return false;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            bio: true,
            certifications: true,
            specializations: true,
            hourlyRate: true,
            preferences: true,
        },
    });
    if (!user)
        return false;
    if (role === 'admin' || role === 'staff') {
        // Admin and staff need trainer-like profile completion
        return !!(user.bio && user.certifications?.length && user.specializations?.length && user.hourlyRate);
    }
    else if (role === 'client') {
        const preferences = user.preferences;
        return !!(preferences?.fitnessGoals?.length && preferences?.fitnessLevel);
    }
    return false;
}
