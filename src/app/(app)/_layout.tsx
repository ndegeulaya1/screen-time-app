import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function AppGroupLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="sleep" options={{ headerShown: true, title: 'Sleep' }} />
      <Stack.Screen name="apps/[id]" options={{ headerShown: true, title: 'App limit' }} />
    </Stack>
  );
}
