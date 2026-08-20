export const TEST_LIMIT_MS = 2 * 60 * 1000;

export function hasExceededLimit(usageMs: number, limitMs: number): boolean {
  return usageMs >= limitMs;
}

export function calculateRemainingTime(usageMs: number, limitMs: number): number {
  return Math.max(0, limitMs - usageMs);
}

export function getUsagePercentage(usageMs: number, limitMs: number): number {
  if (limitMs <= 0) {
    return 0;
  }

  return Math.min(100, (usageMs / limitMs) * 100);
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}
