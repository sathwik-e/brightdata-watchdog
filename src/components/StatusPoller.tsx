'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Polls /api/status every 3 seconds. When the status changes,
 * it triggers a Next.js router refresh so the server component
 * re-renders with fresh data -- no manual browser refresh needed.
 */
export default function StatusPoller() {
  const router = useRouter();
  const [lastStatus, setLastStatus] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/status', { cache: 'no-store' });
        const data = await res.json();

        const statusChanged = lastStatus !== null && data.status !== lastStatus;
        const runChanged = lastRun !== null && data.lastRun !== lastRun;

        if (statusChanged || runChanged) {
          router.refresh();
        }

        setLastStatus(data.status);
        setLastRun(data.lastRun);
      } catch {
        // Silently ignore fetch errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [lastStatus, lastRun, router]);

  return null;
}
