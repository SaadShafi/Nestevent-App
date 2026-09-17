import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { StatCard } from '@/components/ui';
import { colors, radius } from '@/theme';

export type StatItem = { value: string; label: string; icon?: ReactNode };

type Props = {
  items: StatItem[];
  variant?: 'solid' | 'glass' | 'outlined';
  style?: StyleProp<ViewStyle>;
};

/** Horizontal row of equal-width stat tiles (Marketing Hub / Wallet / Dashboard). */
export function StatsRow({ items, variant = 'outlined', style }: Props) {
  return (
    <View style={[styles.row, style]}>
      {items.map((it) => (
        <StatCard key={it.label} value={it.value} label={it.label} icon={it.icon} variant={variant} />
      ))}
    </View>
  );
}

/** Small orange glyph inside a dark rounded square — the icon used above stat values. */
export function StatIcon({ children, circle }: { children: ReactNode; circle?: boolean }) {
  return <View style={[styles.icon, circle && styles.circle]}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  icon: {
    width: 28,
    height: 28,
    borderRadius: radius.xs,
    backgroundColor: 'rgba(255,107,0,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: { borderRadius: 14, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
});
