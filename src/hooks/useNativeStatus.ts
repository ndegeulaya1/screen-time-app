import { useCallback, useEffect, useState } from 'react';

import { getNativeStatus, type NativeStatus } from '@/services/screen-time';

export function useNativeStatus() {
  const [status, setStatus] = useState<NativeStatus | null>(null);

  const refresh = useCallback(async () => {
    try {
      setStatus(await getNativeStatus());
    } catch {
      setStatus(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status, refresh };
}
