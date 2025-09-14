'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import PhotoUpload from '@/components/photos/PhotoUpload';
import PhotoGallery from '@/components/photos/PhotoGallery';
import PhotoComparison from '@/components/photos/PhotoComparison';
import PhotoTimeline from '@/components/photos/PhotoTimeline';

type ViewMode = 'gallery' | 'timeline' | 'comparison' | 'upload';
type PhotoType = 'all' | 'front' | 'back' | 'side' | 'progress';

export default function ClientPhotosPage() {
  const params = useParams();
  const clientId = params.id as string;
  
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [selectedType, setSelectedType] = useState<PhotoType>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = (photo: any) => {
    console.log('Photo uploaded:', photo);
    setRefreshTrigger(prev => prev + 1);
    setViewMode('gallery');
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    alert(`Upload failed: ${error}`);
  };

  const handlePhotoDelete = (photoId: string) => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Client Photos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and track client progress photos
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setViewMode('gallery')}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${viewMode === 'gallery'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                Gallery
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${viewMode === 'timeline'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${viewMode === 'comparison'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                Comparison
              </button>
              <button
                onClick={() => setViewMode('upload')}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${viewMode === 'upload'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                Upload
              </button>
            </nav>
          </div>
        </div>

        {/* Photo Type Filter (for gallery and timeline views) */}
        {(viewMode === 'gallery' || viewMode === 'timeline') && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${selectedType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }
                `}
              >
                All Photos
              </button>
              <button
                onClick={() => setSelectedType('front')}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${selectedType === 'front'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }
                `}
              >
                Front View
              </button>
              <button
                onClick={() => setSelectedType('back')}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${selectedType === 'back'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }
                `}
              >
                Back View
              </button>
              <button
                onClick={() => setSelectedType('side')}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${selectedType === 'side'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }
                `}
              >
                Side View
              </button>
              <button
                onClick={() => setSelectedType('progress')}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${selectedType === 'progress'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }
                `}
              >
                Progress
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6">
            {viewMode === 'gallery' && (
              <PhotoGallery
                clientId={clientId}
                selectedType={selectedType === 'all' ? undefined : selectedType}
                onPhotoDelete={handlePhotoDelete}
                refreshTrigger={refreshTrigger}
              />
            )}

            {viewMode === 'timeline' && selectedType !== 'all' && (
              <PhotoTimeline
                clientId={clientId}
                photoType={selectedType as 'front' | 'back' | 'side' | 'progress'}
              />
            )}

            {viewMode === 'timeline' && selectedType === 'all' && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Please select a specific photo type to view the timeline
                </p>
              </div>
            )}

            {viewMode === 'comparison' && (
              <div className="space-y-6">
                {/* Photo Type Selector for Comparison */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Photo Type for Comparison
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['front', 'back', 'side', 'progress'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-colors
                          ${selectedType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          }
                        `}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)} View
                      </button>
                    ))}
                  </div>
                </div>

                {selectedType !== 'all' && (
                  <PhotoComparison
                    clientId={clientId}
                    photoType={selectedType as 'front' | 'back' | 'side' | 'progress'}
                  />
                )}
              </div>
            )}

            {viewMode === 'upload' && (
              <div className="max-w-2xl mx-auto">
                <PhotoUpload
                  clientId={clientId}
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}