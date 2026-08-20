import { z } from 'zod';

export const ClockTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm');

export const SleepScheduleSchema = z.object({
  enabled: z.boolean(),
  start: ClockTimeSchema,
  end: ClockTimeSchema,
});

export type SleepSchedule = z.infer<typeof SleepScheduleSchema>;

export const DEFAULT_SLEEP: SleepSchedule = {
  enabled: false,
  start: '22:30',
  end: '06:30',
};
