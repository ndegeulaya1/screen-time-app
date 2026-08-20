import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Stepper } from '@/components/ui/Stepper';
import { useSleepSchedule } from '@/hooks/useSleepSchedule';
import { useTheme } from '@/hooks/use-theme';
import { parseClock } from '@/utils/schedule';

export default function SleepScreen() {
  const theme = useTheme();
  const { enabled, start, end, save } = useSleepSchedule();
  const parsedStart = parseClock(start);
  const parsedEnd = parseClock(end);
  const [startHour, setStartHour] = useState(parsedStart.hours);
  const [startMinute, setStartMinute] = useState(parsedStart.minutes);
  const [endHour, setEndHour] = useState(parsedEnd.hours);
  const [endMinute, setEndMinute] = useState(parsedEnd.minutes);

  const format = (hours: number, minutes: number) =>
    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  return (
    <Screen title="Sleep" subtitle="Every night. Overlay starts at bedtime.">
      <View style={styles.block}>
        <Text style={[styles.heading, { color: theme.text }]}>Starts</Text>
        <View style={styles.row}>
          <Stepper label="Hour" value={startHour} min={0} max={23} onChange={setStartHour} />
          <Stepper label="Min" value={startMinute} min={0} max={59} onChange={setStartMinute} />
        </View>
      </View>

      <View style={styles.block}>
        <Text style={[styles.heading, { color: theme.text }]}>Ends</Text>
        <View style={styles.row}>
          <Stepper label="Hour" value={endHour} min={0} max={23} onChange={setEndHour} />
          <Stepper label="Min" value={endMinute} min={0} max={59} onChange={setEndMinute} />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={async () => {
          await save({
            enabled,
            start: format(startHour, startMinute),
            end: format(endHour, endMinute),
          });
          router.back();
        }}
        style={[styles.save, { backgroundColor: theme.accent }]}>
        <Text style={styles.saveText}>Save</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 12,
  },
  heading: {
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  row: {
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
});
