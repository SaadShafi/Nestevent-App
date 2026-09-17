import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, typography } from '@/theme';

export type TextVariant = keyof typeof typography;

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: string;
  center?: boolean;
  muted?: boolean;
  secondary?: boolean;
};

export function AppText({
  variant = 'body',
  color,
  center,
  muted,
  secondary,
  style,
  ...rest
}: AppTextProps) {
  const resolvedColor = color ?? (muted ? colors.textMuted : secondary ? colors.textSecondary : colors.text);
  return (
    <Text
      {...rest}
      style={[typography[variant], { color: resolvedColor }, center && styles.center, style]}
    />
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});
