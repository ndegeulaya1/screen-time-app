import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function ProgressBar({ progress }: { progress: number }) {
  const theme = useTheme();
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            backgroundColor: theme.accent,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 3,
    width: '100%',
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 99,
  },
});
