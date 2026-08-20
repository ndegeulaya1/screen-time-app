import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function Loading() {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={theme.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 24,
    alignItems: 'flex-start',
  },
});
