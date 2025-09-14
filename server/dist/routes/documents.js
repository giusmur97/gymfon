import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../utils/auth';
import { requireRole } from '../middleware/rbac';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { CloudStorageService } from '../services/cloudStorage';
const router = express.Router();
const prisma = new PrismaClient();
// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = 'uploads/documents';
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        }
        catch (error) {
            cb(error, uploadDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow common document types
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo di file non supportato'));
        }
    }
});
// Validation schemas
const DocumentMetadataSchema = z.object({
    clientId: z.string(),
    type: z.enum(['medical_certificate', 'self_certification', 'consent', 'other']),
    name: z.string().min(1),
    expiryDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    notes: z.string().optional()
});
const DocumentUpdateSchema = z.object({
    name: z.string().optional(),
    type: z.enum(['medical_certificate', 'self_certification', 'consent', 'other']).optional(),
    expiryDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    isValid: z.boolean().optional(),
    notes: z.string().optional()
});
// Get all documents for a client
router.get('/client/:clientId', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
    try {
        const { clientId } = req.params;
        const { type, expired } = req.query;
        const where = { clientId };
        if (type) {
            where.type = type;
        }
        if (expired === 'true') {
            where.expiryDate = {
                lt: new Date()
            };
            where.isValid = true;
        }
        else if (expired === 'false') {
            where.OR = [
                { expiryDate: null },
                { expiryDate: { gte: new Date() } }
            ];
        }
        const documents = await prisma.clientDocument.findMany({
            where,
            include: {
                uploader: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { uploadDate: 'desc' }
        });
        res.json(documents);
    }
    catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});
