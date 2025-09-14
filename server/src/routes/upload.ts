import { Router } from "express";
import multer from "multer";
import path from "path";
import { authenticateToken } from "../utils/auth";

const router = Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // In production, this should be a cloud storage service like AWS S3
    cb(null, 'uploads/videos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, WebM, and OGG videos are allowed.'));
    }
  }
});

// Video upload endpoint
router.post('/video', authenticateToken, upload.single('video'), async (req, res) => {
  try {
    const currentUser = (req as any).user;
    
    if (currentUser.role !== 'trainer') {
      return res.status(403).json({ error: "Only trainers can upload videos" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No video file provided" });
    }

    // In production, you would:
    // 1. Upload to cloud storage (AWS S3, Google Cloud Storage, etc.)
    // 2. Process video (compression, thumbnails, etc.)
    // 3. Store metadata in database
    // 4. Return the public URL

    const videoUrl = `/uploads/videos/${req.file.filename}`;
    
    res.json({
      videoUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

  } catch (error) {
    console.error("Video upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Image upload endpoint (for course thumbnails)
const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/images/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  }
});

router.post('/image', authenticateToken, imageUpload.single('image'), async (req, res) => {
  try {
    const currentUser = (req as any).user;
    
    if (currentUser.role !== 'trainer') {
      return res.status(403).json({ error: "Only trainers can upload images" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const imageUrl = `/uploads/images/${req.file.filename}`;
    
    res.json({
      imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;