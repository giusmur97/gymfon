# Cloud Storage Integration Setup Guide

This guide explains how to set up Google Drive and Dropbox integration for the Personal Trainer Platform.

## Overview

The cloud storage system provides:
- **Google Drive Integration**: Primary storage provider with automatic folder organization
- **Dropbox Integration**: Alternative/backup storage provider
- **Unified Interface**: Single API to work with both providers
- **Photo Management**: Specialized photo upload, categorization, and comparison tools
- **Automatic Organization**: Client-specific folders with subfolders for different file types

## Features Implemented

### 1. Google Drive Integration (`server/src/services/googleDrive.ts`)
- File upload and management
- Client folder creation and organization
- Automatic thumbnail generation
- File sharing and permissions
- Search functionality
- Folder structure management

### 2. Dropbox Integration (`server/src/services/dropbox.ts`)
- File upload and management
- Client folder creation
- File sharing links
- Search and sync capabilities
- Thumbnail generation for images

### 3. Unified Cloud Storage Service (`server/src/services/cloudStorage.ts`)
- Provider-agnostic interface
- Primary/backup provider support
- Automatic failover
- File synchronization between providers
- Unified file format conversion

### 4. Photo Management System
- **Upload Component** (`web/src/components/photos/PhotoUpload.tsx`): Drag & drop photo upload with progress tracking
- **Gallery Component** (`web/src/components/photos/PhotoGallery.tsx`): Grid view of client photos with filtering
- **Timeline Component** (`web/src/components/photos/PhotoTimeline.tsx`): Chronological view of progress photos
- **Comparison Component** (`web/src/components/photos/PhotoComparison.tsx`): Before/after photo comparison tools
- **Main Page** (`web/src/app/clients/[id]/photos/page.tsx`): Complete photo management interface

### 5. API Routes (`server/src/routes/photos.ts`)
- `POST /api/photos/upload` - Upload client photos
- `GET /api/photos/:clientId` - Get client photos with filtering
- `GET /api/photos/:clientId/timeline/:type` - Get photo timeline
- `POST /api/photos/compare` - Compare before/after photos
- `DELETE /api/photos/:photoId` - Delete photos
- `PATCH /api/photos/:photoId` - Update photo metadata

## Setup Instructions

### 1. Google Drive API Setup

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Google Drive API

2. **Create OAuth 2.0 Credentials**:
   - Go to "Credentials" in the API & Services section
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized redirect URIs: `http://localhost:4000/auth/google/callback`

3. **Get Refresh Token**:
   ```bash
   # Use Google OAuth 2.0 Playground or implement token exchange
   # https://developers.google.com/oauthplayground/
   ```

4. **Update Environment Variables**:
   ```env
   GOOGLE_DRIVE_CLIENT_ID="your-client-id"
   GOOGLE_DRIVE_CLIENT_SECRET="your-client-secret"
   GOOGLE_DRIVE_REDIRECT_URI="http://localhost:4000/auth/google/callback"
   GOOGLE_DRIVE_REFRESH_TOKEN="your-refresh-token"
   ```

### 2. Dropbox API Setup

1. **Create Dropbox App**:
   - Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
   - Create a new app with "Full Dropbox" access
   - Note the App key and App secret

2. **Generate Access Token**:
   - In your app settings, generate an access token
   - Or implement OAuth 2.0 flow for production

3. **Update Environment Variables**:
   ```env
   DROPBOX_ACCESS_TOKEN="your-access-token"
   DROPBOX_CLIENT_ID="your-app-key"
   DROPBOX_CLIENT_SECRET="your-app-secret"
   ```

### 3. Database Migration

Run the database migration to add the new models:

```bash
cd server
npx prisma db push
# or
npx prisma migrate dev --name add-cloud-storage-models
```

### 4. Install Dependencies

```bash
# Server dependencies
cd server
npm install googleapis dropbox

# Client dependencies  
cd ../web
npm install react-dropzone
```

### 5. Environment Configuration

Update your `.env` file with cloud storage settings:

```env
# Cloud Storage Settings
CLOUD_STORAGE_PRIMARY_PROVIDER="google_drive"
CLOUD_STORAGE_BACKUP_PROVIDER="dropbox"
```

## Usage Examples

### Basic File Upload

```typescript
import { createCloudStorageService } from '@/services/cloudStorage';

const cloudStorage = createCloudStorageService();

// Create client folder
const folderResult = await cloudStorage.createClientFolder(
  'client-id', 
  'John Doe'
);

// Upload file
const file = await cloudStorage.uploadFile(folderResult.primary, {
  fileName: 'progress-photo.jpg',
  mimeType: 'image/jpeg',
  buffer: fileBuffer,
  category: 'photos'
});
```

### Photo Management

```typescript
// Upload photo via API
const formData = new FormData();
formData.append('photo', file);
formData.append('clientId', 'client-id');
formData.append('type', 'front');
formData.append('notes', 'Initial progress photo');

const response = await fetch('/api/photos/upload', {
  method: 'POST',
  body: formData
});
```

## File Organization Structure

The system automatically creates the following folder structure:

```
Gym Fonty Clients/
├── John Doe (client-id-1)/
│   ├── Photos/
│   ├── Documents/
│   ├── Certificates/
│   └── Reports/
├── Jane Smith (client-id-2)/
│   ├── Photos/
│   ├── Documents/
│   ├── Certificates/
│   └── Reports/
└── ...
```

## Security Considerations

1. **File Validation**: Only image files are accepted for photos
2. **Size Limits**: 10MB maximum file size
3. **Access Control**: Role-based permissions (admin/staff can upload, clients can view own photos)
4. **Secure URLs**: All files use secure sharing links
5. **Audit Trail**: All uploads are logged with user information

## Error Handling

The system includes comprehensive error handling:
- Network failures with automatic retry
- Invalid file types and sizes
- Cloud storage quota limits
- Permission errors
- Graceful degradation when backup provider fails

## Performance Optimizations

1. **Thumbnail Generation**: Automatic thumbnails for faster loading
2. **Lazy Loading**: Images load on demand
3. **Progress Tracking**: Real-time upload progress
4. **Caching**: File metadata cached in database
5. **Compression**: Automatic image optimization

## Monitoring and Maintenance

- **Audit Logs**: All file operations are logged
- **Storage Quotas**: Monitor cloud storage usage
- **Sync Status**: Track synchronization between providers
- **Error Reporting**: Comprehensive error logging
- **Performance Metrics**: Upload/download speed tracking

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Check API credentials and refresh tokens
2. **Upload Failures**: Verify file size and type restrictions
3. **Permission Denied**: Ensure proper folder permissions in cloud storage
4. **Quota Exceeded**: Monitor storage usage and upgrade plans as needed

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=cloud-storage:*
```

## Future Enhancements

- **AWS S3 Integration**: Additional cloud provider support
- **Image Processing**: Automatic resizing and optimization
- **Bulk Operations**: Mass upload and download capabilities
- **Advanced Search**: AI-powered image recognition and tagging
- **Mobile App**: Native mobile photo capture and upload