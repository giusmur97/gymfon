import express from 'express';
import { authenticateToken } from '../utils/auth';
import { requireRole } from '../middleware/rbac';

const router = express.Router();

// Helper function to combine auth and role checking
const requireAuth = (roles: string[]) => [authenticateToken, requireRole(roles)];

// Temporary simplified endpoints to get server running
router.get('/:clientId', ...requireAuth(['admin', 'staff', 'client']), async (req: express.Request, res: express.Response) => {
  res.json({ success: true, photos: [] });
});

router.post('/upload', ...requireAuth(['admin', 'staff']), async (req: express.Request, res: express.Response) => {
  res.json({ success: true, message: 'Photo upload endpoint - temporarily disabled' });
});

export default router;