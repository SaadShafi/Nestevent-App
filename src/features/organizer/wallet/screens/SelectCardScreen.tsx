import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Header, Icon, Screen, type IoniconName } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

import { PLATFORM_PAYMENT_METHODS, PaymentBrandIcon } from '../../marketing/components/PaymentMethodSheet';

/** Deposit step 1: choose the payment method that funds the wallet. */
export function SelectCardScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState(PLATFORM_PAYMENT_METHODS[0]?.id ?? 'pm_card');

  return (
    <Screen
      scroll
      footer={
        <Button
          title="Continue"
          variant="white"
          onPress={() => router.push({ pathname: '/organizer/wallet/deposit', params: { method: selected } })}
        />
      }>
      <Header title="Select Card" />
      {PLATFORM_PAYMENT_METHODS.map((m) => {
        const active = m.id === selected;
        const radio: IoniconName = active ? 'radio-button-on' : 'radio-button-off';
        return (
          <Pressable
            key={m.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            onPress={() => {
              haptic.selection();
              setSelected(m.id);
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
    </Screen>
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
    minHeight: 64,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  rowActive: { borderColor: colors.primary },
  pressed: { opacity: 0.85 },
  iconWrap: { width: 40, alignItems: 'center' },
});
