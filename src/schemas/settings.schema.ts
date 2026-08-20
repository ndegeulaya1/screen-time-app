import { z } from 'zod';

export const AppSettingsSchema = z.object({
  dailyGoalMs: z.number().int().positive(),
  theme: z.enum(['system', 'dark']),
});

export type AppSettings = z.infer<typeof AppSettingsSchema>;

export const DEFAULT_SETTINGS: AppSettings = {
  dailyGoalMs: 4 * 60 * 60 * 1000,
  theme: 'dark',
};
