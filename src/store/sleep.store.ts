import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { DEFAULT_SLEEP, SleepScheduleSchema, type SleepSchedule } from '@/schemas/sleep.schema';

const STORAGE_KEY = 'screen-time.sleep';

type SleepStore = SleepSchedule & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setSchedule: (next: SleepSchedule) => Promise<void>;
};

async function persist(schedule: SleepSchedule) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
}

export const useSleepStore = create<SleepStore>((set, get) => ({
  ...DEFAULT_SLEEP,
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) {
      return;
    }

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = SleepScheduleSchema.parse(JSON.parse(raw));
        set({ ...parsed, hydrated: true });
        return;
      }
    } catch {
      await persist(DEFAULT_SLEEP);
    }

    set({ hydrated: true });
  },
  setSchedule: async (next) => {
    const parsed = SleepScheduleSchema.parse(next);
    set(parsed);
    await persist(parsed);
  },
}));
