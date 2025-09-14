const fs = require('fs');
const path = require('path');

console.log('🚀 Creando versione deploy...');

// Crea una versione semplificata del server
const serverCode = `
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "gymfonty-api", time: new Date().toISOString() });
});

// Auth routes
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
      requiresOnboarding: true
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Client routes
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'client' },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    res.json({ clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/clients/add-manual', async (req, res) => {
  try {
    const { name, email } = req.body;
    
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
    
    res.status(201).json({ message: 'Client added successfully', client });
  } catch (error) {
    console.error('Add manual client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/clients/:id/basic', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    const client = await prisma.user.update({
      where: { id },
      data: { name, email },
      select: { id: true, name: true, email: true, updatedAt: true }
    });
    
    res.json({ message: 'Client updated', client });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/clients/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, hasActiveSessions: true, profile: true }
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({ client });
  } catch (error) {
    console.error('Get client profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/clients/:id/profile-export', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, profile: true }
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Export client profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/clients/me/permissions', async (req, res) => {
  try {
    const permissions = {
      role: 'admin',
      userId: 'admin-id',
      hasActiveSessions: true,
      hasGestionaleAccess: true,
      permissions: {
        canManageWorkouts: true,
        canManageClients: true,
        canViewAnalytics: true,
        canManageSystem: true,
      },
      clientPermissions: null,
    };
    
    res.json(permissions);
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard routes
app.get('/api/dashboard/admin/analytics-test', async (req, res) => {
  try {
    const stats = {
      totalUsers: 150,
      totalClients: 120,
      totalTrainers: 15,
      activeSubscriptions: 95,
      monthlyRevenue: 12500,
      sessionsThisMonth: 340,
      coursesEnrolled: 45,
      gdprRequests: 3,
    };
    
    const metrics = {
      dailyActiveUsers: [
        { date: '2024-01-01', count: 25 },
        { date: '2024-01-02', count: 32 },
        { date: '2024-01-03', count: 28 },
      ],
      popularFeatures: [
        { feature: 'Workout Tracking', usage: 85 },
        { feature: 'Nutrition Planning', usage: 72 },
        { feature: 'Progress Photos', usage: 68 },
      ],
      userGrowth: [
        { month: '2024-01', users: 120 },
        { month: '2024-02', users: 135 },
        { month: '2024-03', users: 150 },
      ],
    };
    
    res.json({ stats, metrics });
  } catch (error) {
    console.error('Get admin analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(\`Gym Fonty API listening on http://localhost:\${port}\`);
});
`;

// Scrivi il file del server
fs.writeFileSync(path.join(__dirname, 'dist', 'index.js'), serverCode);

console.log('✅ Server deploy creato in dist/index.js');
console.log('📋 Prossimi passi:');
console.log('1. Push del codice su GitHub');
console.log('2. Deploy su Railway/DigitalOcean');
console.log('3. Configurare le variabili d\'ambiente');
console.log('4. Deploy del frontend su Vercel');
