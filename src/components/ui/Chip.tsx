import { type ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Show an "x" when selected (Choose Interests) */
  removable?: boolean;
  left?: ReactNode;
  style?: StyleProp<ViewStyle>;
  size?: 'md' | 'sm';
  /** Red variant (Report → Other) */
  danger?: boolean;
};

export function Chip({ label, selected, onPress, removable, left, style, size = 'md', danger }: Props) {
  const bg = selected ? (danger ? colors.danger : colors.primary) : colors.surface;
  return (
    <Pressable
      onPress={() => {
        haptic.selection();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.chip,
        size === 'sm' && styles.sm,
        { backgroundColor: bg },
        pressed && styles.pressed,
        style,
      ]}>
      {left}
      <AppText variant={selected ? 'label' : 'label'} style={[size === 'sm' && styles.smText]}>
        {label}
      </AppText>
      {removable && selected ? <Icon name="close" size={14} color={colors.white} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    height: 42,
    borderRadius: radius.pill,
  },
  sm: { height: 34, paddingHorizontal: 14 },
  smText: { fontSize: 13 },
  pressed: { opacity: 0.8 },
});
