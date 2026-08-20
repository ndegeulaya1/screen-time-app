import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Loading } from '@/components/feedback/Loading';
import { Screen } from '@/components/layout/Screen';
import { useAppLimits } from '@/hooks/useAppLimits';
import { useScreenTime } from '@/hooks/useScreenTime';
import { useSleepSchedule } from '@/hooks/useSleepSchedule';
import { useTheme } from '@/hooks/use-theme';
import { getInstalledApps } from '@/services/screen-time';
import { formatDuration } from '@/utils/limits';

export default function ConfigureScreen() {
  const theme = useTheme();
  const { enabled, start, end, save } = useSleepSchedule();
  const { limits } = useAppLimits();
  const { apps, isLoading, error, refresh } = useScreenTime();
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState<{ packageName: string; name: string }[]>([]);

  useEffect(() => {
    getInstalledApps()
      .then((installed) =>
        setCatalog(installed.map((app) => ({ packageName: app.packageName, name: app.name }))),
      )
      .catch(() => undefined);
  }, []);

  const rows = useMemo(() => {
    const usageByPackage = new Map(apps.map((app) => [app.packageName, app.durationMs]));
    const merged = catalog.map((app) => ({
      ...app,
      durationMs: usageByPackage.get(app.packageName) ?? 0,
      limit: limits.find((limit) => limit.packageName === app.packageName),
    }));

    const filtered = query.trim()
      ? merged.filter((app) => app.name.toLowerCase().includes(query.trim().toLowerCase()))
      : merged;

    return filtered
      .sort((a, b) => {
        const aPinned = a.limit ? 1 : 0;
        const bPinned = b.limit ? 1 : 0;
        if (aPinned !== bPinned) {
          return bPinned - aPinned;
        }
        return b.durationMs - a.durationMs;
      })
      .slice(0, query.trim() ? 40 : 20);
  }, [apps, catalog, limits, query]);

  return (
    <Screen title="Configure" subtitle="Sleep and daily app limits. Enforcement stays native.">
      <View>
        <Text style={[styles.section, { color: theme.text }]}>Sleep</Text>
        <View style={styles.sleepRow}>
          <Text style={[styles.sleepLabel, { color: theme.text }]}>Enabled</Text>
          <Switch
            value={enabled}
            onValueChange={(value) => save({ enabled: value, start, end })}
            trackColor={{ true: theme.accent }}
          />
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push('/sleep')}>
          <Text style={[styles.sleepTime, { color: theme.text }]}>
            {start} → {end}
          </Text>
          <Text style={{ color: theme.textSecondary }}>Every day. Tap to change.</Text>
        </Pressable>
      </View>

      <View>
        <Text style={[styles.section, { color: theme.text }]}>App limits</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search apps"
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.search,
            { color: theme.text, borderBottomColor: theme.line },
          ]}
        />
        {isLoading ? <Loading /> : null}
        {error ? <ErrorState message={error} onRetry={refresh} /> : null}
        {!isLoading && !error && rows.length === 0 ? (
          <EmptyState message="No apps match that search." />
        ) : null}
        {rows.map((app) => (
          <Pressable
            key={app.packageName}
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: '/apps/[id]',
                params: { id: app.packageName, name: app.name },
              })
            }
            style={[styles.appRow, { borderBottomColor: theme.line }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.appName, { color: theme.text }]}>{app.name}</Text>
              <Text style={{ color: theme.textSecondary }}>
                {formatDuration(app.durationMs)} today
                {app.limit ? ` · limit ${formatDuration(app.limit.limitMs)}` : ''}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: 13,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sleepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sleepLabel: {
    fontSize: 17,
  },
  sleepTime: {
    fontSize: 32,
    fontWeight: '500',
    marginBottom: 4,
  },
  search: {
    fontSize: 17,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  appRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  appName: {
    fontSize: 17,
    marginBottom: 2,
  },
});
