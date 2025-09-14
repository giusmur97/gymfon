import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define role permissions
export interface RolePermissions {
  canManageAllClients: boolean;
  canManageWorkouts: boolean;
  canManageNutrition: boolean;
  canManageCalendar: boolean;
  canViewReports: boolean;
  canManageDocuments: boolean;
  canManageGDPR: boolean;
  canAddClientsManually: boolean;
}

// Access control matrix
export const ACCESS_CONTROL_MATRIX: Record<string, RolePermissions> = {
  admin: {
    canManageAllClients: true,
    canManageWorkouts: true,
    canManageNutrition: true,
    canManageCalendar: true,
    canViewReports: true,
    canManageDocuments: true,
    canManageGDPR: true,
    canAddClientsManually: true,
  },
  staff: {
    canManageAllClients: false,
    canManageWorkouts: true,
    canManageNutrition: false,
    canManageCalendar: true,
    canViewReports: false,
    canManageDocuments: false,
    canManageGDPR: false,
    canAddClientsManually: false,
  },
  client: {
    canManageAllClients: false,
    canManageWorkouts: false,
    canManageNutrition: false,
    canManageCalendar: false,
    canViewReports: false,
    canManageDocuments: false,
    canManageGDPR: false,
    canAddClientsManually: false,
  },
};

// Client-specific permissions (only available if hasActiveSessions = true)
export interface ClientPermissions {
  canViewOwnProfile: boolean;
  canEditOwnProfile: boolean;
  canViewOwnWorkouts: boolean;
  canLogWorkouts: boolean;
  canViewOwnNutrition: boolean;
  canViewOwnSessions: boolean;
}

// Extended user interface for middleware
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  hasActiveSessions: boolean;
  avatar?: string;
  preferences?: any;
}

// Middleware to check if user has required role
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthenticatedUser;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole: user.role
      });
    }

    next();
  };
}

// Middleware to check if user has specific permission
export function requirePermission(permission: keyof RolePermissions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthenticatedUser;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const rolePermissions = ACCESS_CONTROL_MATRIX[user.role];
    if (!rolePermissions || !rolePermissions[permission]) {
      return res.status(403).json({ 
        error: `Permission denied: ${permission}`,
        code: 'PERMISSION_DENIED',
        permission,
        userRole: user.role
      });
    }

    next();
  };
}

// Middleware to check if client has active sessions (for gestionale features)
export function requireActiveSessions(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as AuthenticatedUser;
  
  if (!user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  // Admin and staff always have access
  if (user.role === 'admin' || user.role === 'staff') {
    return next();
  }

  // Clients need active sessions
  if (user.role === 'client' && !user.hasActiveSessions) {
    return res.status(403).json({ 
      error: 'Active sessions required to access this feature',
      code: 'ACTIVE_SESSIONS_REQUIRED',
      message: 'Please purchase training sessions to access client management features'
    });
  }

  next();
}

// Middleware to check if user can access client data
export function requireClientAccess(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as AuthenticatedUser;
  const clientId = req.params.clientId || req.body.clientId;
  
  if (!user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  // Admin can access all clients
  if (user.role === 'admin') {
    return next();
  }

  // Staff can access clients but with limited permissions
  if (user.role === 'staff') {
    return next();
  }

  // Clients can only access their own data and only if they have active sessions
  if (user.role === 'client') {
    if (!user.hasActiveSessions) {
      return res.status(403).json({ 
        error: 'Active sessions required',
        code: 'ACTIVE_SESSIONS_REQUIRED'
      });
    }

    if (clientId && clientId !== user.id) {
      return res.status(403).json({ 
        error: 'Can only access own profile',
        code: 'ACCESS_DENIED'
      });
    }
  }

  next();
}

// Utility function to check user permissions
export function hasPermission(user: AuthenticatedUser, permission: keyof RolePermissions): boolean {
  const rolePermissions = ACCESS_CONTROL_MATRIX[user.role];
  return rolePermissions ? rolePermissions[permission] : false;
}

// Utility function to get client permissions
export function getClientPermissions(user: AuthenticatedUser): ClientPermissions {
  const hasActiveSessions = user.hasActiveSessions;
  
  return {
    canViewOwnProfile: hasActiveSessions,
    canEditOwnProfile: false, // Clients cannot edit their own profile
    canViewOwnWorkouts: hasActiveSessions,
    canLogWorkouts: hasActiveSessions,
    canViewOwnNutrition: hasActiveSessions,
    canViewOwnSessions: hasActiveSessions,
  };
}

// Utility function to enable client features (when sessions are purchased)
export async function enableClientFeatures(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { hasActiveSessions: true },
  });
}

// Utility function to disable client features (when sessions expire)
export async function disableClientFeatures(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { hasActiveSessions: false },
  });
}

// Utility function to check if user has access to gestionale features
export async function checkGestionaleAccess(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, hasActiveSessions: true },
  });

  if (!user) return false;

  // Admin and staff always have access
  if (user.role === 'admin' || user.role === 'staff') {
    return true;
  }

  // Clients need active sessions
  if (user.role === 'client') {
    return user.hasActiveSessions;
  }

  return false;
}

// Middleware to add user permissions to request object
export async function addUserPermissions(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as AuthenticatedUser;
  
  if (user) {
    // Add role permissions
    (req as any).permissions = ACCESS_CONTROL_MATRIX[user.role] || {};
    
    // Add client-specific permissions if user is a client
    if (user.role === 'client') {
      (req as any).clientPermissions = getClientPermissions(user);
    }
    
    // Add gestionale access flag
    (req as any).hasGestionaleAccess = await checkGestionaleAccess(user.id);
  }
  
  next();
}

// Route protection for gestionale features
export const protectGestionaleRoute = [
  requireActiveSessions,
  addUserPermissions
];

// Route protection for admin-only features
export const protectAdminRoute = [
  requireRole(['admin']),
  addUserPermissions
];

// Route protection for admin and staff features
export const protectStaffRoute = [
  requireRole(['admin', 'staff']),
  addUserPermissions
];

// Route protection for client profile access
export const protectClientProfileRoute = [
  requireClientAccess,
  addUserPermissions
];