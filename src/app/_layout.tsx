import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useHydrateStores } from '@/hooks/useHydrateStores';
import { useSyncNativeConfig } from '@/hooks/useSyncNativeConfig';
import { useTheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const ready = useHydrateStores();
  const theme = useTheme();
  useSyncNativeConfig(ready);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}>
      <Stack.Screen name="(app)" />
      <Stack.Screen
        name="poc"
        options={{
          headerShown: true,
          title: 'Developer POC',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
