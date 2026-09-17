import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { EmptyState, Header, Screen, SegmentTabs } from '@/components/ui';
import { formatShortDate } from '@/lib/format';
import { useOrganizerStore } from '@/store';

import { DatePill } from '../components/DatePill';
import { TransactionRow } from '../components/TransactionRow';

type Tab = 'completed' | 'pending';
const TABS: { key: Tab; label: string }[] = [
  { key: 'completed', label: 'Transactions' },
  { key: 'pending', label: 'Pending' },
];

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** My Wallet → View all: full Transactions History filtered by day + Transactions / Pending. */
export function TransactionsScreen() {
  const transactions = useOrganizerStore((s) => s.transactions);
  const [tab, setTab] = useState<Tab>('completed');
  const [date, setDate] = useState(() => new Date());

  const rows = useMemo(
    () => transactions.filter((t) => t.status === tab && sameDay(new Date(t.at), date)),
    [transactions, tab, date],
  );

  return (
    <Screen scroll>
      <Header title="Transactions History" />
      <DatePill value={date} onChange={setDate} />
      <SegmentTabs variant="segment" items={TABS} value={tab} onChange={setTab} style={styles.tabs} />
      {rows.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title={tab === 'pending' ? 'Nothing pending' : 'No transactions'}
          message={`No ${tab === 'pending' ? 'pending requests' : 'transactions'} on ${formatShortDate(date)}.`}
        />
      ) : (
        rows.map((t) => <TransactionRow key={t.id} tx={t} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { marginBottom: 12 },
});
