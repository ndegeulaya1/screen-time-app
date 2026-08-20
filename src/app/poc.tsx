import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  cancelSleepMode,
  getInstalledApps,
  getNativeStatus,
  getUsageForApp,
  getUsageToday,
  lockDevice,
  openDeviceAdminSettings,
  openOverlaySettings,
  openUsageSettings,
  requestNotificationPermission,
  scheduleSleepMode,
  scheduleTestNotification,
  startLimitWatch,
  stopLimitWatch,
  type NativeStatus,
} from '@/services/screen-time';
import {
  TEST_LIMIT_MS,
  calculateRemainingTime,
  formatDuration,
  getUsagePercentage,
  hasExceededLimit,
} from '@/utils/limits';

const PREFERRED_TEST_APPS = [
  'com.google.android.youtube',
  'com.android.chrome',
  'com.instagram.android',
];

function mark(value: boolean | undefined) {
  if (value == null) {
    return '—';
  }
  return value ? '✓' : '✗';
}

export default function PocScreen() {
  const [status, setStatus] = useState<NativeStatus | null>(null);
  const [log, setLog] = useState('Developer harness. Overlay is the V1 lock. Device Admin is optional.');
  const [busy, setBusy] = useState(false);

  const appendLog = useCallback((value: unknown) => {
    const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    setLog((current) => `${new Date().toLocaleTimeString()}\n${text}\n\n${current}`);
  }, []);

  const run = useCallback(
    async (label: string, action: () => Promise<unknown>) => {
      setBusy(true);
      try {
        const result = await action();
        appendLog({ test: label, result });
        const nextStatus = await getNativeStatus().catch(() => null);
        if (nextStatus) {
          setStatus(nextStatus);
        }
      } catch (error) {
        appendLog({
          test: label,
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setBusy(false);
      }
    },
    [appendLog],
  );

  const refreshStatus = useCallback(() => {
    run('getNativeStatus', getNativeStatus);
  }, [run]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>SCREEN TIME POC</Text>
        <Text style={styles.subtitle}>
          Overlay restriction is the production lock. Device Admin may be hidden on Samsung.
        </Text>

        <Text style={styles.section}>Permissions</Text>
        <Text style={styles.row}>Usage Access {mark(status?.usagePermission)}</Text>
        <Text style={styles.row}>Restriction / Overlay {mark(status?.overlayPermission)}</Text>
        <Text style={styles.row}>Notifications {mark(status?.notificationPermission)}</Text>
        <Text style={styles.row}>Exact alarms {mark(status?.exactAlarmPermission)}</Text>
        <Text style={styles.row}>Device admin {mark(status?.deviceAdminActive)}</Text>

        <View style={styles.actions}>
          <Action title="Refresh Status" disabled={busy} onPress={refreshStatus} />
          <Action
            title="Allow Usage Access"
            disabled={busy}
            onPress={() => run('openUsageSettings', openUsageSettings)}
          />
          <Action
            title="Allow Overlay"
            disabled={busy}
            onPress={() => run('openOverlaySettings', openOverlaySettings)}
          />
          <Action
            title="Allow Notifications"
            disabled={busy}
            onPress={() => run('requestNotificationPermission', requestNotificationPermission)}
          />
          <Action
            title="Enable Device Admin (optional)"
            disabled={busy}
            onPress={() => run('openDeviceAdminSettings', openDeviceAdminSettings)}
          />
          <Action
            title="Test Usage"
            disabled={busy}
            onPress={() =>
              run('getUsageToday', async () => {
                const usage = await getUsageToday();
                return usage.slice(0, 8).map((item) => ({
                  ...item,
                  duration: formatDuration(item.durationMs),
                }));
              })
            }
          />
          <Action
            title="Test Installed Apps"
            disabled={busy}
            onPress={() =>
              run('getInstalledApps', async () => {
                const apps = await getInstalledApps();
                return { count: apps.length, sample: apps.slice(0, 12) };
              })
            }
          />
          <Action
            title="Test Notification (10s)"
            disabled={busy}
            onPress={() =>
              run('scheduleTestNotification', async () => {
                const fireAtMs = Date.now() + 10_000;
                await scheduleTestNotification(fireAtMs);
                return 'Notification scheduled in 10s.';
              })
            }
          />
          <Action
            title="Test Sleep (now + 2m → +5m)"
            disabled={busy}
            onPress={() =>
              run('scheduleSleepMode', async () => {
                const startMs = Date.now() + 2 * 60 * 1000;
                const endMs = Date.now() + 5 * 60 * 1000;
                return scheduleSleepMode(startMs, endMs);
              })
            }
          />
          <Action title="Cancel Sleep" disabled={busy} onPress={() => run('cancelSleepMode', cancelSleepMode)} />
          <Action
            title="Test Restriction (2 min watch)"
            disabled={busy}
            onPress={() =>
              run('startLimitWatch', async () => {
                const apps = await getInstalledApps();
                const target =
                  PREFERRED_TEST_APPS.map((packageName) =>
                    apps.find((app) => app.packageName === packageName),
                  ).find(Boolean) ??
                  apps.find((app) => !app.isSystem) ??
                  apps[0];

                if (!target) {
                  throw new Error('No installed launcher app found to restrict.');
                }

                const usage = await getUsageForApp(target.packageName);
                const remaining = calculateRemainingTime(usage.durationMs, TEST_LIMIT_MS);
                const result = await startLimitWatch(target.packageName, TEST_LIMIT_MS);

                return {
                  target,
                  currentUsage: formatDuration(usage.durationMs),
                  remaining: formatDuration(remaining),
                  percent: `${getUsagePercentage(usage.durationMs, TEST_LIMIT_MS).toFixed(0)}%`,
                  exceeded: hasExceededLimit(usage.durationMs, TEST_LIMIT_MS),
                  native: result,
                };
              })
            }
          />
          <Action title="Stop Limit Watch" disabled={busy} onPress={() => run('stopLimitWatch', stopLimitWatch)} />
          <Action title="Test Lock" disabled={busy} onPress={() => run('lockDevice', lockDevice)} />
        </View>

        <Text style={styles.section}>Native Logs</Text>
        <Text style={styles.log}>{log}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Action({
  title,
  disabled,
  onPress,
}: {
  title: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0B0B0C',
  },
  content: {
    padding: 16,
    gap: 8,
  },
  title: {
    color: '#F5F1E8',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#8A8680',
    marginBottom: 8,
  },
  section: {
    color: '#F5F1E8',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  row: {
    color: '#dddddd',
    fontFamily: 'monospace',
  },
  actions: {
    gap: 8,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#C4A574',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#0B0B0C',
    fontWeight: '600',
    textAlign: 'center',
  },
  log: {
    color: '#9BE7C4',
    fontFamily: 'monospace',
    fontSize: 12,
    marginTop: 8,
  },
});
