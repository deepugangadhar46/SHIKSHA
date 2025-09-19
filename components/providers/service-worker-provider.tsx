"use client"

import { useEffect } from "react"

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registered successfully:', registration.scope);
            
            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60000); // Check every minute
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
      });

      // Listen for online/offline events
      window.addEventListener('online', () => {
        console.log('Back online - syncing data...');
        // Trigger background sync
        if ('sync' in navigator.serviceWorker.registration!) {
          navigator.serviceWorker.ready.then((registration: any) => {
            registration.sync.register('sync-data');
          });
        }
      });

      window.addEventListener('offline', () => {
        console.log('Gone offline - using cached data');
      });
    }
  }, []);

  return <>{children}</>;
}
