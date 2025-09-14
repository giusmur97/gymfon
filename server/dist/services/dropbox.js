import { Dropbox } from 'dropbox';
export class DropboxService {
    constructor(config) {
        this.dbx = new Dropbox({
            accessToken: config.accessToken,
            clientId: config.clientId,
            clientSecret: config.clientSecret
        });
    }
    /**
     * Create a folder structure for a specific client
     */
    async createClientFolder(clientId, clientName) {
        try {
            const mainFolderPath = '/Gym Fonty Clients';
            const clientFolderPath = `${mainFolderPath}/${clientName} (${clientId})`;
            // Create main folder if it doesn't exist
            await this.createFolderIfNotExists(mainFolderPath);
            // Create client folder
            await this.createFolderIfNotExists(clientFolderPath);
            // Create subfolders for organization
            const subfolders = ['Photos', 'Documents', 'Certificates', 'Reports'];
            for (const subfolder of subfolders) {
                await this.createFolderIfNotExists(`${clientFolderPath}/${subfolder}`);
            }
            return clientFolderPath;
        }
        catch (error) {
            console.error('Error creating client folder:', error);
            throw new Error('Failed to create client folder in Dropbox');
        }
    }
    /**
     * Upload a file to Dropbox
     */
    async uploadFile(options) {
        try {
            const filePath = `${options.folderPath}/${options.fileName}`;
            const response = await this.dbx.filesUpload({
                path: filePath,
                contents: options.buffer,
                mode: 'add',
                autorename: true
            });
            // Get sharing link for the file
            const sharingResponse = await this.dbx.sharingCreateSharedLinkWithSettings({
                path: response.result.path_lower,
                settings: {
                    requested_visibility: 'public',
                    audience: 'public',
                    access: 'viewer'
                }
            });
            return {
                id: response.result.id,
                name: response.result.name,
                path_lower: response.result.path_lower,
                size: response.result.size,
                client_modified: response.result.client_modified,
                server_modified: response.result.server_modified,
                content_hash: response.result.content_hash,
                preview_url: sharingResponse.result.url,
                download_url: sharingResponse.result.url.replace('?dl=0', '?dl=1')
            };
        }
        catch (error) {
            console.error('Error uploading file to Dropbox:', error);
            throw new Error('Failed to upload file to Dropbox');
        }
    }
    /**
     * Get file information by path
     */
    async getFileInfo(filePath) {
        try {
            const response = await this.dbx.filesGetMetadata({
                path: filePath,
                include_media_info: true,
                include_deleted: false,
                include_has_explicit_shared_members: true
            });
            const metadata = response.result;
            // Try to get existing sharing link
            let previewUrl;
            let downloadUrl;
            try {
                const sharingResponse = await this.dbx.sharingListSharedLinks({
                    path: filePath
                });
                if (sharingResponse.result.links.length > 0) {
                    previewUrl = sharingResponse.result.links[0].url;
                    downloadUrl = sharingResponse.result.links[0].url.replace('?dl=0', '?dl=1');
                }
            }
            catch (sharingError) {
                // No existing sharing link, create one
                try {
                    const newSharingResponse = await this.dbx.sharingCreateSharedLinkWithSettings({
                        path: filePath,
                        settings: {
                            requested_visibility: 'public',
                            audience: 'public',
                            access: 'viewer'
                        }
                    });
                    previewUrl = newSharingResponse.result.url;
                    downloadUrl = newSharingResponse.result.url.replace('?dl=0', '?dl=1');
                }
                catch (createError) {
                    console.warn('Could not create sharing link:', createError);
                }
            }
            return {
                id: metadata.id,
                name: metadata.name,
                path_lower: metadata.path_lower,
                size: metadata.size,
                client_modified: metadata.client_modified,
                server_modified: metadata.server_modified,
                content_hash: metadata.content_hash,
                preview_url: previewUrl,
                download_url: downloadUrl
            };
        }
        catch (error) {
            console.error('Error getting file info from Dropbox:', error);
            throw new Error('Failed to get file information from Dropbox');
        }
    }
    /**
     * Delete a file from Dropbox
     */
    async deleteFile(filePath) {
        try {
            await this.dbx.filesDeleteV2({
                path: filePath
            });
            return true;
        }
        catch (error) {
            console.error('Error deleting file from Dropbox:', error);
            return false;
        }
    }
    /**
     * List files in a folder
     */
    async listFilesInFolder(folderPath) {
        try {
            const response = await this.dbx.filesListFolder({
                path: folderPath,
                recursive: false,
                include_media_info: true,
                include_deleted: false,
                include_has_explicit_shared_members: true
            });
            const files = [];
            for (const entry of response.result.entries) {
                if (entry['.tag'] === 'file') {
                    const fileEntry = entry;
                    // Get sharing link for each file
                    let previewUrl;
                    let downloadUrl;
                    try {
                        const sharingResponse = await this.dbx.sharingListSharedLinks({
                            path: fileEntry.path_lower
                        });
                        if (sharingResponse.result.links.length > 0) {
                            previewUrl = sharingResponse.result.links[0].url;
                            downloadUrl = sharingResponse.result.links[0].url.replace('?dl=0', '?dl=1');
                        }
                    }
                    catch (sharingError) {
                        // No sharing link exists
                    }
                    files.push({
                        id: fileEntry.id,
                        name: fileEntry.name,
                        path_lower: fileEntry.path_lower,
                        size: fileEntry.size,
                        client_modified: fileEntry.client_modified,
                        server_modified: fileEntry.server_modified,
                        content_hash: fileEntry.content_hash,
                        preview_url: previewUrl,
                        download_url: downloadUrl
                    });
                }
            }
            return files.sort((a, b) => new Date(b.server_modified).getTime() - new Date(a.server_modified).getTime());
        }
        catch (error) {
            console.error('Error listing files in Dropbox folder:', error);
            throw new Error('Failed to list files in Dropbox folder');
        }
    }
    /**
     * Get client folder structure
     */
    async getClientFolderStructure(clientFolderPath) {
        try {
            return {
                photos: `${clientFolderPath}/Photos`,
                documents: `${clientFolderPath}/Documents`,
                certificates: `${clientFolderPath}/Certificates`,
                reports: `${clientFolderPath}/Reports`
            };
        }
        catch (error) {
            console.error('Error getting Dropbox folder structure:', error);
            throw new Error('Failed to get client folder structure from Dropbox');
        }
    }
    /**
     * Generate thumbnail for image files
     */
    async generateThumbnail(filePath) {
        try {
            const response = await this.dbx.filesGetThumbnailV2({
                resource: {
                    '.tag': 'path',
                    path: filePath
                },
                format: 'jpeg',
                size: 'w256h256'
            });
            if (response.result.fileBinary) {
                // Convert binary data to base64 for display
                const buffer = Buffer.from(response.result.fileBinary);
                return `data:image/jpeg;base64,${buffer.toString('base64')}`;
            }
            return null;
        }
        catch (error) {
            console.error('Error generating thumbnail from Dropbox:', error);
            return null;
        }
    }
    /**
     * Search files by name
     */
    async searchFiles(query, folderPath) {
        try {
            const searchOptions = {
                query: query,
                options: {
                    path: folderPath || '',
                    max_results: 100,
                    order_by: 'relevance'
                }
            };
            const response = await this.dbx.filesSearchV2(searchOptions);
            const files = [];
            for (const match of response.result.matches) {
                if (match.metadata.metadata['.tag'] === 'file') {
                    const fileMetadata = match.metadata.metadata;
                    // Get sharing link
                    let previewUrl;
                    let downloadUrl;
                    try {
                        const sharingResponse = await this.dbx.sharingListSharedLinks({
                            path: fileMetadata.path_lower
                        });
                        if (sharingResponse.result.links.length > 0) {
                            previewUrl = sharingResponse.result.links[0].url;
                            downloadUrl = sharingResponse.result.links[0].url.replace('?dl=0', '?dl=1');
                        }
                    }
                    catch (sharingError) {
                        // No sharing link exists
                    }
                    files.push({
                        id: fileMetadata.id,
                        name: fileMetadata.name,
                        path_lower: fileMetadata.path_lower,
                        size: fileMetadata.size,
                        client_modified: fileMetadata.client_modified,
                        server_modified: fileMetadata.server_modified,
                        content_hash: fileMetadata.content_hash,
                        preview_url: previewUrl,
                        download_url: downloadUrl
                    });
                }
            }
            return files;
        }
        catch (error) {
            console.error('Error searching files in Dropbox:', error);
            throw new Error('Failed to search files in Dropbox');
        }
    }
    /**
     * Sync files - get all files in client folder for backup/sync purposes
     */
    async syncClientFiles(clientFolderPath) {
        try {
            const folderStructure = await this.getClientFolderStructure(clientFolderPath);
            const [photos, documents, certificates, reports] = await Promise.all([
                this.listFilesInFolder(folderStructure.photos),
                this.listFilesInFolder(folderStructure.documents),
                this.listFilesInFolder(folderStructure.certificates),
                this.listFilesInFolder(folderStructure.reports)
            ]);
            return {
                photos,
                documents,
                certificates,
                reports
            };
        }
        catch (error) {
            console.error('Error syncing client files from Dropbox:', error);
            throw new Error('Failed to sync client files from Dropbox');
        }
    }
    // Private helper methods
    async createFolderIfNotExists(folderPath) {
        try {
            await this.dbx.filesCreateFolderV2({
                path: folderPath,
                autorename: false
            });
        }
        catch (error) {
            // Folder already exists - this is expected
            if (error.error && error.error.error && error.error.error['.tag'] !== 'path_already_exists') {
                throw error;
            }
        }
    }
}
// Factory function to create Dropbox service instance
export function createDropboxService() {
    const config = {
        accessToken: process.env.DROPBOX_ACCESS_TOKEN,
        clientId: process.env.DROPBOX_CLIENT_ID,
        clientSecret: process.env.DROPBOX_CLIENT_SECRET
    };
    return new DropboxService(config);
}
