import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IoniconName } from './Icon';

type Props = {
  title: string;
  subtitle?: string;
  icon?: IoniconName;
  iconColor?: string;
  iconBg?: string;
  left?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  danger?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Settings-style pill row (Edit Profile / Change Password / Push Notifications / Delete Account).
 * Fixed height with every child vertically centered so text and toggles always sit on one line.
 */
export function ListRow({ title, subtitle, icon, iconColor, iconBg, left, right, onPress, chevron, danger, style }: Props) {
  const color = danger ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, subtitle ? styles.rowTall : null, danger && styles.danger, pressed && onPress && styles.pressed, style]}>
      {left ? (
        <View style={styles.center}>{left}</View>
      ) : icon ? (
        <View style={[styles.iconWrap, iconBg ? { backgroundColor: iconBg } : null]}>
          <Icon name={icon} size={20} color={iconColor ?? (danger ? colors.danger : colors.primary)} />
        </View>
      ) : null}
      <View style={styles.text}>
        <AppText variant="bodyMedium" color={color} numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" secondary numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ? <View style={styles.center}>{right}</View> : null}
      {chevron ? <Icon name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 10,
  },
  rowTall: { height: 64 },
  danger: { backgroundColor: colors.dangerSoft },
  pressed: { opacity: 0.85 },
  center: { justifyContent: 'center', alignItems: 'center' },
  iconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,107,0,0.12)' },
  text: { flex: 1, justifyContent: 'center' },
});
