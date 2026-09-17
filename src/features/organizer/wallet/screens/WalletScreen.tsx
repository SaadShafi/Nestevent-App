import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, EmptyState, Header, Icon, Screen, SectionHeader, SegmentTabs } from '@/components/ui';
import { formatCurrency } from '@/lib/format';
import { useOrganizerStore } from '@/store';
import { colors, radius } from '@/theme';

import { TransactionRow } from '../components/TransactionRow';
import { WithdrawSheet } from '../components/WithdrawSheet';

type Tab = 'completed' | 'pending';
const TABS: { key: Tab; label: string }[] = [
  { key: 'completed', label: 'Transactions' },
  { key: 'pending', label: 'Pending' },
];
const PREVIEW_COUNT = 6;

/** My Wallet: balance card, Withdraw / Deposit, and a preview of the transaction history. */
export function WalletScreen() {
  const router = useRouter();
  const balance = useOrganizerStore((s) => s.walletBalance);
  const transactions = useOrganizerStore((s) => s.transactions);
  const [tab, setTab] = useState<Tab>('completed');
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const rows = useMemo(() => transactions.filter((t) => t.status === tab).slice(0, PREVIEW_COUNT), [transactions, tab]);

  return (
    <Screen scroll>
      <Header title="My Wallet" />

      <View style={styles.card}>
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,107,0,0.55)', 'rgba(255,107,0,0.12)', 'transparent']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.2, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.cardTop}>
          <View style={styles.walletIcon}>
            <Icon name="wallet-outline" size={18} color={colors.primary} />
          </View>
          <AppText variant="caption" secondary>
            Account balance
          </AppText>
        </View>
        <AppText variant="display" style={styles.balance}>
          {formatCurrency(balance, { decimals: 2 })}
        </AppText>
        <View style={styles.actions}>
          <Button title="Withdraw" variant="white" fullWidth={false} style={styles.action} onPress={() => setWithdrawOpen(true)} />
          <Button
            title="Deposit"
            variant="primary"
            fullWidth={false}
            style={styles.action}
            onPress={() => router.push('/organizer/wallet/select-card')}
          />
        </View>
      </View>

      <SegmentTabs variant="segment" items={TABS} value={tab} onChange={setTab} style={styles.tabs} />

      <SectionHeader title="My Transactions History" actionLabel="View all" onAction={() => router.push('/organizer/wallet/transactions')} />

      {rows.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title={tab === 'pending' ? 'Nothing pending' : 'No transactions yet'}
          message={tab === 'pending' ? 'Deposit and withdrawal requests will show up here.' : 'Ticket payouts and transfers will show up here.'}
        />
      ) : (
        rows.map((t) => <TransactionRow key={t.id} tx={t} />)
      )}

      <WithdrawSheet visible={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  walletIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balance: { marginTop: 10, marginBottom: 20 },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1 },
  tabs: { marginBottom: 8 },
});
