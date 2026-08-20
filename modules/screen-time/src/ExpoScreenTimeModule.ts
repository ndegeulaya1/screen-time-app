import { NativeModule, requireOptionalNativeModule } from 'expo';

import type {
  AppUsage,
  DeviceAdminOpenResult,
  InstalledApp,
  LimitWatchResult,
  LockDeviceResult,
  NativeStatus,
  SleepScheduleResult,
} from './ExpoScreenTime.types';

declare class ExpoScreenTimeNativeModule extends NativeModule {
  getInstalledApps(): Promise<InstalledApp[]>;
  getUsageToday(): Promise<AppUsage[]>;
  getUsageForApp(packageName: string): Promise<AppUsage>;
  hasUsagePermission(): Promise<boolean>;
  openUsageSettings(): Promise<void>;
  hasOverlayPermission(): Promise<boolean>;
  openOverlaySettings(): Promise<void>;
  hasNotificationPermission(): Promise<boolean>;
  requestNotificationPermission(): Promise<boolean>;
  restrictApp(packageName: string): Promise<{ restricted: boolean; packageName: string }>;
  unrestrictApp(packageName: string): Promise<{ restricted: boolean; packageName: string }>;
  startLimitWatch(packageName: string, limitMs: number): Promise<LimitWatchResult>;
  stopLimitWatch(): Promise<void>;
  scheduleSleepMode(startMs: number, endMs: number): Promise<SleepScheduleResult>;
  cancelSleepMode(): Promise<void>;
  scheduleTestNotification(fireAtMs: number): Promise<{ fireAtMs: number }>;
  lockDevice(): Promise<LockDeviceResult>;
  openDeviceAdminSettings(): Promise<DeviceAdminOpenResult>;
  getNativeStatus(): Promise<NativeStatus>;
}

export default requireOptionalNativeModule<ExpoScreenTimeNativeModule>('ExpoScreenTime');
