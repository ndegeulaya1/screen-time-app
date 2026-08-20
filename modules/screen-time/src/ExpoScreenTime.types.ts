export type InstalledApp = {
  packageName: string;
  name: string;
  isSystem: boolean;
};

export type AppUsage = {
  packageName: string;
  appName: string;
  durationMs: number;
};

export type NativeStatus = {
  platform: 'android';
  usagePermission: boolean;
  overlayPermission: boolean;
  notificationPermission: boolean;
  exactAlarmPermission: boolean;
  deviceAdminActive: boolean;
  restrictedPackages: string[];
  sleepActive: boolean;
  sleepStartMs: number;
  sleepEndMs: number;
  sleepSkipUntilMs: number;
  limitWatchPackage: string | null;
  limitWatchLimitMs: number;
};

export type LimitWatchResult = {
  packageName: string;
  limitMs: number;
  currentUsageMs: number;
  alreadyExceeded: boolean;
};

export type SleepScheduleResult = {
  startMs: number;
  endMs: number;
  exactAlarms: boolean;
};

export type LockDeviceResult = {
  overlayShown: boolean;
  lockNow: boolean;
  lockNowReason: string;
  verdict: string;
};

export type DeviceAdminOpenResult = {
  opened: 'activation' | 'security-settings' | 'unavailable';
  deviceAdminActive: boolean;
  note: string;
};
