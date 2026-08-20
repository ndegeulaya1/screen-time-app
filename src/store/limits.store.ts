import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { AppLimitsSchema, type AppLimit } from '@/schemas/limit.schema';

const STORAGE_KEY = 'screen-time.limits';

type LimitsStore = {
  limits: AppLimit[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  upsertLimit: (limit: AppLimit) => Promise<void>;
  removeLimit: (packageName: string) => Promise<void>;
};

async function persist(limits: AppLimit[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(limits));
}

export const useLimitsStore = create<LimitsStore>((set, get) => ({
  limits: [],
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) {
      return;
    }

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({ limits: AppLimitsSchema.parse(JSON.parse(raw)), hydrated: true });
        return;
      }
    } catch {
      await persist([]);
    }

    set({ hydrated: true });
  },
  upsertLimit: async (limit) => {
    const limits = [...get().limits.filter((item) => item.packageName !== limit.packageName), limit];
    set({ limits });
    await persist(limits);
  },
  removeLimit: async (packageName) => {
    const limits = get().limits.filter((item) => item.packageName !== packageName);
    set({ limits });
    await persist(limits);
  },
}));
