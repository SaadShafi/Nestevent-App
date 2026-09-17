import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { haptic } from '@/lib/haptics';
import { colors, layout, radius, typography } from '@/theme';

import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'white' | 'outline' | 'outlinePrimary' | 'ghost' | 'surface' | 'danger' | 'success';
type Size = 'lg' | 'md' | 'sm';

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  title?: string;
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: Size;
  loading?: boolean;
  left?: ReactNode;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  textColor?: string;
};

const HEIGHT: Record<Size, number> = { lg: layout.buttonHeight, md: 46, sm: 36 };

export function Button({
  title,
  children,
  variant = 'primary',
  size = 'lg',
  loading,
  left,
  right,
  style,
  fullWidth = true,
  disabled,
  textColor,
  onPress,
  ...rest
}: ButtonProps) {
  const v = VARIANTS[variant];
  const fg = textColor ?? v.fg;
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={(e) => {
        haptic.light();
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.base,
        { height: HEIGHT[size], backgroundColor: v.bg, borderColor: v.border, borderWidth: v.border ? 1.5 : 0 },
        fullWidth ? styles.full : styles.auto,
        size === 'sm' && styles.sm,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {left ? <View style={styles.adornment}>{left}</View> : null}
          {title ? (
            <AppText
              style={[typography.button, size === 'sm' && styles.smText, { color: fg }]}
              numberOfLines={1}>
              {title}
            </AppText>
          ) : (
            children
          )}
          {right ? <View style={styles.adornment}>{right}</View> : null}
        </View>
      )}
    </Pressable>
  );
}

const VARIANTS: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.primary, fg: colors.white },
  white: { bg: colors.white, fg: '#0F172A' },
  outline: { bg: 'transparent', fg: colors.white, border: colors.white },
  outlinePrimary: { bg: 'transparent', fg: colors.primary, border: colors.primary },
  ghost: { bg: 'transparent', fg: colors.white },
  surface: { bg: colors.surface, fg: colors.white },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  success: { bg: colors.successSoft, fg: colors.success },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  full: { alignSelf: 'stretch' },
  auto: { alignSelf: 'flex-start' },
  sm: { paddingHorizontal: 14 },
  smText: { fontSize: 13, lineHeight: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  adornment: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
});
