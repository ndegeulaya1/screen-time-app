export function parseClock(value: string): { hours: number; minutes: number } {
  const [hours, minutes] = value.split(':').map((part) => Number(part));
  return { hours, minutes };
}

export function nextOccurrenceMs(clock: string, fromMs = Date.now()): number {
  const { hours, minutes } = parseClock(clock);
  const date = new Date(fromMs);
  date.setHours(hours, minutes, 0, 0);

  if (date.getTime() <= fromMs) {
    date.setDate(date.getDate() + 1);
  }

  return date.getTime();
}

export function nextSleepWindow(start: string, end: string, fromMs = Date.now()) {
  const startMs = nextOccurrenceMs(start, fromMs);
  let endMs = nextOccurrenceMs(end, fromMs);

  if (endMs <= startMs) {
    endMs = nextOccurrenceMs(end, startMs);
  }

  return { startMs, endMs };
}

export function formatClock(value: string): string {
  return value;
}

export function greeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

export function formatLongDate(now = new Date()): string {
  return now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function msUntil(targetMs: number, fromMs = Date.now()): number {
  return Math.max(0, targetMs - fromMs);
}

export function hoursAndMinutesFromMs(ms: number): { hours: number; minutes: number } {
  const totalMinutes = Math.max(1, Math.round(ms / 60_000));
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

export function msFromHoursAndMinutes(hours: number, minutes: number): number {
  return Math.max(60_000, (hours * 60 + minutes) * 60_000);
}
