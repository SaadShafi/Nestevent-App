import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText, BottomSheet, Button, Chip, Header, Icon, Screen, useToast } from '@/components/ui';
import { formatCurrency } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { PAYMENT_METHODS, useOrganizerStore } from '@/store';
import { colors, fonts } from '@/theme';

import { parseMoney } from '../../utils';
import { sanitizeAmount } from '../utils';

const QUICK_AMOUNTS = [100, 200, 400, 1000];

/** Deposit step 2: enter the amount, then a success sheet confirming the pending request. */
export function DepositScreen() {
  const router = useRouter();
  const toast = useToast();
  const { method } = useLocalSearchParams<{ method?: string }>();
  const requestDeposit = useOrganizerStore((s) => s.requestDeposit);
  const payment = PAYMENT_METHODS.find((m) => m.id === method);

  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  const value = parseMoney(amount);

  const submit = () => {
    if (value <= 0) {
      setError('Enter an amount to deposit');
      haptic.error();
      return;
    }
    setError(null);
    const rounded = +value.toFixed(2);
    requestDeposit(rounded);
    haptic.success();
    setDone(rounded);
  };

  const goHome = () => {
    setDone(null);
    toast('Deposit request submitted', 'success');
    router.replace('/(organizer)/(tabs)/home');
  };

  return (
    <Screen scroll keyboard footer={<Button title="Deposit" variant="white" onPress={submit} />}>
      <Header title="Deposit Amount" />

      <View style={styles.intro}>
        <AppText variant="h1" center>
          Enter Amount
        </AppText>
        <AppText secondary center style={styles.subtitle}>
          Please enter the amount you want to Deposit
        </AppText>
      </View>

      <View style={styles.amountRow}>
        <AppText style={styles.prefix}>$</AppText>
        <TextInput
          value={amount}
          onChangeText={(v) => {
            setAmount(sanitizeAmount(v));
            if (error) setError(null);
          }}
          keyboardType="decimal-pad"
          autoFocus
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          style={styles.amountInput}
          accessibilityLabel="Deposit amount"
        />
      </View>
      {error ? (
        <AppText variant="caption" color={colors.danger} center>
          {error}
        </AppText>
      ) : payment ? (
        <AppText variant="caption" secondary center>
          via {payment.label}
          {payment.fee ? ` · ${payment.fee}` : ''}
        </AppText>
      ) : null}

      <View style={styles.chips}>
        {QUICK_AMOUNTS.map((q) => (
          <Chip key={q} label={`$${q}`} selected={value === q} onPress={() => setAmount(String(q))} />
        ))}
      </View>

      <BottomSheet visible={done != null} onClose={goHome} closeButton={false}>
        <View style={styles.success}>
          <View style={styles.check}>
            <Icon name="checkmark" size={36} color={colors.white} />
          </View>
          <AppText variant="h2" center>
            successfully requested
          </AppText>
          <AppText secondary center style={styles.successMsg}>
            {formatCurrency(done ?? 0)} to be added to your wallet. Please wait 24 to 48 hours for the admin to approve your request.
          </AppText>
          <AppText variant="h1" center style={styles.successAmount}>
            {formatCurrency(done ?? 0, { decimals: 2 })}
          </AppText>
          <Button title="return home" variant="white" onPress={goHome} />
        </View>
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginTop: 24, marginBottom: 32 },
  subtitle: { marginTop: 6 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 8 },
  prefix: { fontFamily: fonts.display, fontSize: 32, lineHeight: 40, color: colors.textSecondary },
  amountInput: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 52,
    color: colors.text,
    minWidth: 120,
    maxWidth: '80%',
    textAlign: 'center',
    paddingVertical: 4,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 28 },
  success: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  check: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successMsg: { marginTop: 8, marginBottom: 18, paddingHorizontal: 8 },
  successAmount: { marginBottom: 24 },
});
