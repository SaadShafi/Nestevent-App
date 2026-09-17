import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, EmptyState, Header, MCIcon, Screen } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useOrganizerStore } from '@/store';
import { colors, radius } from '@/theme';

/** Settings → Bank Accounts: saved payout accounts; tap a row to make it the default. */
export function BankAccountsScreen() {
  const router = useRouter();
  const bankAccounts = useOrganizerStore((s) => s.bankAccounts);
  const setDefaultBank = useOrganizerStore((s) => s.setDefaultBank);

  return (
    <Screen scroll footer={<Button title="Add Bank Details" variant="white" onPress={() => router.push('/organizer/wallet/add-bank')} />}>
      <Header title="Bank Accounts" />
      {bankAccounts.length === 0 ? (
        <EmptyState icon="card-outline" title="No bank accounts" message="Add a bank account to withdraw your earnings." />
      ) : (
        bankAccounts.map((b) => (
          <Pressable
            key={b.id}
            accessibilityRole="button"
            accessibilityState={{ selected: b.isDefault }}
            onPress={() => {
              if (b.isDefault) return;
              haptic.selection();
              setDefaultBank(b.id);
            }}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <View style={styles.iconWrap}>
              <MCIcon name="bank-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.text}>
              <AppText variant="title" numberOfLines={1}>
                {b.holder}
              </AppText>
              <AppText variant="caption" secondary numberOfLines={1}>
                {b.bankName ? `${b.bankName} · ` : ''}{b.number}
              </AppText>
            </View>
            {b.isDefault ? <View style={styles.dot} /> : <View style={styles.dotOff} />}
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 64,
    marginBottom: 10,
  },
  pressed: { opacity: 0.85 },
  iconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, marginRight: 8 },
  dotOff: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: colors.textMuted, marginRight: 8 },
});
