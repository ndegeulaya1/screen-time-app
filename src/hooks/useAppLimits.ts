'use no memo';

import { useCallback } from 'react';

import { startLimitWatch, unrestrictApp } from '@/services/screen-time';
import type { AppLimit } from '@/schemas/limit.schema';
import { useLimitsStore } from '@/store/limits.store';
import { useStoreSelector } from '@/store/use-store-selector';

export function useAppLimits() {
  const limits = useStoreSelector(useLimitsStore, (state) => state.limits);
  const upsertLimit = useStoreSelector(useLimitsStore, (state) => state.upsertLimit);
  const removeLimit = useStoreSelector(useLimitsStore, (state) => state.removeLimit);

  const saveLimit = useCallback(
    async (limit: AppLimit) => {
      await upsertLimit(limit);

      if (limit.enabled) {
        await startLimitWatch(limit.packageName, limit.limitMs);
        return;
      }

      await unrestrictApp(limit.packageName);
    },
    [upsertLimit],
  );

  const deleteLimit = useCallback(
    async (packageName: string) => {
      await removeLimit(packageName);
      await unrestrictApp(packageName);
    },
    [removeLimit],
  );

  return {
    limits,
    saveLimit,
    deleteLimit,
  };
}
