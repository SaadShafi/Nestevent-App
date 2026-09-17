import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Header, Input, Screen, Toggle, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useOrganizerStore } from '@/store';
import { colors, radius } from '@/theme';

/** Bank Accounts → Add Bank Details form. */
export function AddBankScreen() {
  const router = useRouter();
  const toast = useToast();
  const bankAccounts = useOrganizerStore((s) => s.bankAccounts);
  const addBankAccount = useOrganizerStore((s) => s.addBankAccount);
  const setDefaultBank = useOrganizerStore((s) => s.setDefaultBank);

  const [holder, setHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [number, setNumber] = useState('');
  const [routing, setRouting] = useState('');
  const [isDefault, setIsDefault] = useState(bankAccounts.length === 0);
  const [errors, setErrors] = useState<{ holder?: string; bankName?: string; number?: string; routing?: string }>({});

  const submit = () => {
    const next: typeof errors = {};
    if (!holder.trim()) next.holder = 'Enter the account holder name';
    if (!bankName.trim()) next.bankName = 'Enter the bank name';
    if (number.replace(/\s+/g, '').length < 8) next.number = 'Enter a valid account number or IBAN';
    if (!routing.trim()) next.routing = 'Enter the routing number or SWIFT code';
    setErrors(next);
    if (Object.keys(next).length) {
      haptic.error();
      return;
    }
    // The store always marks a new account as default; restore the previous default when the toggle is off.
    const previousDefault = bankAccounts.find((b) => b.isDefault);
    addBankAccount(holder.trim(), number.replace(/\s+/g, '').toUpperCase());
    if (!isDefault && previousDefault) setDefaultBank(previousDefault.id);
    haptic.success();
    toast('Bank account saved', 'success');
    router.back();
  };

  return (
    <Screen scroll keyboard footer={<Button title="Save" variant="white" onPress={submit} />}>
      <Header title="Add Bank Details" />
      <Input label="Account Holder Name" placeholder="Martin Press" value={holder} onChangeText={setHolder} autoCapitalize="words" error={errors.holder} />
      <Input label="Bank Name" placeholder="Chase Bank" value={bankName} onChangeText={setBankName} autoCapitalize="words" error={errors.bankName} />
      <Input
        label="Account Number / IBAN"
        placeholder="MW05015154889189199110"
        value={number}
        onChangeText={setNumber}
        autoCapitalize="characters"
        autoCorrect={false}
        error={errors.number}
      />
      <Input
        label="Routing / SWIFT"
        placeholder="CHASUS33"
        value={routing}
        onChangeText={setRouting}
        autoCapitalize="characters"
        autoCorrect={false}
        error={errors.routing}
      />
      <View style={styles.toggleRow}>
        <View style={styles.flex}>
          <AppText variant="bodyMedium">Set as default</AppText>
          <AppText variant="caption" secondary>
            Use this account for withdrawals
          </AppText>
        </View>
        <Toggle
          value={isDefault}
          onValueChange={(v) => {
            haptic.selection();
            setIsDefault(v);
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minHeight: 60,
  },
});