// Upload document
router.post('/upload', authenticateToken, requireRole(['admin', 'staff']), upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const validatedData = DocumentMetadataSchema.parse(req.body);
        const userId = req.user?.id;
        // Get client profile to access cloud storage settings
        const clientProfile = await prisma.clientProfile.findUnique({
            where: { userId: validatedData.clientId }
        });
        if (!clientProfile) {
            return res.status(404).json({ error: 'Client profile not found' });
        }
        let cloudUrl = '';
        let downloadUrl = '';
        let cloudFileId = '';
        let cloudProvider = '';
        // Upload to cloud storage if configured
        if (clientProfile.cloudProvider && clientProfile.cloudFolderId) {
            try {
                const cloudStorage = new CloudStorageService();
                const uploadResult = await cloudStorage.uploadFile(req.file.path, req.file.originalname, clientProfile.cloudProvider, clientProfile.cloudFolderId);
                cloudUrl = uploadResult.webViewLink || uploadResult.url;
                downloadUrl = uploadResult.downloadUrl || uploadResult.url;
                cloudFileId = uploadResult.id;
                cloudProvider = clientProfile.cloudProvider;
                // Delete local file after successful cloud upload
                await fs.unlink(req.file.path);
            }
            catch (cloudError) {
                console.error('Cloud upload failed, keeping local file:', cloudError);
                cloudUrl = `/uploads/documents/${req.file.filename}`;
                downloadUrl = cloudUrl;
            }
        }
        else {
            // Use local storage
            cloudUrl = `/uploads/documents/${req.file.filename}`;
            downloadUrl = cloudUrl;
        }
        // Create document record
        const document = await prisma.clientDocument.create({
            data: {
                clientId: validatedData.clientId,
                type: validatedData.type,
                name: validatedData.name,
                cloudUrl,
                downloadUrl,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                cloudFileId: cloudFileId || null,
                cloudProvider: cloudProvider || null,
                expiryDate: validatedData.expiryDate,
                uploadedBy: userId
            },
            include: {
                uploader: {
                    select: { name: true, email: true }
                }
            }
        });
        // Log the upload
        await prisma.auditLog.create({
            data: {
                userId: userId,
                clientId: validatedData.clientId,
                action: 'DOCUMENT_UPLOADED',
                resourceType: 'ClientDocument',
                resourceId: document.id,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent') || '',
                changes: {
                    documentType: validatedData.type,
                    fileName: req.file.originalname,
                    fileSize: req.file.size,
                    cloudProvider: cloudProvider || 'local'
                }
            }
        });
        res.json(document);
    }
    catch (error) {
        console.error('Error uploading document:', error);
        // Clean up uploaded file on error
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            }
            catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid data', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to upload document' });
    }
});
// Update document metadata
router.put('/:documentId', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
    try {
        const { documentId } = req.params;
        const validatedData = DocumentUpdateSchema.parse(req.body);
        const userId = req.user?.id;
        const existingDocument = await prisma.clientDocument.findUnique({
            where: { id: documentId }
        });
        if (!existingDocument) {
            return res.status(404).json({ error: 'Document not found' });
        }
        const document = await prisma.clientDocument.update({
            where: { id: documentId },
            data: validatedData,
            include: {
                uploader: {
                    select: { name: true, email: true }
                }
            }
        });
        // Log the update
        await prisma.auditLog.create({
            data: {
                userId: userId,
                clientId: existingDocument.clientId,
                action: 'DOCUMENT_UPDATED',
                resourceType: 'ClientDocument',
                resourceId: documentId,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent') || '',
                changes: validatedData
            }
        });
        res.json(document);
    }
    catch (error) {
        console.error('Error updating document:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Invalid data', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to update document' });
    }
});
// Delete document
router.delete('/:documentId', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user?.id;
        const document = await prisma.clientDocument.findUnique({
            where: { id: documentId }
        });
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        // Delete from cloud storage if applicable
        if (document.cloudProvider && document.cloudFileId) {
            try {
                const cloudStorage = new CloudStorageService();
                await cloudStorage.deleteFile(document.cloudFileId, document.cloudProvider);
            }
            catch (cloudError) {
                console.error('Failed to delete from cloud storage:', cloudError);
            }
        }
        else if (document.cloudUrl.startsWith('/uploads/')) {
            // Delete local file
            try {
                const filePath = path.join(process.cwd(), document.cloudUrl);
                await fs.unlink(filePath);
            }
            catch (fileError) {
                console.error('Failed to delete local file:', fileError);
            }
        }
        // Delete document record
        await prisma.clientDocument.delete({
            where: { id: documentId }
        });
        // Log the deletion
        await prisma.auditLog.create({
            data: {
                userId: userId,
                clientId: document.clientId,
                action: 'DOCUMENT_DELETED',
                resourceType: 'ClientDocument',
                resourceId: documentId,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent') || '',
                changes: {
                    fileName: document.fileName,
                    documentType: document.type
                }
            }
        });
        res.json({ message: 'Document deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: 'Failed to delete document' });
    }
});
// Get documents expiring soon
router.get('/expiring', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
    try {
        const { days = '30' } = req.query;
        const daysAhead = parseInt(days);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);
        const expiringDocuments = await prisma.clientDocument.findMany({
            where: {
                expiryDate: {
                    lte: futureDate,
                    gte: new Date()
                },
                isValid: true
            },
            include: {
                client: {
                    select: {
                        firstName: true,
                        lastName: true,
                        user: {
                            select: { email: true }
                        }
                    }
                },
                uploader: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { expiryDate: 'asc' }
        });
        res.json(expiringDocuments);
    }
    catch (error) {
        console.error('Error fetching expiring documents:', error);
        res.status(500).json({ error: 'Failed to fetch expiring documents' });
    }
});
// Get document validation status
router.get('/validation-status/:clientId', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
    try {
        const { clientId } = req.params;
        const documents = await prisma.clientDocument.findMany({
            where: { clientId },
            orderBy: { uploadDate: 'desc' }
        });
        const validationStatus = {
            totalDocuments: documents.length,
            validDocuments: documents.filter(d => d.isValid).length,
            expiredDocuments: documents.filter(d => d.expiryDate && d.expiryDate < new Date() && d.isValid).length,
            expiringDocuments: documents.filter(d => {
                if (!d.expiryDate || !d.isValid)
                    return false;
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                return d.expiryDate <= thirtyDaysFromNow && d.expiryDate >= new Date();
            }).length,
            documentsByType: documents.reduce((acc, doc) => {
                acc[doc.type] = (acc[doc.type] || 0) + 1;
                return acc;
            }, {}),
            missingRequired: []
        };
        // Check for missing required documents
        const requiredTypes = ['medical_certificate', 'self_certification'];
        requiredTypes.forEach(type => {
            const hasValidDocument = documents.some(d => d.type === type &&
                d.isValid &&
                (!d.expiryDate || d.expiryDate > new Date()));
            if (!hasValidDocument) {
                validationStatus.missingRequired.push(type);
            }
        });
        res.json(validationStatus);
    }
    catch (error) {
        console.error('Error fetching validation status:', error);
        res.status(500).json({ error: 'Failed to fetch validation status' });
    }
});
export default router;
