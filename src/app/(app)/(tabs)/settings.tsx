import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Row } from '@/components/ui/Row';
import { useNativeStatus } from '@/hooks/useNativeStatus';
import { useSettingsStore } from '@/store/settings.store';
import { useStoreSelector } from '@/store/use-store-selector';
import { useTheme } from '@/hooks/use-theme';
import {
  openDeviceAdminSettings,
  openOverlaySettings,
  openUsageSettings,
  requestNotificationPermission,
} from '@/services/screen-time';
import { formatDuration } from '@/utils/limits';
import { hoursAndMinutesFromMs, msFromHoursAndMinutes } from '@/utils/schedule';

export default function SettingsScreen() {
  const theme = useTheme();
  const { status, refresh } = useNativeStatus();
  const dailyGoalMs = useStoreSelector(useSettingsStore, (state) => state.dailyGoalMs);
  const appearance = useStoreSelector(useSettingsStore, (state) => state.theme);
  const setSettings = useStoreSelector(useSettingsStore, (state) => state.setSettings);
  const { hours, minutes } = hoursAndMinutesFromMs(dailyGoalMs);

  return (
    <Screen title="Settings" subtitle="Permissions and preferences. Overlay is the lock.">
      <View>
        <Text style={[styles.section, { color: theme.text }]}>Permissions</Text>
        <Row
          title="Usage access"
          value={status?.usagePermission ? 'On' : 'Off'}
          onPress={() => openUsageSettings().then(refresh)}
        />
        <Row
          title="Overlay / restriction"
          value={status?.overlayPermission ? 'On' : 'Off'}
          onPress={() => openOverlaySettings().then(refresh)}
        />
        <Row
          title="Notifications"
          value={status?.notificationPermission ? 'On' : 'Off'}
          onPress={() => requestNotificationPermission().then(refresh)}
        />
        <Row
          title="Device Admin"
          value={status?.deviceAdminActive ? 'On' : 'Optional'}
          onPress={async () => {
            const result = await openDeviceAdminSettings();
            await refresh();
            Alert.alert(
              'Device Admin',
              result.note,
            );
          }}
        />
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Bedtime and app limits use overlay restriction. Device Admin is extra and may be hidden on
          Samsung.
        </Text>
      </View>

      <View>
        <Text style={[styles.section, { color: theme.text }]}>Screen Time</Text>
        <Row
          title="Daily goal"
          value={formatDuration(dailyGoalMs)}
          onPress={() => {
            const nextHours = hours >= 6 ? 1 : hours + 1;
            setSettings({
              dailyGoalMs: msFromHoursAndMinutes(nextHours, minutes),
            });
          }}
        />
        <Row title="Limit warnings" value="Coming in a later build" />
      </View>

      <View>
        <Text style={[styles.section, { color: theme.text }]}>Appearance</Text>
        <Row
          title="Theme"
          value={appearance === 'dark' ? 'Dark' : 'System'}
          onPress={() => setSettings({ theme: appearance === 'dark' ? 'system' : 'dark' })}
        />
      </View>

      <View>
        <Text style={[styles.section, { color: theme.text }]}>About</Text>
        <Row title="Privacy" value="Usage stays on this phone" />
        <Row title="Version" value="0.1.0" />
      </View>

      <View>
        <Text style={[styles.section, { color: theme.text }]}>Developer</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/poc')}>
          <Text style={[styles.link, { color: theme.accent }]}>Open native POC harness</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  link: {
    fontSize: 17,
    paddingVertical: 16,
  },
});
