import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  scroll?: boolean;
};

export function Screen({ children, title, subtitle, scroll = true }: ScreenProps) {
  const theme = useTheme();
  const body = (
    <View style={styles.inner}>
      {title ? (
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.background === '#0B0B0C' ? 'light' : 'dark'} />
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingBottom: Spacing.six,
  },
  inner: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '600',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
});
