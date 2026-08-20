import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  title: string;
  value?: string;
  onPress?: () => void;
  children?: ReactNode;
};

export function Row({ title, value, onPress, children }: Props) {
  const theme = useTheme();
  const content = (
    <View style={[styles.row, { borderBottomColor: theme.line }]}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {children ??
        (value ? <Text style={[styles.value, { color: theme.textSecondary }]}>{value}</Text> : null)}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  title: {
    fontSize: 17,
    flex: 1,
  },
  value: {
    fontSize: 16,
  },
});
