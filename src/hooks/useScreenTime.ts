import { useCallback, useEffect, useState } from 'react';

import { getUsageToday, type AppUsage } from '@/services/screen-time';

export function useScreenTime() {
  const [apps, setApps] = useState<AppUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const usage = await getUsageToday();
      setApps(usage);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not read usage.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalTime = apps.reduce((sum, app) => sum + app.durationMs, 0);

  return {
    apps,
    totalTime,
    isLoading,
    error,
    refresh,
  };
}
