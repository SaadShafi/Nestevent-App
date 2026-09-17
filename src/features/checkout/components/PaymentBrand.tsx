import { StyleSheet, View } from 'react-native';

import { BrandIcon } from '@/components/ui';
import type { PaymentMethod } from '@/data/types';
import { colors } from '@/theme';

/** Brand mark for a payment method: Mastercard = two overlapping circles, others via FontAwesome brands. */
export function PaymentBrand({ brand, size = 28 }: { brand: PaymentMethod['brand']; size?: number }) {
  if (brand === 'mastercard') {
    const r = size * 0.68;
    return (
      <View style={[styles.mc, { width: size * 1.15, height: r }]}>
        <View style={[styles.circle, { width: r, height: r, borderRadius: r / 2, backgroundColor: '#EB001B' }]} />
        <View style={[styles.circle, { width: r, height: r, borderRadius: r / 2, backgroundColor: '#F79E1B', marginLeft: -r * 0.4, opacity: 0.9 }]} />
      </View>
    );
  }
  if (brand === 'visa') return <BrandIcon name="cc-visa" size={size} color="#1A1F71" />;
  const name = brand === 'paypal' ? 'paypal' : brand === 'stripe' ? 'stripe-s' : brand === 'applepay' ? 'apple' : 'google';
  const color = brand === 'paypal' ? '#009CDE' : brand === 'stripe' ? '#635BFF' : colors.white;
  return <BrandIcon name={name} size={size * 0.85} color={color} />;
}

const styles = StyleSheet.create({
  mc: { flexDirection: 'row', alignItems: 'center' },
  circle: {},
});
