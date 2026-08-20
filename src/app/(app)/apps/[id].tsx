import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Stepper } from '@/components/ui/Stepper';
import { useAppLimits } from '@/hooks/useAppLimits';
import { useScreenTime } from '@/hooks/useScreenTime';
import { useTheme } from '@/hooks/use-theme';
import { formatDuration } from '@/utils/limits';
import { hoursAndMinutesFromMs, msFromHoursAndMinutes } from '@/utils/schedule';

export default function AppLimitScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id: string; name?: string }>();
  const packageName = Array.isArray(params.id) ? params.id[0] : params.id;
  const passedName = Array.isArray(params.name) ? params.name[0] : params.name;
  const { limits, saveLimit, deleteLimit } = useAppLimits();
  const { apps } = useScreenTime();
  const existing = limits.find((limit) => limit.packageName === packageName);
  const usage = apps.find((app) => app.packageName === packageName);
  const name = passedName ?? existing?.name ?? packageName ?? 'App';
  const initial = hoursAndMinutesFromMs(existing?.limitMs ?? 60 * 60 * 1000);
  const [hours, setHours] = useState(initial.hours);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [enabled, setEnabled] = useState(existing?.enabled ?? true);

  const limitMs = useMemo(() => msFromHoursAndMinutes(hours, minutes), [hours, minutes]);

  if (!packageName) {
    return (
      <Screen title="App limit">
        <Text style={{ color: theme.text }}>Missing app.</Text>
      </Screen>
    );
  }

  return (
    <Screen title={name} subtitle={usage ? `${formatDuration(usage.durationMs)} today` : 'Set a daily limit'}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.text }]}>Enabled</Text>
        <Switch value={enabled} onValueChange={setEnabled} trackColor={{ true: theme.accent }} />
      </View>

      <View style={styles.steppers}>
        <Stepper label="Hours" value={hours} min={0} max={12} onChange={setHours} />
        <Stepper label="Minutes" value={minutes} min={0} max={59} onChange={setMinutes} />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={async () => {
          await saveLimit({
            packageName,
            name,
            limitMs,
            enabled,
          });
          router.back();
        }}
        style={[styles.save, { backgroundColor: theme.accent }]}>
        <Text style={styles.saveText}>Save limit</Text>
      </Pressable>

      {existing ? (
        <Pressable
          accessibilityRole="button"
          onPress={async () => {
            await deleteLimit(packageName);
            router.back();
          }}>
          <Text style={[styles.remove, { color: theme.textSecondary }]}>Remove limit</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 17,
  },
  steppers: {
    gap: 16,
  },
  save: {
    marginTop: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 999,
  },
  saveText: {
    color: '#0B0B0C',
    fontSize: 17,
    fontWeight: '600',
  },
  remove: {
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 16,
  },
});
