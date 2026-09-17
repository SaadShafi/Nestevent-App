import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import type { PromoCode } from '@/data/types';
import { formatCurrency } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

export function promoDiscountLabel(p: PromoCode) {
  return p.discountType === 'percentage' ? `${p.value}% off` : `${formatCurrency(p.value)} off`;
}

/** Promo code list card: code, discount + status, uses / revenue. */
export function PromoCard({ promo, onPress }: { promo: PromoCode; onPress: () => void }) {
  return (
    <Pressable
      onPress={() => {
        haptic.light();
        onPress();
      }}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.top}>
        <View style={styles.flex}>
          <AppText variant="h2">{promo.code}</AppText>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: promo.active ? colors.success : colors.danger }]} />
            <AppText variant="caption" secondary>
              {promoDiscountLabel(promo)} · {promo.active ? 'Active' : 'Paused'}
            </AppText>
          </View>
        </View>
        <Icon name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
      <View style={styles.stats}>
        <AppText variant="label">{promo.uses} Uses</AppText>
        <AppText variant="caption" muted>
          ·
        </AppText>
        <AppText variant="label">{formatCurrency(promo.revenue)} Revenue</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, marginBottom: 12, gap: 12 },
  pressed: { opacity: 0.9 },
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
