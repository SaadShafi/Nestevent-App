import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AppText, BottomSheet, Button, Input, Select, useToast } from '@/components/ui';
import { formatCurrency } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useOrganizerStore } from '@/store';
import { colors } from '@/theme';

import { parseMoney } from '../../utils';
import { maskAccount } from '../utils';

type Props = { visible: boolean; onClose: () => void };

/** My Wallet → Withdraw: amount + destination bank account, validated against the balance. */
export function WithdrawSheet({ visible, onClose }: Props) {
  const toast = useToast();
  const balance = useOrganizerStore((s) => s.walletBalance);
  const bankAccounts = useOrganizerStore((s) => s.bankAccounts);
  const withdraw = useOrganizerStore((s) => s.withdraw);

  const [amount, setAmount] = useState('');
  const [bankId, setBankId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ amount?: string; bank?: string }>({});

  const bankOptions = useMemo(
    () => bankAccounts.map((b) => ({ value: b.id, label: `${b.holder} · ${maskAccount(b.number)}` })),
    [bankAccounts],
  );

  useEffect(() => {
    if (!visible) return;
    setAmount('');
    setErrors({});
    setBankId(bankAccounts.find((b) => b.isDefault)?.id ?? bankAccounts[0]?.id ?? null);
  }, [visible, bankAccounts]);

  const submit = () => {
    const value = parseMoney(amount);
    const next: typeof errors = {};
    if (value <= 0) next.amount = 'Enter an amount to withdraw';
    else if (value > balance) next.amount = `Amount exceeds your balance of ${formatCurrency(balance, { decimals: 2 })}`;
    if (!bankId) next.bank = 'Select a bank account';
    setErrors(next);
    if (Object.keys(next).length) {
      haptic.error();
      return;
    }
    withdraw(+value.toFixed(2));
    haptic.success();
    toast(`Withdrawal of ${formatCurrency(value, { decimals: 2 })} requested`, 'success');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Withdraw">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.balance}>
          <AppText variant="caption" secondary>
            Available balance
          </AppText>
          <AppText variant="h2" color={colors.primary}>
            {formatCurrency(balance, { decimals: 2 })}
          </AppText>
        </View>
        <Input
          label="Amount"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          left={<AppText secondary>$</AppText>}
          error={errors.amount}
        />
        <Select
          label="Bank account"
          placeholder="Select bank account"
          sheetTitle="Select bank account"
          options={bankOptions}
          value={bankId}
          onChange={setBankId}
          error={errors.bank}
        />
        <Button title="Withdraw" variant="white" onPress={submit} />
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  balance: { marginBottom: 16, gap: 2 },
});
