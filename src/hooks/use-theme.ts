'use no memo';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettingsStore } from '@/store/settings.store';
import { useStoreSelector } from '@/store/use-store-selector';
import { Colors } from '@/constants/theme';

export function useTheme() {
  const scheme = useColorScheme();
  const preference = useStoreSelector(useSettingsStore, (state) => state.theme);
  const resolved = preference === 'system' ? (scheme === 'light' ? 'light' : 'dark') : preference;
  return Colors[resolved];
}
