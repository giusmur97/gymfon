'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Photo {
  id: string;
  type: 'front' | 'back' | 'side' | 'progress';
  cloudUrl: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  notes?: string;
  uploader: {
    id: string;
    name: string;
    surname: string;
  };
}

interface PhotoGalleryProps {
  clientId: string;
  selectedType?: 'front' | 'back' | 'side' | 'progress';
  onPhotoSelect?: (photo: Photo) => void;
  onPhotoDelete?: (photoId: string) => void;
  refreshTrigger?: number;
}

export default function PhotoGallery({ 
  clientId, 
  selectedType, 
  onPhotoSelect, 
  onPhotoDelete,
  refreshTrigger 
}: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedType) {
        params.append('type', selectedType);
      }
      
      const response = await fetch(`/api/photos/${clientId}?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }

      const result = await response.json();
      if (result.success) {
        setPhotos(result.photos);
      } else {
        throw new Error(result.error || 'Failed to fetch photos');
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [clientId, selectedType, refreshTrigger]);

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowModal(true);
    onPhotoSelect?.(photo);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      // Remove photo from local state
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      onPhotoDelete?.(photoId);
      
      // Close modal if deleted photo was selected
      if (selectedPhoto?.id === photoId) {
        setShowModal(false);
        setSelectedPhoto(null);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    const colors = {
      front: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      back: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      side: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading photos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchPhotos}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {selectedType ? `No ${selectedType} photos found` : 'No photos found'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group cursor-pointer bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            onClick={() => handlePhotoClick(photo)}
          >
            {/* Photo */}
            <div className="aspect-square relative">
              <Image
                src={photo.thumbnailUrl || photo.cloudUrl}
                alt={`${photo.type} photo`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Photo Info */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(photo.type)}`}>
                  {photo.type}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(photo.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {formatDate(photo.uploadDate)}
              </p>
              
              {photo.notes && (
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                  {photo.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {showModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedPhoto.type.charAt(0).toUpperCase() + selectedPhoto.type.slice(1)} Photo
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="relative mb-4">
                <Image
                  src={selectedPhoto.cloudUrl}
                  alt={`${selectedPhoto.type} photo`}
                  width={800}
                  height={600}
                  className="rounded-lg object-contain max-h-96 w-full"
                />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">File:</span>
                  <span className="text-gray-900 dark:text-white">{selectedPhoto.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Size:</span>
                  <span className="text-gray-900 dark:text-white">{formatFileSize(selectedPhoto.fileSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Uploaded:</span>
                  <span className="text-gray-900 dark:text-white">{formatDate(selectedPhoto.uploadDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">By:</span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedPhoto.uploader.name} {selectedPhoto.uploader.surname}
                  </span>
                </div>
                {selectedPhoto.notes && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Notes:</span>
                    <p className="text-gray-900 dark:text-white mt-1">{selectedPhoto.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <a
                  href={selectedPhoto.cloudUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Full Size
                </a>
                <button
                  onClick={() => handleDeletePhoto(selectedPhoto.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}