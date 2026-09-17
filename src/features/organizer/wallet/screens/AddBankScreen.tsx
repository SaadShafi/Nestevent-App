import { useRouter } from 'expo-router';
import { useState } from 'react';

import { Button, Header, Input, ListRow, Screen, Toggle, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useOrganizerStore } from '@/store';

/** Bank Accounts → Add Bank Details form. */
export function AddBankScreen() {
  const router = useRouter();
  const toast = useToast();
  const bankAccounts = useOrganizerStore((s) => s.bankAccounts);
  const addBankAccount = useOrganizerStore((s) => s.addBankAccount);

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
    addBankAccount(holder.trim(), number.replace(/\s+/g, '').toUpperCase(), { bankName: bankName.trim(), routing: routing.trim(), isDefault });
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
      <ListRow
        title="Set as default"
        subtitle="Use this account for withdrawals"
        right={
          <Toggle
            value={isDefault}
            onValueChange={(v) => {
              haptic.selection();
              setIsDefault(v);
            }}
          />
        }
      />
    </Screen>
  );
}
