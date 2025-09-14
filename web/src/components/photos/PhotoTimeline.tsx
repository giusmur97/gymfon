'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Photo {
  id: string;
  cloudUrl: string;
  thumbnailUrl?: string;
  uploadDate: string;
  notes?: string;
  fileName: string;
}

interface TimelineData {
  [monthKey: string]: Photo[];
}

interface PhotoTimelineProps {
  clientId: string;
  photoType: 'front' | 'back' | 'side' | 'progress';
}

export default function PhotoTimeline({ clientId, photoType }: PhotoTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineData>({});
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTimeline();
  }, [clientId, photoType]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/photos/${clientId}/timeline/${photoType}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch photo timeline');
      }

      const result = await response.json();
      if (result.success) {
        setTimeline(result.timeline);
        setTotalPhotos(result.totalPhotos);
      } else {
        throw new Error(result.error || 'Failed to fetch timeline');
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch timeline');
    } finally {
      setLoading(false);
    }
  };

  const formatMonthYear = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading timeline...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchTimeline}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (totalPhotos === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          No {photoType} photos found for timeline
        </p>
      </div>
    );
  }

  const sortedMonths = Object.keys(timeline).sort((a, b) => b.localeCompare(a));

  return (
    <>
      <div className="space-y-8">
        {/* Timeline Header */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {photoType.charAt(0).toUpperCase() + photoType.slice(1)} Photo Timeline
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {totalPhotos} photo{totalPhotos !== 1 ? 's' : ''} across {sortedMonths.length} month{sortedMonths.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

          {sortedMonths.map((monthKey, monthIndex) => {
            const photos = timeline[monthKey];
            
            return (
              <div key={monthKey} className="relative mb-12">
                {/* Month Marker */}
                <div className="flex items-center mb-6">
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatMonthYear(monthKey)}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {photos.length} photo{photos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Photos for this month */}
                <div className="ml-24 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {photos.map((photo, photoIndex) => (
                    <div
                      key={photo.id}
                      className="group cursor-pointer"
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
                        <Image
                          src={photo.thumbnailUrl || photo.cloudUrl}
                          alt={`${photoType} photo`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                        </div>

                        {/* Date Badge */}
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {formatDate(photo.uploadDate)}
                        </div>
                      </div>
                      
                      {photo.notes && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {photo.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Photo Modal */}
      {showModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {photoType.charAt(0).toUpperCase() + photoType.slice(1)} Photo - {formatDate(selectedPhoto.uploadDate)}
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
                  alt={`${photoType} photo`}
                  width={800}
                  height={600}
                  className="rounded-lg object-contain max-h-96 w-full"
                />
              </div>
              
              {selectedPhoto.notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes:</h4>
                  <p className="text-gray-900 dark:text-white">{selectedPhoto.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end">
                <a
                  href={selectedPhoto.cloudUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Full Size
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}