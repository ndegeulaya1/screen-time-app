import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { AppSettingsSchema, DEFAULT_SETTINGS, type AppSettings } from '@/schemas/settings.schema';

const STORAGE_KEY = 'screen-time.settings';

type SettingsStore = AppSettings & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setSettings: (next: Partial<AppSettings>) => Promise<void>;
};

async function persist(settings: AppSettings) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULT_SETTINGS,
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) {
      return;
    }

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = AppSettingsSchema.parse(JSON.parse(raw));
        set({ ...parsed, hydrated: true });
        return;
      }
    } catch {
      await persist(DEFAULT_SETTINGS);
    }

    set({ hydrated: true });
  },
  setSettings: async (next) => {
    const parsed = AppSettingsSchema.parse({
      dailyGoalMs: next.dailyGoalMs ?? get().dailyGoalMs,
      theme: next.theme ?? get().theme,
    });
    set(parsed);
    await persist(parsed);
  },
}));
