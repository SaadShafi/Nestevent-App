import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

import { AppText } from './AppText';

type Props = {
  value: string;
  label: string;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** 'glass' for the header stat tiles over the orange gradient, 'outlined' for marketing stats */
  variant?: 'solid' | 'glass' | 'outlined';
  valueColor?: string;
};

export function StatCard({ value, label, icon, style, variant = 'solid', valueColor }: Props) {
  return (
    <View style={[styles.card, variant === 'glass' && styles.glass, variant === 'outlined' && styles.outlined, style]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <AppText variant="h2" color={valueColor}>{value}</AppText>
      <AppText variant="caption" secondary>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, gap: 2 },
  glass: { backgroundColor: 'rgba(0,0,0,0.35)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  outlined: { backgroundColor: colors.bg, borderWidth: 1, borderColor: '#2C2C3A', borderRadius: radius.md },
  icon: { marginBottom: 8 },
});
