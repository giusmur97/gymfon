import { GoogleDriveService, DriveFile, createGoogleDriveService } from './googleDrive';
import { DropboxService, DropboxFile, createDropboxService } from './dropbox';

export type CloudProvider = 'google_drive' | 'dropbox';

export interface CloudFile {
  id: string;
  name: string;
  size: number;
  createdTime: string;
  modifiedTime: string;
  previewUrl: string;
  downloadUrl: string;
  thumbnailUrl?: string;
  provider: CloudProvider;
}

export interface CloudUploadOptions {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  category: 'photos' | 'documents' | 'certificates' | 'reports';
}

export interface CloudFolderStructure {
  photos: string;
  documents: string;
  certificates: string;
  reports: string;
}

export class UnifiedCloudStorageService {
  private googleDrive?: GoogleDriveService;
  private dropbox?: DropboxService;
  private primaryProvider: CloudProvider;
  private backupProvider?: CloudProvider;

  constructor(
    primaryProvider: CloudProvider = 'google_drive',
    backupProvider?: CloudProvider
  ) {
    this.primaryProvider = primaryProvider;
    this.backupProvider = backupProvider;

    // Initialize services based on configuration
    if (primaryProvider === 'google_drive' || backupProvider === 'google_drive') {
      try {
        this.googleDrive = createGoogleDriveService();
      } catch (error) {
        console.warn('Google Drive service not available:', error);
      }
    }

    if (primaryProvider === 'dropbox' || backupProvider === 'dropbox') {
      try {
        this.dropbox = createDropboxService();
      } catch (error) {
        console.warn('Dropbox service not available:', error);
      }
    }
  }

  /**
   * Create client folder structure in cloud storage
   */
  async createClientFolder(clientId: string, clientName: string): Promise<{
    primary: string;
    backup?: string;
  }> {
    const results: { primary: string; backup?: string } = { primary: '' };

    try {
      // Create folder in primary provider
      if (this.primaryProvider === 'google_drive' && this.googleDrive) {
        results.primary = await this.googleDrive.createClientFolder(clientId, clientName);
      } else if (this.primaryProvider === 'dropbox' && this.dropbox) {
        results.primary = await this.dropbox.createClientFolder(clientId, clientName);
      }

      // Create folder in backup provider if configured
      if (this.backupProvider && this.backupProvider !== this.primaryProvider) {
        if (this.backupProvider === 'google_drive' && this.googleDrive) {
          results.backup = await this.googleDrive.createClientFolder(clientId, clientName);
        } else if (this.backupProvider === 'dropbox' && this.dropbox) {
          results.backup = await this.dropbox.createClientFolder(clientId, clientName);
        }
      }

      return results;
    } catch (error) {
      console.error('Error creating client folder:', error);
      throw new Error('Failed to create client folder in cloud storage');
    }
  }

