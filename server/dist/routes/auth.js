import { Router } from "express";
import passport from "passport";
import { PrismaClient } from "@prisma/client";
import { registerSchema, loginSchema, roleSelectionSchema, trainerProfileSchema, clientProfileSchema } from "../utils/validation-simple";
import { hashPassword, verifyPassword, generateToken, authenticateToken, checkProfileCompletion } from "../utils/auth";
const router = Router();
const prisma = new PrismaClient();
function issueJwt(user) {
    const token = generateToken(user);
    return token;
}
async function successHandler(req, res) {
    const user = req.user;
    const token = issueJwt(user);
    // Check if user needs to complete profile setup
    const hasRole = user.role && user.role !== "";
    const isProfileComplete = hasRole ? await checkProfileCompletion(user.id, user.role) : false;
    let redirectUrl;
    if (!hasRole) {
        // Redirect to role selection
        redirectUrl = `${process.env.FRONTEND_ORIGIN ?? "http://localhost:3000"}/onboarding/role?token=${token}`;
    }
    else if (!isProfileComplete) {
        // Redirect to profile completion
        const profileType = (user.role === 'admin' || user.role === 'staff') ? 'trainer' : 'client';
        redirectUrl = `${process.env.FRONTEND_ORIGIN ?? "http://localhost:3000"}/onboarding/${profileType}?token=${token}`;
    }
    else {
        // Redirect to appropriate dashboard
        const dashboardType = user.role === 'client' ? 'client' : 'trainer';
        redirectUrl = `${process.env.FRONTEND_ORIGIN ?? "http://localhost:3000"}/dashboard/${dashboardType}?token=${token}`;
    }
    res.redirect(302, redirectUrl);
}
// Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/auth/failed" }), successHandler);
// Facebook
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"], session: false }));
router.get("/facebook/callback", passport.authenticate("facebook", { session: false, failureRedirect: "/auth/failed" }), successHandler);
// Apple
router.get("/apple", passport.authenticate("apple", { scope: ["name", "email"], session: false }));
router.post("/apple/callback", passport.authenticate("apple", { session: false, failureRedirect: "/auth/failed" }), successHandler);
router.get("/failed", (_req, res) => res.status(401).json({ error: "OAuth failed" }));
// Standard Email/Password Registration
router.post("/register", async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (existingUser) {
            return res.status(400).json({
                error: "User already exists",
                field: "email"
            });
        }
        // Hash password
        const hashedPassword = await hashPassword(validatedData.password);
        // Create user
        const user = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                passwordHash: hashedPassword,
                role: "client", // Default role, can be changed during onboarding
                preferences: {
                    theme: "system",
                    language: "en",
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
                avatar: true,
            },
        });
        // Generate token
        const token = generateToken(user);
        res.status(201).json({
            message: "Registration successful",
            user,
            token,
            requiresOnboarding: true,
        });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: "Validation failed",
                details: error.errors,
            });
        }
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Standard Email/Password Login
router.post("/login", async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                passwordHash: true,
            },
        });
        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password",
                field: "email"
            });
        }
        // Check if this is an OAuth user
        if (user.passwordHash === "oauth") {
            return res.status(400).json({
                error: "This account uses social login. Please sign in with Google, Facebook, or Apple.",
                field: "email"
            });
        }
        // Verify password
        const isValidPassword = await verifyPassword(validatedData.password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({
                error: "Invalid email or password",
                field: "password"
            });
        }
        // Check profile completion
        const isProfileComplete = await checkProfileCompletion(user.id, user.role);
        // Generate token
        const token = generateToken(user);
        // Remove password hash from response
        const { passwordHash, ...userResponse } = user;
        res.json({
            message: "Login successful",
            user: userResponse,
            token,
            requiresOnboarding: !user.role || !isProfileComplete,
        });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: "Validation failed",
                details: error.errors,
            });
        }
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get current user profile
router.get("/me", authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        const user = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                bio: true,
                certifications: true,
                specializations: true,
                hourlyRate: true,
                preferences: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const isProfileComplete = await checkProfileCompletion(user.id, user.role);
        res.json({
            user,
            requiresOnboarding: !user.role || !isProfileComplete,
        });
    }
    catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Logout (client-side token removal, but we can blacklist tokens in future)
