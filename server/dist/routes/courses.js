import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { authenticateToken } from "../utils/auth";
const router = Router();
const prisma = new PrismaClient();
// Validation schemas
const courseSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    description: z.string().min(1, "Description is required").max(2000, "Description too long"),
    price: z.number().min(0, "Price must be positive"),
    duration: z.number().min(1, "Duration must be at least 1 week").max(52, "Duration cannot exceed 52 weeks"),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
    tags: z.array(z.string()).max(10, "Maximum 10 tags allowed"),
    thumbnail: z.string().url().optional(),
});
const moduleSchema = z.object({
    title: z.string().min(1, "Module title is required").max(200, "Title too long"),
    order: z.number().min(0, "Order must be non-negative"),
});
const lessonSchema = z.object({
    title: z.string().min(1, "Lesson title is required").max(200, "Title too long"),
    content: z.object({
        type: z.enum(["video", "text", "quiz", "exercise"]),
        data: z.any(), // Will validate based on type
    }),
    duration: z.number().min(1, "Duration must be at least 1 minute"),
    order: z.number().min(0, "Order must be non-negative"),
});
// Get all courses for a trainer
router.get("/", authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        if (currentUser.role !== 'trainer') {
            return res.status(403).json({ error: "Only trainers can access courses" });
        }
        const courses = await prisma.course.findMany({
            where: { trainerId: currentUser.id },
            include: {
                modules: {
                    include: {
                        lessons: true,
                    },
                    orderBy: { order: 'asc' },
                },
                _count: {
                    select: { enrollments: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(courses);
    }
    catch (error) {
        console.error("Get courses error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get a specific course
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        const courseId = req.params.id;
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                trainerId: currentUser.id,
            },
            include: {
                modules: {
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
                _count: {
                    select: { enrollments: true },
                },
            },
        });
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        res.json(course);
    }
    catch (error) {
        console.error("Get course error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Create a new course
router.post("/", authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        if (currentUser.role !== 'trainer') {
            return res.status(403).json({ error: "Only trainers can create courses" });
        }
        const validatedData = courseSchema.parse(req.body);
        const course = await prisma.course.create({
            data: {
                ...validatedData,
                trainerId: currentUser.id,
            },
            include: {
                modules: {
                    include: {
                        lessons: true,
                    },
                },
            },
        });
        res.status(201).json(course);
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: "Validation failed",
                details: error.errors,
            });
        }
        console.error("Create course error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Update a course
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        const courseId = req.params.id;
        // Check if course exists and belongs to trainer
        const existingCourse = await prisma.course.findFirst({
            where: {
                id: courseId,
                trainerId: currentUser.id,
            },
        });
        if (!existingCourse) {
            return res.status(404).json({ error: "Course not found" });
        }
        const validatedData = courseSchema.parse(req.body);
        const course = await prisma.course.update({
            where: { id: courseId },
            data: validatedData,
            include: {
                modules: {
                    include: {
                        lessons: true,
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        res.json(course);
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: "Validation failed",
                details: error.errors,
            });
        }
        console.error("Update course error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Delete a course
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        const courseId = req.params.id;
        // Check if course exists and belongs to trainer
        const existingCourse = await prisma.course.findFirst({
            where: {
                id: courseId,
                trainerId: currentUser.id,
            },
        });
        if (!existingCourse) {
            return res.status(404).json({ error: "Course not found" });
        }
        await prisma.course.delete({
            where: { id: courseId },
        });
        res.json({ message: "Course deleted successfully" });
    }
    catch (error) {
        console.error("Delete course error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Create a module for a course
router.post("/:courseId/modules", authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        const courseId = req.params.courseId;
        // Check if course exists and belongs to trainer
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                trainerId: currentUser.id,
            },
        });
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        const validatedData = moduleSchema.parse(req.body);
        const module = await prisma.courseModule.create({
            data: {
                ...validatedData,
                courseId,
            },
            include: {
                lessons: true,
            },
        });
        res.status(201).json(module);
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: "Validation failed",
                details: error.errors,
            });
        }
        console.error("Create module error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Update a module
router.put("/:courseId/modules/:moduleId", authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        const { courseId, moduleId } = req.params;
        // Check if course exists and belongs to trainer
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                trainerId: currentUser.id,
            },
        });
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        const validatedData = moduleSchema.parse(req.body);
        const module = await prisma.courseModule.update({
            where: { id: moduleId },
            data: validatedData,
            include: {
                lessons: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        res.json(module);
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: "Validation failed",
                details: error.errors,
            });
        }
        console.error("Update module error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Delete a module
router.delete("/:courseId/modules/:moduleId", authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        const { courseId, moduleId } = req.params;
        // Check if course exists and belongs to trainer
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                trainerId: currentUser.id,
            },
        });
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        await prisma.courseModule.delete({
            where: { id: moduleId },
        });
        res.json({ message: "Module deleted successfully" });
    }
    catch (error) {
        console.error("Delete module error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Create a lesson for a module
router.post("/:courseId/modules/:moduleId/lessons", authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        const { courseId, moduleId } = req.params;
        // Check if course exists and belongs to trainer
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                trainerId: currentUser.id,
            },
        });
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        const validatedData = lessonSchema.parse(req.body);
        const lesson = await prisma.lesson.create({
            data: {
                ...validatedData,
                moduleId,
            },
        });
        res.status(201).json(lesson);
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: "Validation failed",
                details: error.errors,
            });
        }
        console.error("Create lesson error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Update a lesson
router.put("/:courseId/modules/:moduleId/lessons/:lessonId", authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        const { courseId, lessonId } = req.params;
        // Check if course exists and belongs to trainer
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                trainerId: currentUser.id,
            },
        });
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        const validatedData = lessonSchema.parse(req.body);
        const lesson = await prisma.lesson.update({
            where: { id: lessonId },
            data: validatedData,
        });
        res.json(lesson);
    }
    catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({
                error: "Validation failed",
                details: error.errors,
            });
        }
        console.error("Update lesson error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Delete a lesson
router.delete("/:courseId/modules/:moduleId/lessons/:lessonId", authenticateToken, async (req, res) => {
    try {
        const currentUser = req.user;
        const { courseId, lessonId } = req.params;
        // Check if course exists and belongs to trainer
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                trainerId: currentUser.id,
            },
        });
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        await prisma.lesson.delete({
            where: { id: lessonId },
        });
        res.json({ message: "Lesson deleted successfully" });
    }
    catch (error) {
        console.error("Delete lesson error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
export default router;
