import { google } from 'googleapis';
import { Readable } from 'stream';
import path from 'path';

export interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken: string;
}

export interface UploadFileOptions {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  parentFolderId?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink: string;
  thumbnailLink?: string;
}

export class GoogleDriveService {
  private drive: any;
  private auth: any;

  constructor(config: GoogleDriveConfig) {
    this.auth = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    this.auth.setCredentials({
      refresh_token: config.refreshToken
    });

    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  /**
   * Create a folder for a specific client
   */
  async createClientFolder(clientId: string, clientName: string): Promise<string> {
    try {
      // First, check if the main "Gym Fonty Clients" folder exists
      const mainFolderName = 'Gym Fonty Clients';
      let mainFolderId = await this.findFolderByName(mainFolderName);

      if (!mainFolderId) {
        mainFolderId = await this.createFolder(mainFolderName);
      }

      // Create client-specific folder
      const clientFolderName = `${clientName} (${clientId})`;
      const clientFolderId = await this.createFolder(clientFolderName, mainFolderId);

      // Create subfolders for organization
      const subfolders = ['Photos', 'Documents', 'Certificates', 'Reports'];
      for (const subfolder of subfolders) {
        await this.createFolder(subfolder, clientFolderId);
      }

      return clientFolderId;
    } catch (error) {
      console.error('Error creating client folder:', error);
      throw new Error('Failed to create client folder');
    }
  }

  /**
   * Upload a file to Google Drive
   */
  async uploadFile(options: UploadFileOptions): Promise<DriveFile> {
    try {
      const fileMetadata = {
        name: options.fileName,
        parents: options.parentFolderId ? [options.parentFolderId] : undefined
      };

      const media = {
        mimeType: options.mimeType,
        body: Readable.from(options.buffer)
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink'
      });

      // Make the file publicly viewable
      await this.drive.permissions.create({
        fileId: response.data.id,
        resource: {
          role: 'reader',
          type: 'anyone'
        }
      });

      return response.data as DriveFile;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file to Google Drive');
    }
  }

  /**
   * Get file information by ID
   */
  async getFileInfo(fileId: string): Promise<DriveFile> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink'
      });

      return response.data as DriveFile;
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new Error('Failed to get file information');
    }
  }

  /**
   * Delete a file from Google Drive
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      await this.drive.files.delete({
        fileId: fileId
      });
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * List files in a folder
   */
  async listFilesInFolder(folderId: string): Promise<DriveFile[]> {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink)',
        orderBy: 'createdTime desc'
      });

      return response.data.files as DriveFile[];
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Failed to list files');
    }
  }

  /**
   * Get client folder structure
   */
  async getClientFolderStructure(clientFolderId: string): Promise<{
    photos: string;
    documents: string;
    certificates: string;
    reports: string;
  }> {
    try {
      const subfolders = await this.drive.files.list({
        q: `'${clientFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id,name)'
      });

      const folderMap: any = {};
      subfolders.data.files.forEach((folder: any) => {
        const name = folder.name.toLowerCase();
        folderMap[name] = folder.id;
      });

      return {
        photos: folderMap['photos'] || clientFolderId,
        documents: folderMap['documents'] || clientFolderId,
        certificates: folderMap['certificates'] || clientFolderId,
        reports: folderMap['reports'] || clientFolderId
      };
    } catch (error) {
      console.error('Error getting folder structure:', error);
      throw new Error('Failed to get client folder structure');
    }
  }

  /**
   * Generate thumbnail for image files
   */
  async generateThumbnail(fileId: string): Promise<string | null> {
    try {
      const fileInfo = await this.getFileInfo(fileId);
      
      // Google Drive automatically generates thumbnails for images
      if (fileInfo.thumbnailLink) {
        return fileInfo.thumbnailLink;
      }

      // For non-image files, return null
      return null;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  }

  /**
   * Search files by name
   */
  async searchFiles(query: string, folderId?: string): Promise<DriveFile[]> {
    try {
      let searchQuery = `name contains '${query}' and trashed=false`;
      if (folderId) {
        searchQuery += ` and '${folderId}' in parents`;
      }

      const response = await this.drive.files.list({
        q: searchQuery,
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink)',
        orderBy: 'relevance'
      });

      return response.data.files as DriveFile[];
    } catch (error) {
      console.error('Error searching files:', error);
      throw new Error('Failed to search files');
    }
  }

  // Private helper methods
  private async createFolder(name: string, parentId?: string): Promise<string> {
    const fileMetadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined
    };

    const response = await this.drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    });

    return response.data.id;
  }

  private async findFolderByName(name: string): Promise<string | null> {
    try {
      const response = await this.drive.files.list({
        q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id,name)'
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      return null;
    } catch (error) {
      console.error('Error finding folder:', error);
      return null;
    }
  }
}

// Factory function to create Google Drive service instance
export function createGoogleDriveService(): GoogleDriveService {
  const config: GoogleDriveConfig = {
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_DRIVE_REDIRECT_URI!,
    refreshToken: process.env.GOOGLE_DRIVE_REFRESH_TOKEN!
  };

  return new GoogleDriveService(config);
}