router.post("/logout", authenticateToken, (req, res) => {
    res.json({ message: "Logout successful" });
});
// Role Selection (for OAuth users or role changes)
router.post("/select-role", authenticateToken, async (req, res) => {
    try {
        const validatedData = roleSelectionSchema.parse(req.body);
        const currentUser = req.user;
        // Update user role
        const user = await prisma.user.update({
            where: { id: currentUser.id },
            data: { role: validatedData.role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
            },
        });
        // Generate new token with updated role
        const token = generateToken(user);
        res.json({
            message: "Role selected successfully",
            user,
            token,
            nextStep: "profile-completion",
        });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: "Validation failed",
                details: error.errors,
            });
        }
        console.error("Role selection error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Trainer Profile Completion (for admin, staff, and trainer roles)
router.post("/complete-trainer-profile", authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        // Check if user is admin, staff, or trainer
        if (!['admin', 'staff', 'trainer'].includes(currentUser.role)) {
            return res.status(403).json({ error: "Only admin, staff, or trainers can complete trainer profile" });
        }
        const validatedData = trainerProfileSchema.parse(req.body);
        // Update trainer profile
        const user = await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                bio: validatedData.bio,
                certifications: validatedData.certifications,
                specializations: validatedData.specializations,
                hourlyRate: validatedData.hourlyRate,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                bio: true,
                certifications: true,
                specializations: true,
                hourlyRate: true,
            },
        });
        res.json({
            message: "Trainer profile completed successfully",
            user,
            profileComplete: true,
        });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: "Validation failed",
                details: error.errors,
            });
        }
        console.error("Trainer profile completion error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Client Profile Setup
router.post("/complete-client-profile", authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        // Check if user is a client
        if (currentUser.role !== 'client') {
            return res.status(403).json({ error: "Only clients can complete client profile" });
        }
        const validatedData = clientProfileSchema.parse(req.body);
        // Get current preferences or create new ones
        const existingUser = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: { preferences: true },
        });
        const currentPreferences = existingUser?.preferences || {};
        // Update client profile with fitness goals and preferences
        const updatedPreferences = {
            ...currentPreferences,
            fitnessGoals: validatedData.fitnessGoals,
            fitnessLevel: validatedData.fitnessLevel,
            workoutTypes: validatedData.preferences?.workoutTypes || [],
            dietaryRestrictions: validatedData.preferences?.dietaryRestrictions || [],
            availableDays: validatedData.preferences?.availableDays || [],
        };
        const user = await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                preferences: updatedPreferences,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                preferences: true,
            },
        });
        res.json({
            message: "Client profile completed successfully",
            user,
            profileComplete: true,
        });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: "Validation failed",
                details: error.errors,
            });
        }
        console.error("Client profile completion error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get onboarding status
router.get("/onboarding-status", authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        const user = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: {
                id: true,
                role: true,
                bio: true,
                certifications: true,
                specializations: true,
                hourlyRate: true,
                preferences: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const hasRole = !!user.role && user.role !== ""; // Check if role has been set
        const isProfileComplete = await checkProfileCompletion(user.id, user.role);
        let nextStep = null;
        if (!hasRole) {
            nextStep = "role-selection";
        }
        else if (!isProfileComplete) {
            nextStep = (user.role === 'admin' || user.role === 'staff' || user.role === 'trainer') ? "trainer-profile" : "client-profile";
        }
        res.json({
            hasRole,
            isProfileComplete,
            nextStep,
            currentRole: user.role,
        });
    }
    catch (error) {
        console.error("Onboarding status error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
export default router;
