import { z } from 'zod';

// Basic validation schemas
export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const roleSelectionSchema = z.object({
  role: z.enum(['admin', 'staff', 'client']),
});

// Trainer profile schema
export const trainerProfileSchema = z.object({
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(1000, 'Bio too long'),
  certifications: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  hourlyRate: z.number().min(10, 'Hourly rate must be at least $10').max(500, 'Hourly rate must be less than $500').optional(),
});

// Client profile setup schema
export const clientProfileSchema = z.object({
  fitnessGoals: z.array(z.string()).min(1, 'At least one fitness goal is required'),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  preferences: z.object({
    workoutTypes: z.array(z.string()).optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    availableDays: z.array(z.string()).optional(),
  }).optional(),
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RoleSelectionInput = z.infer<typeof roleSelectionSchema>;
export type TrainerProfileInput = z.infer<typeof trainerProfileSchema>;
export type ClientProfileInput = z.infer<typeof clientProfileSchema>;