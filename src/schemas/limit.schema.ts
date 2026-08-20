import { z } from 'zod';

export const AppLimitSchema = z.object({
  packageName: z.string().min(1),
  name: z.string().min(1),
  limitMs: z.number().int().positive(),
  enabled: z.boolean(),
});

export const AppLimitsSchema = z.array(AppLimitSchema);

export type AppLimit = z.infer<typeof AppLimitSchema>;
