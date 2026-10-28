export function parseClock(value: string): { hours: number; minutes: number } {
  const [hours, minutes] = value.split(':').map((part) => Number(part));
  return { hours, minutes };
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function clockOnDayMs(clock: string, fromMs = Date.now()): number {
  const { hours, minutes } = parseClock(clock);
  const date = new Date(fromMs);
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
}

export function nextOccurrenceMs(clock: string, fromMs = Date.now()): number {
  const today = clockOnDayMs(clock, fromMs);
  return today > fromMs ? today : today + DAY_MS;
}

export function nextSleepWindow(start: string, end: string, fromMs = Date.now()) {
  const startToday = clockOnDayMs(start, fromMs);
  const endToday = clockOnDayMs(end, fromMs);
  const overnight = endToday <= startToday;

  if (!overnight) {
    if (fromMs < endToday) {
      return { startMs: startToday, endMs: endToday };
    }
    return { startMs: startToday + DAY_MS, endMs: endToday + DAY_MS };
  }

  if (fromMs < endToday) {
    return { startMs: startToday - DAY_MS, endMs: endToday };
  }

  return { startMs: startToday, endMs: endToday + DAY_MS };
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
