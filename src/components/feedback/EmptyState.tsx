import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function EmptyState({ message }: { message: string }) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={{ color: theme.textSecondary }}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: Spacing.two,
  },
});
