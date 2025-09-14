import { z } from 'zod';
// Password validation schema with strength requirements
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');
// Email validation schema
export const emailSchema = z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase();
// Registration validation schema
export const registerSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters long')
        .max(50, 'Name must be less than 50 characters')
        .trim(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
// Login validation schema
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});
// Role selection schema
export const roleSelectionSchema = z.object({
    role: z.enum(['admin', 'staff', 'client']).refine((val) => val, {
        message: 'Please select a role',
    }),
});
// Trainer profile completion schema
export const trainerProfileSchema = z.object({
    bio: z.string().min(50, 'Bio must be at least 50 characters').max(1000, 'Bio must be less than 1000 characters'),
    certifications: z.array(z.string()).min(1, 'At least one certification is required'),
    specializations: z.array(z.string()).min(1, 'At least one specialization is required'),
    hourlyRate: z.number().min(10, 'Hourly rate must be at least $10').max(500, 'Hourly rate must be less than $500'),
});
// Client profile setup schema
export const clientProfileSchema = z.object({
    fitnessGoals: z.array(z.string()).min(1, 'At least one fitness goal is required'),
    fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    preferences: z.object({
        workoutTypes: z.array(z.string()).optional(),
        dietaryRestrictions: z.array(z.string()).optional(),
        availableDays: z.array(z.number().min(0).max(6)).optional(),
    }).optional(),
});
// Client Profile Management Schemas
export const personalInfoSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    birthDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid birth date'),
    birthPlace: z.string().min(1, 'Birth place is required').max(100, 'Birth place too long'),
    phone: z.string().optional(),
    address: z.string().optional(),
    profession: z.string().optional(),
    generalNotes: z.string().optional(),
});
export const sportsAnamnesisSchema = z.object({
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    activitiesPracticed: z.array(z.string()),
    previousTrainerExperience: z.string().optional(),
    fitnessGoals: z.array(z.string()).min(1, 'At least one fitness goal is required'),
    preferredActivities: z.array(z.string()),
});
export const physiologicalAnamnesisSchema = z.object({
    sleepHours: z.number().min(1).max(24),
    sleepQuality: z.enum(['poor', 'fair', 'good', 'excellent']),
    lifestyle: z.enum(['sedentary', 'moderately_active', 'active', 'very_active']),
    smokingHabits: z.enum(['never', 'former', 'occasional', 'regular']),
    alcoholConsumption: z.enum(['never', 'occasional', 'moderate', 'frequent']),
    waterIntake: z.number().min(0).max(10), // liters per day
    bowelRegularity: z.enum(['regular', 'irregular', 'constipated']),
    menstrualCycle: z.enum(['regular', 'irregular', 'absent']).optional(),
});
export const medicalConditionSchema = z.object({
    name: z.string().min(1, 'Condition name is required'),
    diagnosisDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid diagnosis date'),
    severity: z.enum(['mild', 'moderate', 'severe']),
    isActive: z.boolean(),
    notes: z.string().optional(),
});
export const injurySchema = z.object({
    type: z.string().min(1, 'Injury type is required'),
    date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid injury date'),
    bodyPart: z.string().min(1, 'Body part is required'),
    limitations: z.array(z.string()),
    isResolved: z.boolean(),
});
export const pathologicalAnamnesisSchema = z.object({
    selectedConditions: z.array(z.string()).optional(),
    allergiesText: z.string().optional(),
    intolerancesText: z.string().optional(),
    musculoskeletalIssues: z.array(z.string()).optional(),
    injuriesText: z.string().optional(),
    surgeriesText: z.string().optional(),
    medicationsText: z.string().optional(),
    generalNotes: z.string().optional(),
    declaresNoOtherConditions: z.boolean().optional(),
});
export const nutritionDiarySchema = z.object({
    dietType: z.enum(['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'other']),
    mealsPerDay: z.number().min(1).max(10),
    skippedMeals: z.array(z.string()),
    snackingHabits: z.string().optional(),
    dailyMealDescription: z.string().optional(),
    foodPreferences: z.array(z.string()),
    foodDislikes: z.array(z.string()),
});
export const clientFullProfileSchema = z.object({
    personalInfo: personalInfoSchema.optional(),
    sportsHistory: sportsAnamnesisSchema.optional(),
    physiologicalHistory: physiologicalAnamnesisSchema.optional(),
    pathologicalHistory: pathologicalAnamnesisSchema.optional(),
    nutritionDiary: nutritionDiarySchema.optional(),
});
// Body Measurements Schemas
export const circumferencesSchema = z.object({
    chest: z.number().optional(),
    waist: z.number().optional(),
    hips: z.number().optional(),
    thigh: z.number().optional(),
    arm: z.number().optional(),
    forearm: z.number().optional(),
    neck: z.number().optional(),
    calf: z.number().optional(),
});
export const bodyMeasurementSchema = z.object({
    date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid measurement date'),
    weight: z.number().min(20).max(300).optional(),
    height: z.number().min(100).max(250).optional(),
    bodyFat: z.number().min(0).max(100).optional(),
    muscleMass: z.number().min(0).max(100).optional(),
    bodyWater: z.number().min(0).max(100).optional(),
    circumferences: circumferencesSchema.optional(),
    notes: z.string().optional(),
});
// ================= Additional Schemas for Extended Client Profile =================
// Address details (via, civico, città, provincia)
export const addressSchema = z.object({
    street: z.string().min(1, 'Via/strada richiesta'),
    number: z.string().min(1, 'Numero civico richiesto'),
    city: z.string().min(1, 'Città richiesta'),
    province: z.string().min(1, 'Provincia richiesta'),
    zip: z.string().optional(),
});
// General information (Informazioni Generali)
export const generalInfoSchema = z.object({
    profession: z.string().optional(),
    programManager: z.string().optional(),
    workHoursPerDay: z.number().min(0).max(24).optional(),
    sleepHoursPerNight: z.number().min(0).max(24).optional(),
    isShiftWorker: z.boolean().optional(),
    lifestyle: z.enum(['sedentario', 'dinamico', 'molto_dinamico']).optional(),
    sleepQuality: z.enum(['regolare', 'non_regolare']).optional(),
});
// Training with trainer preferences (Allenamento con Trainer)
export const trainingPreferencesSchema = z.object({
    trainingMode: z.enum(['casa', 'palestra']).optional(),
    ownedEquipmentText: z.string().optional(),
    baseEquipment: z.array(z.enum(['fitball', 'elastico', 'cavigliere', 'manubri', 'corda'])).optional(),
    sessionsPerWeek: z.number().min(0).max(14).optional(),
    maxSessionDurationMinutes: z.number().min(10).max(240).optional(),
    goal: z.enum(['dimagrimento', 'rimodellamento', 'altro']).optional(),
    goalOtherText: z.string().optional(),
    excludeFoodsDeclaration: z.boolean().optional(),
});
// Supplementation (Integrazione)
export const supplementationSchema = z.object({
    usedInPast: z.boolean().optional(),
    currentUse: z.array(z.string()).optional(),
});
// Eligibility / Idoneità
export const eligibilitySchema = z.object({
    type: z.enum(['self_certification', 'medical_certificate']).optional(),
    selfCertificationGiven: z.boolean().optional(),
    medicalCertificateDocumentId: z.string().optional(),
    selfDeclaration: z.object({
        firstName: z.string(),
        lastName: z.string(),
        city: z.string(),
        date: z.string(),
        text: z.string(),
    }).optional(),
});
// Privacy and GDPR consents
export const privacyConsentsSchema = z.object({
    generalPrivacy: z.boolean(), // obbligatorio
    healthData: z.boolean(), // art. 9 dati sensibili
    marketing: z.boolean().optional(),
    medicalSharing: z.boolean().optional(),
    termsAccepted: z.boolean(),
});
// Extended nutrition diary (structured meals)
export const detailedNutritionDiarySchema = nutritionDiarySchema.extend({
    dietRegimen: z.enum(['vegetariano', 'vegano', 'onnivoro', 'altro']).optional(),
    isDietControlled: z.boolean().optional(),
    mealSkippingFrequency: z.enum(['mai', 'raramente', 'spesso']).optional(),
    dislikedFoodsText: z.string().optional(),
    meals: z.object({
        breakfast: z.string().optional(),
        midMorning: z.string().optional(),
        lunch: z.string().optional(),
        afternoonSnack: z.string().optional(),
        dinner: z.string().optional(),
    }).optional(),
});
// Extend full profile to include new sections
export const extendedClientFullProfileSchema = clientFullProfileSchema.extend({
    generalInfo: generalInfoSchema.optional(),
    trainingPreferences: trainingPreferencesSchema.optional(),
    supplementation: supplementationSchema.optional(),
    eligibility: eligibilitySchema.optional(),
    privacyConsents: privacyConsentsSchema.optional(),
    addressDetails: addressSchema.optional(),
    nutritionDiary: detailedNutritionDiarySchema.optional(),
});
