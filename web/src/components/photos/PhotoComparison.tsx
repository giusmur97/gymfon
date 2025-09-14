'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Photo {
  id: string;
  type: 'front' | 'back' | 'side' | 'progress';
  cloudUrl: string;
  thumbnailUrl?: string;
  uploadDate: string;
  notes?: string;
}

interface PhotoComparisonProps {
  clientId: string;
  photoType?: 'front' | 'back' | 'side' | 'progress';
}

interface ComparisonData {
  before: Photo;
  after: Photo;
  timeDifference: {
    days: number;
    weeks: number;
    months: number;
  };
}

export default function PhotoComparison({ clientId, photoType = 'front' }: PhotoComparisonProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedBefore, setSelectedBefore] = useState<Photo | null>(null);
  const [selectedAfter, setSelectedAfter] = useState<Photo | null>(null);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [clientId, photoType]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/photos/${clientId}?type=${photoType}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }

      const result = await response.json();
      if (result.success) {
        const sortedPhotos = result.photos.sort((a: Photo, b: Photo) => 
          new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
        );
        setPhotos(sortedPhotos);
        
        // Auto-select first and last photos if available
        if (sortedPhotos.length >= 2) {
          setSelectedBefore(sortedPhotos[0]);
          setSelectedAfter(sortedPhotos[sortedPhotos.length - 1]);
        }
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!selectedBefore || !selectedAfter) {
      alert('Please select both before and after photos');
      return;
    }

    if (selectedBefore.id === selectedAfter.id) {
      alert('Please select different photos for comparison');
      return;
    }

    try {
      setComparing(true);
      const response = await fetch('/api/photos/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          clientId,
          beforePhotoId: selectedBefore.id,
          afterPhotoId: selectedAfter.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to compare photos');
      }

      const result = await response.json();
      if (result.success) {
        setComparison(result.comparison);
      }
    } catch (error) {
      console.error('Error comparing photos:', error);
      alert('Failed to compare photos');
    } finally {
      setComparing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading photos...</span>
      </div>
    );
  }

  if (photos.length < 2) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          At least 2 {photoType} photos are needed for comparison
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Photo Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Before Photo Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Before Photo
          </h3>
          <div className="space-y-3">
            {photos.map((photo) => (
              <div
                key={`before-${photo.id}`}
                className={`
                  flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors
                  ${selectedBefore?.id === photo.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500' 
                    : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                onClick={() => setSelectedBefore(photo)}
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <Image
                    src={photo.thumbnailUrl || photo.cloudUrl}
                    alt="Photo thumbnail"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(photo.uploadDate)}
                  </p>
                  {photo.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {photo.notes}
                    </p>
                  )}
                </div>
                {selectedBefore?.id === photo.id && (
                  <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* After Photo Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            After Photo
          </h3>
          <div className="space-y-3">
            {photos.map((photo) => (
              <div
                key={`after-${photo.id}`}
                className={`
                  flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors
                  ${selectedAfter?.id === photo.id 
                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500' 
                    : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                onClick={() => setSelectedAfter(photo)}
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <Image
                    src={photo.thumbnailUrl || photo.cloudUrl}
                    alt="Photo thumbnail"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(photo.uploadDate)}
                  </p>
                  {photo.notes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {photo.notes}
                    </p>
                  )}
                </div>
                {selectedAfter?.id === photo.id && (
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compare Button */}
      <div className="text-center">
        <button
          onClick={handleCompare}
          disabled={!selectedBefore || !selectedAfter || comparing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {comparing ? 'Comparing...' : 'Compare Photos'}
        </button>
      </div>

      {/* Comparison Result */}
      {comparison && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Progress Comparison
          </h3>
          
          {/* Time Difference */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Time Difference:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {comparison.timeDifference.days} days
                {comparison.timeDifference.weeks > 0 && ` (${comparison.timeDifference.weeks} weeks)`}
                {comparison.timeDifference.months > 0 && ` (${comparison.timeDifference.months} months)`}
              </span>
            </div>
          </div>

          {/* Side by Side Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before Photo */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Before
              </h4>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <Image
                  src={comparison.before.cloudUrl}
                  alt="Before photo"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {formatDate(comparison.before.uploadDate)}
              </p>
              {comparison.before.notes && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {comparison.before.notes}
                </p>
              )}
            </div>

            {/* After Photo */}
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                After
              </h4>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <Image
                  src={comparison.after.cloudUrl}
                  alt="After photo"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {formatDate(comparison.after.uploadDate)}
              </p>
              {comparison.after.notes && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {comparison.after.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}