import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Loading } from '@/components/feedback/Loading';
import { Screen } from '@/components/layout/Screen';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppLimits } from '@/hooks/useAppLimits';
import { useScreenTime } from '@/hooks/useScreenTime';
import { useSleepSchedule } from '@/hooks/useSleepSchedule';
import { useSettingsStore } from '@/store/settings.store';
import { useStoreSelector } from '@/store/use-store-selector';
import { useTheme } from '@/hooks/use-theme';
import { formatDuration, getUsagePercentage } from '@/utils/limits';
import { formatLongDate, greeting, msUntil } from '@/utils/schedule';

export default function HomeScreen() {
  const theme = useTheme();
  const { apps, totalTime, isLoading, error, refresh } = useScreenTime();
  const dailyGoalMs = useStoreSelector(useSettingsStore, (state) => state.dailyGoalMs);
  const { enabled, start, end, nextWindow } = useSleepSchedule();
  const { limits } = useAppLimits();

  if (isLoading) {
    return (
      <Screen title={greeting()} subtitle={formatLongDate()}>
        <Loading />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title={greeting()} subtitle={formatLongDate()}>
        <ErrorState message={error} onRetry={refresh} />
      </Screen>
    );
  }

  const topApps = apps.slice(0, 5);
  const activeLimits = limits.filter((limit) => limit.enabled);

  return (
    <Screen title={greeting()} subtitle={formatLongDate()}>
      <View>
        <Text style={[styles.kicker, { color: theme.textSecondary }]}>Today’s screen time</Text>
        <Text style={[styles.hero, { color: theme.text }]}>{formatDuration(totalTime)}</Text>
        <Text style={[styles.goal, { color: theme.accent }]}>
          of {formatDuration(dailyGoalMs)} goal
        </Text>
        <View style={styles.bar}>
          <ProgressBar progress={getUsagePercentage(totalTime, dailyGoalMs)} />
        </View>
      </View>

      <View>
        <Text style={[styles.section, { color: theme.text }]}>Most used</Text>
        {topApps.length ? (
          topApps.map((app) => (
            <Pressable
              key={app.packageName}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/apps/[id]',
                  params: { id: app.packageName, name: app.appName },
                })
              }
              style={[styles.appRow, { borderBottomColor: theme.line }]}>
              <Text style={[styles.appName, { color: theme.text }]}>{app.appName}</Text>
              <Text style={[styles.appTime, { color: theme.textSecondary }]}>
                {formatDuration(app.durationMs)}
              </Text>
            </Pressable>
          ))
        ) : (
          <EmptyState message="No usage yet today." />
        )}
      </View>

      <Pressable accessibilityRole="button" onPress={() => router.push('/sleep')}>
        <Text style={[styles.section, { color: theme.text }]}>Sleep</Text>
        <Text style={[styles.sleepTime, { color: theme.text }]}>
          {enabled ? `${start} → ${end}` : 'Not scheduled'}
        </Text>
        <Text style={{ color: theme.textSecondary }}>
          {enabled && nextWindow
            ? `Starts in ${formatDuration(msUntil(nextWindow.startMs))}`
            : 'Set a bedtime from Configure'}
        </Text>
      </Pressable>

      <View>
        <Text style={[styles.section, { color: theme.text }]}>App limits</Text>
        {activeLimits.length ? (
          activeLimits.map((limit) => {
            const usage = apps.find((app) => app.packageName === limit.packageName)?.durationMs ?? 0;
            return (
              <Pressable
                key={limit.packageName}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/apps/[id]',
                    params: { id: limit.packageName, name: limit.name },
                  })
                }
                style={[styles.appRow, { borderBottomColor: theme.line }]}>
                <Text style={[styles.appName, { color: theme.text }]}>{limit.name}</Text>
                <Text style={[styles.appTime, { color: theme.accent }]}>
                  {formatDuration(usage)} / {formatDuration(limit.limitMs)}
                </Text>
              </Pressable>
            );
          })
        ) : (
          <EmptyState message="No limits yet. Add them in Configure." />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  hero: {
    fontSize: 64,
    lineHeight: 70,
    fontWeight: '500',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
    marginTop: 8,
  },
  goal: {
    fontSize: 16,
    marginTop: 4,
  },
  bar: {
    marginTop: 20,
  },
  section: {
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  appRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  appName: {
    fontSize: 17,
    flex: 1,
  },
  appTime: {
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
  sleepTime: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 4,
  },
});
