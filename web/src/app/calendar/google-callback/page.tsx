'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function GoogleCalendarCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      // Handle error
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_CALENDAR_AUTH_ERROR',
          error: error
        }, window.location.origin);
      }
      window.close();
      return;
    }

    if (code) {
      // Send success message to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_CALENDAR_AUTH_SUCCESS',
          code: code
        }, window.location.origin);
      }
      window.close();
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          Connecting to Google Calendar...
        </p>
      </div>
    </div>
  );
}

export default function GoogleCalendarCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    }>
      <GoogleCalendarCallbackContent />
    </Suspense>
  );
}