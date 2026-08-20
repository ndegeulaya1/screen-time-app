import { Platform } from 'react-native';

import native from '../../modules/screen-time';

import type {
  AppUsage,
  DeviceAdminOpenResult,
  InstalledApp,
  LimitWatchResult,
  LockDeviceResult,
  NativeStatus,
  SleepScheduleResult,
} from '../../modules/screen-time';

function requireNative() {
  if (Platform.OS !== 'android' || !native) {
    throw new Error('Screen Time native module is Android-only and requires a development build.');
  }

  return native;
}

export async function getInstalledApps(): Promise<InstalledApp[]> {
  return requireNative().getInstalledApps();
}

export async function getUsageToday(): Promise<AppUsage[]> {
  return requireNative().getUsageToday();
}

export async function getUsageForApp(packageName: string): Promise<AppUsage> {
  return requireNative().getUsageForApp(packageName);
}

export async function hasUsagePermission(): Promise<boolean> {
  return requireNative().hasUsagePermission();
}

export async function openUsageSettings(): Promise<void> {
  return requireNative().openUsageSettings();
}

export async function hasOverlayPermission(): Promise<boolean> {
  return requireNative().hasOverlayPermission();
}

export async function openOverlaySettings(): Promise<void> {
  return requireNative().openOverlaySettings();
}

export async function hasNotificationPermission(): Promise<boolean> {
  return requireNative().hasNotificationPermission();
}

export async function requestNotificationPermission(): Promise<boolean> {
  return requireNative().requestNotificationPermission();
}

export async function restrictApp(packageName: string) {
  return requireNative().restrictApp(packageName);
}

export async function unrestrictApp(packageName: string) {
  return requireNative().unrestrictApp(packageName);
}

export async function startLimitWatch(
  packageName: string,
  limitMs: number,
): Promise<LimitWatchResult> {
  return requireNative().startLimitWatch(packageName, limitMs);
}

export async function stopLimitWatch(): Promise<void> {
  return requireNative().stopLimitWatch();
}

export async function scheduleSleepMode(
  startMs: number,
  endMs: number,
): Promise<SleepScheduleResult> {
  return requireNative().scheduleSleepMode(startMs, endMs);
}

export async function cancelSleepMode(): Promise<void> {
  return requireNative().cancelSleepMode();
}

export async function scheduleTestNotification(fireAtMs: number) {
  return requireNative().scheduleTestNotification(fireAtMs);
}

export async function lockDevice(): Promise<LockDeviceResult> {
  return requireNative().lockDevice();
}

export async function openDeviceAdminSettings(): Promise<DeviceAdminOpenResult> {
  return requireNative().openDeviceAdminSettings();
}

export async function getNativeStatus(): Promise<NativeStatus> {
  return requireNative().getNativeStatus();
}

export type {
  AppUsage,
  DeviceAdminOpenResult,
  InstalledApp,
  LimitWatchResult,
  LockDeviceResult,
  NativeStatus,
  SleepScheduleResult,
};
