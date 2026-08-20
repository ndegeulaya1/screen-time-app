import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
};

function padded(value: number) {
  return String(value).padStart(2, '0');
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function Stepper({ label, value, min = 0, max = 23, onChange }: Props) {
  const theme = useTheme();
  const [draft, setDraft] = useState(padded(value));

  useEffect(() => {
    setDraft(padded(value));
  }, [value]);

  const commit = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      setDraft(padded(value));
      return;
    }

    const next = clamp(parsed, min, max);
    onChange(next);
    setDraft(padded(next));
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          onPress={() => onChange(clamp(value - 1, min, max))}
          style={[styles.hit, { borderColor: theme.line }]}>
          <Text style={[styles.hitText, { color: theme.text }]}>-</Text>
        </Pressable>
        <TextInput
          accessibilityLabel={label}
          keyboardType="number-pad"
          maxLength={2}
          selectTextOnFocus
          value={draft}
          onChangeText={(text) => setDraft(text.replace(/[^0-9]/g, ''))}
          onBlur={() => commit(draft)}
          onSubmitEditing={() => commit(draft)}
          underlineColorAndroid="transparent"
          selectionColor={theme.accent}
          placeholder="00"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.line }]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          onPress={() => onChange(clamp(value + 1, min, max))}
          style={[styles.hit, { borderColor: theme.line }]}>
          <Text style={[styles.hitText, { color: theme.text }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: Spacing.two,
  },
  label: {
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  input: {
    flex: 1,
    minWidth: 72,
    height: 56,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 32,
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 0,
  },
  hit: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hitText: {
    fontSize: 24,
    marginTop: -2,
  },
});
