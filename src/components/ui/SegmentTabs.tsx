import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

import { AppText } from './AppText';

type Item<T extends string> = { key: T; label: string; count?: number };

type Props<T extends string> = {
  items: Item<T>[];
  value: T;
  onChange: (key: T) => void;
  /**
   * 'pill'      – dark pill on selected (Upcoming/Past, For You/Following)
   * 'orange'    – orange pill on selected (Explore Event filters, Quick filters)
   * 'underline' – text with orange underline (SMS Blast Active/Completed/Rejected)
   * 'segment'   – contained two-segment switch (Transactions/Pending)
   */
  variant?: 'pill' | 'orange' | 'underline' | 'segment';
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SegmentTabs<T extends string>({ items, value, onChange, variant = 'pill', scrollable, style }: Props<T>) {
  const content = items.map((it) => {
    const active = it.key === value;
    const label = it.count != null ? `${it.label} (${it.count})` : it.label;
    if (variant === 'underline') {
      return (
        <Pressable key={it.key} onPress={() => { haptic.selection(); onChange(it.key); }} style={[styles.underlineItem, !scrollable && styles.flex1]}>
          <AppText variant="title" color={active ? colors.primary : colors.textMuted} center>
            {it.label}
          </AppText>
          <View style={[styles.underline, active && styles.underlineActive]} />
        </Pressable>
      );
    }
    if (variant === 'segment') {
      return (
        <Pressable
          key={it.key}
          onPress={() => { haptic.selection(); onChange(it.key); }}
          style={[styles.segmentItem, active && styles.segmentActive]}>
          <AppText variant="label" center>
            {it.label}
          </AppText>
        </Pressable>
      );
    }
    const activeBg = variant === 'orange' ? colors.primary : colors.surfaceHigh;
    return (
      <Pressable
        key={it.key}
        onPress={() => { haptic.selection(); onChange(it.key); }}
        style={[styles.pill, variant === 'orange' && !active && styles.pillInactiveOrange, active && { backgroundColor: activeBg }]}>
        <AppText variant={active ? 'title' : 'bodyMedium'} color={active ? colors.text : colors.textSecondary}>
          {label}
        </AppText>
      </Pressable>
    );
  });

  if (variant === 'segment') {
    return <View style={[styles.segmentWrap, style]}>{content}</View>;
  }
  if (scrollable) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.row, style]}>
        {content}
      </ScrollView>
    );
  }
  return <View style={[styles.row, variant === 'underline' && styles.underlineRow, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex1: { flex: 1 },
  pill: { height: 44, paddingHorizontal: 20, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  pillInactiveOrange: { backgroundColor: colors.surface },
  underlineRow: { gap: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
  underlineItem: { paddingVertical: 12, paddingHorizontal: 12, alignItems: 'center' },
  underline: { height: 2, alignSelf: 'stretch', marginTop: 10, backgroundColor: 'transparent' },
  underlineActive: { backgroundColor: colors.primary },
  segmentWrap: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4 },
  segmentItem: { flex: 1, height: 42, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: colors.primary },
});
