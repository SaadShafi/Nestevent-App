import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { haptic } from '@/lib/haptics';
import { colors, hitSlop } from '@/theme';

import { Icon, type IoniconName } from './Icon';

type Props = {
  /** Ionicons name; or pass children for a custom glyph */
  name?: IoniconName;
  children?: ReactNode;
  size?: number;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  badge?: boolean | number;
  accessibilityLabel?: string;
};

/** Circular icon button used for back / notification / share buttons across the app. */
export function IconButton({
  name,
  children,
  size = 44,
  iconSize = 20,
  color = colors.text,
  backgroundColor = colors.surface,
  borderColor,
  onPress,
  style,
  badge,
  accessibilityLabel,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={hitSlop}
      onPress={() => {
        haptic.light();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderWidth: borderColor ? 1 : 0,
          borderColor,
        },
        pressed && styles.pressed,
        style,
      ]}>
      {name ? <Icon name={name} size={iconSize} color={color} /> : children}
      {badge ? (
        <View style={styles.badge}>
          {typeof badge === 'number' ? null : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
  badge: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.bg,
  },
});
