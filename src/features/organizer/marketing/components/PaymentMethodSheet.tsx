import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText, BottomSheet, BrandIcon, Icon, type IoniconName } from '@/components/ui';
import type { PaymentMethod } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { PAYMENT_METHODS } from '@/store';
import { colors, radius } from '@/theme';

/** Payment methods available on this platform (Apple Pay iOS only, Google Pay Android only). */
export const PLATFORM_PAYMENT_METHODS = PAYMENT_METHODS.filter((m) => {
  if (m.brand === 'applepay') return Platform.OS === 'ios';
  if (m.brand === 'googlepay') return Platform.OS === 'android';
  return true;
});

/** Brand glyph for a payment method (FontAwesome6 brands, Mastercard drawn as two circles). */
export function PaymentBrandIcon({ brand, size = 22 }: { brand: PaymentMethod['brand']; size?: number }) {
  if (brand === 'mastercard') {
    return (
      <View style={[styles.mc, { width: size * 1.5, height: size }]}>
        <View style={[styles.mcCircle, { width: size, height: size, borderRadius: size / 2, backgroundColor: '#EB001B' }]} />
        <View style={[styles.mcCircle, styles.mcRight, { width: size, height: size, borderRadius: size / 2, backgroundColor: '#F79E1B' }]} />
      </View>
    );
  }
  const name = brand === 'paypal' ? 'paypal' : brand === 'stripe' ? 'stripe-s' : brand === 'applepay' ? 'apple' : brand === 'googlepay' ? 'google' : 'cc-visa';
  return <BrandIcon name={name} size={size} color={colors.white} />;
}

type Props = { visible: boolean; onClose: () => void; value: string; onChange: (id: string) => void };

/** Bottom sheet listing PAYMENT_METHODS with a radio check (Boost payment / Deposit). */
export function PaymentMethodSheet({ visible, onClose, value, onChange }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Payment method">
      {PLATFORM_PAYMENT_METHODS.map((m) => {
        const active = m.id === value;
        const radio: IoniconName = active ? 'radio-button-on' : 'radio-button-off';
        return (
          <Pressable
            key={m.id}
            onPress={() => {
              haptic.selection();
              onChange(m.id);
              onClose();
            }}
            style={({ pressed }) => [styles.row, active && styles.rowActive, pressed && styles.pressed]}>
            <View style={styles.iconWrap}>
              <PaymentBrandIcon brand={m.brand} size={20} />
            </View>
            <View style={styles.flex}>
              <AppText variant="title">{m.label}</AppText>
              {m.last4 ? (
                <AppText variant="caption" secondary>
                  **** **** **** {m.last4}
                </AppText>
              ) : null}
            </View>
            {m.fee ? (
              <AppText variant="caption" secondary>
                {m.fee}
              </AppText>
            ) : null}
            <Icon name={radio} size={22} color={active ? colors.primary : colors.textMuted} />
          </Pressable>
        );
      })}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    minHeight: 60,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  rowActive: { borderColor: colors.primary },
  pressed: { opacity: 0.85 },
  iconWrap: { width: 40, alignItems: 'center' },
  mc: { flexDirection: 'row', alignItems: 'center' },
  mcCircle: { opacity: 0.95 },
  mcRight: { marginLeft: -8 },
});