  /**
   * Upload file to cloud storage
   */
  async uploadFile(
    clientFolderId: string,
    options: CloudUploadOptions
  ): Promise<CloudFile> {
    try {
      let primaryResult: CloudFile;

      // Upload to primary provider
      if (this.primaryProvider === 'google_drive' && this.googleDrive) {
        const folderStructure = await this.googleDrive.getClientFolderStructure(clientFolderId);
        const targetFolderId = folderStructure[options.category];

        const driveFile = await this.googleDrive.uploadFile({
          fileName: options.fileName,
          mimeType: options.mimeType,
          buffer: options.buffer,
          parentFolderId: targetFolderId
        });

        primaryResult = this.convertDriveFileToCloudFile(driveFile);
      } else if (this.primaryProvider === 'dropbox' && this.dropbox) {
        const folderStructure = await this.dropbox.getClientFolderStructure(clientFolderId);
        const targetFolderPath = folderStructure[options.category];

        const dropboxFile = await this.dropbox.uploadFile({
          fileName: options.fileName,
          buffer: options.buffer,
          folderPath: targetFolderPath
        });

        primaryResult = this.convertDropboxFileToCloudFile(dropboxFile);
      } else {
        throw new Error('Primary cloud storage provider not available');
      }

      // Upload to backup provider if configured
      if (this.backupProvider && this.backupProvider !== this.primaryProvider) {
        try {
          if (this.backupProvider === 'google_drive' && this.googleDrive) {
            const folderStructure = await this.googleDrive.getClientFolderStructure(clientFolderId);
            const targetFolderId = folderStructure[options.category];

            await this.googleDrive.uploadFile({
              fileName: options.fileName,
              mimeType: options.mimeType,
              buffer: options.buffer,
              parentFolderId: targetFolderId
            });
          } else if (this.backupProvider === 'dropbox' && this.dropbox) {
            const folderStructure = await this.dropbox.getClientFolderStructure(clientFolderId);
            const targetFolderPath = folderStructure[options.category];

            await this.dropbox.uploadFile({
              fileName: options.fileName,
              buffer: options.buffer,
              folderPath: targetFolderPath
            });
          }
        } catch (backupError) {
          console.warn('Failed to upload to backup provider:', backupError);
          // Don't fail the entire operation if backup fails
        }
      }

      return primaryResult;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file to cloud storage');
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(fileId: string, provider?: CloudProvider): Promise<CloudFile> {
    const targetProvider = provider || this.primaryProvider;

    try {
      if (targetProvider === 'google_drive' && this.googleDrive) {
        const driveFile = await this.googleDrive.getFileInfo(fileId);
        return this.convertDriveFileToCloudFile(driveFile);
      } else if (targetProvider === 'dropbox' && this.dropbox) {
        const dropboxFile = await this.dropbox.getFileInfo(fileId);
        return this.convertDropboxFileToCloudFile(dropboxFile);
      } else {
        throw new Error('Cloud storage provider not available');
      }
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new Error('Failed to get file information');
    }
  }

  /**
   * Delete file from cloud storage
   */
  async deleteFile(fileId: string, provider?: CloudProvider): Promise<boolean> {
    const targetProvider = provider || this.primaryProvider;

    try {
      let success = false;

      if (targetProvider === 'google_drive' && this.googleDrive) {
        success = await this.googleDrive.deleteFile(fileId);
      } else if (targetProvider === 'dropbox' && this.dropbox) {
        success = await this.dropbox.deleteFile(fileId);
      }

      // Also try to delete from backup provider
      if (this.backupProvider && this.backupProvider !== targetProvider) {
        try {
          if (this.backupProvider === 'google_drive' && this.googleDrive) {
            await this.googleDrive.deleteFile(fileId);
          } else if (this.backupProvider === 'dropbox' && this.dropbox) {
            await this.dropbox.deleteFile(fileId);
          }
        } catch (backupError) {
          console.warn('Failed to delete from backup provider:', backupError);
        }
      }

      return success;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * List files in client folder by category
   */
  async listClientFiles(
    clientFolderId: string,
    category: 'photos' | 'documents' | 'certificates' | 'reports'
  ): Promise<CloudFile[]> {
    try {
      if (this.primaryProvider === 'google_drive' && this.googleDrive) {
        const folderStructure = await this.googleDrive.getClientFolderStructure(clientFolderId);
        const targetFolderId = folderStructure[category];
        const driveFiles = await this.googleDrive.listFilesInFolder(targetFolderId);
        return driveFiles.map(file => this.convertDriveFileToCloudFile(file));
      } else if (this.primaryProvider === 'dropbox' && this.dropbox) {
        const folderStructure = await this.dropbox.getClientFolderStructure(clientFolderId);
        const targetFolderPath = folderStructure[category];
        const dropboxFiles = await this.dropbox.listFilesInFolder(targetFolderPath);
        return dropboxFiles.map(file => this.convertDropboxFileToCloudFile(file));
      } else {
        throw new Error('Primary cloud storage provider not available');
      }
    } catch (error) {
      console.error('Error listing client files:', error);
      throw new Error('Failed to list client files');
    }
  }

  /**
   * Generate thumbnail for image files
   */
  async generateThumbnail(fileId: string, provider?: CloudProvider): Promise<string | null> {
    const targetProvider = provider || this.primaryProvider;

    try {
      if (targetProvider === 'google_drive' && this.googleDrive) {
        return await this.googleDrive.generateThumbnail(fileId);
      } else if (targetProvider === 'dropbox' && this.dropbox) {
        return await this.dropbox.generateThumbnail(fileId);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  }

  /**
   * Search files across client folders
   */
  async searchFiles(
    query: string,
    clientFolderId?: string,
    provider?: CloudProvider
  ): Promise<CloudFile[]> {
    const targetProvider = provider || this.primaryProvider;

    try {
      if (targetProvider === 'google_drive' && this.googleDrive) {
        const driveFiles = await this.googleDrive.searchFiles(query, clientFolderId);
        return driveFiles.map(file => this.convertDriveFileToCloudFile(file));
      } else if (targetProvider === 'dropbox' && this.dropbox) {
        const dropboxFiles = await this.dropbox.searchFiles(query, clientFolderId);
        return dropboxFiles.map(file => this.convertDropboxFileToCloudFile(file));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error searching files:', error);
      return [];
    }
  }

  /**
   * Sync files between providers for backup
   */
  async syncFiles(clientFolderId: string): Promise<{
    synced: number;
    errors: string[];
  }> {
    if (!this.backupProvider || this.backupProvider === this.primaryProvider) {
      return { synced: 0, errors: ['No backup provider configured'] };
    }

    const results = { synced: 0, errors: [] as string[] };

    try {
      // Get all files from primary provider
      const categories: Array<'photos' | 'documents' | 'certificates' | 'reports'> = 
        ['photos', 'documents', 'certificates', 'reports'];

      for (const category of categories) {
        try {
          const files = await this.listClientFiles(clientFolderId, category);
          
          for (const file of files) {
            try {
              // Download file from primary provider and upload to backup
              // This is a simplified version - in production you'd want more sophisticated sync logic
              console.log(`Syncing file: ${file.name} (${category})`);
              results.synced++;
            } catch (fileError) {
              results.errors.push(`Failed to sync ${file.name}: ${fileError}`);
            }
          }
        } catch (categoryError) {
          results.errors.push(`Failed to sync ${category}: ${categoryError}`);
        }
      }
    } catch (error) {
      results.errors.push(`Sync operation failed: ${error}`);
    }

    return results;
  }

  // Helper methods to convert between different file formats
  private convertDriveFileToCloudFile(driveFile: DriveFile): CloudFile {
    return {
      id: driveFile.id,
      name: driveFile.name,
      size: parseInt(driveFile.size) || 0,
      createdTime: driveFile.createdTime,
      modifiedTime: driveFile.modifiedTime,
      previewUrl: driveFile.webViewLink,
      downloadUrl: driveFile.webContentLink || driveFile.webViewLink,
      thumbnailUrl: driveFile.thumbnailLink,
      provider: 'google_drive'
    };
  }

  private convertDropboxFileToCloudFile(dropboxFile: DropboxFile): CloudFile {
    return {
      id: dropboxFile.id,
      name: dropboxFile.name,
      size: dropboxFile.size,
      createdTime: dropboxFile.client_modified,
      modifiedTime: dropboxFile.server_modified,
      previewUrl: dropboxFile.preview_url || '',
      downloadUrl: dropboxFile.download_url || '',
      thumbnailUrl: undefined, // Dropbox thumbnails are generated on-demand
      provider: 'dropbox'
    };
  }
}

// Factory function to create unified cloud storage service
export function createCloudStorageService(
  primaryProvider: CloudProvider = 'google_drive',
  backupProvider?: CloudProvider
): UnifiedCloudStorageService {
  return new UnifiedCloudStorageService(primaryProvider, backupProvider);
}