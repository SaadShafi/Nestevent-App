import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, BottomSheet, Button, EmptyState, Header, Screen, SearchBar, SegmentTabs } from '@/components/ui';
import type { SmsBlast } from '@/data/types';
import { formatNumericDate } from '@/lib/format';
import { useOrganizerStore } from '@/store';
import { colors, radius } from '@/theme';

import { StatsRow } from '../../components/StatsRow';
import { formatNumber } from '../../utils';
import { SmsCard } from '../components/SmsCard';

type Status = SmsBlast['status'];
const TABS: { key: Status; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
];

/** SMS Blast list with delivery stats and status tabs. */
export function SmsBlastScreen() {
  const router = useRouter();
  const blasts = useOrganizerStore((s) => s.smsBlasts);
  const [tab, setTab] = useState<Status>('active');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<SmsBlast | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blasts.filter((b) => b.status === tab && (!q || b.title.toLowerCase().includes(q) || b.message.toLowerCase().includes(q)));
  }, [blasts, tab, query]);

  const stats = useMemo(() => {
    const sent = blasts.filter((b) => b.status !== 'rejected').reduce((n, b) => n + b.recipients, 0);
    const pending = blasts.filter((b) => b.status === 'active').reduce((n, b) => n + b.recipients, 0);
    const failed = Math.round(sent * 0.012);
    return { sent, delivered: Math.max(0, sent - failed - Math.min(pending, 11)), failed, pending: Math.min(pending, 11) };
  }, [blasts]);

  return (
    <Screen scroll footer={<Button title="New SMS Blast" variant="white" onPress={() => router.push('/organizer/marketing/sms/audience')} />}>
      <Header title="SMS Blast" />
      <StatsRow
        style={styles.stats}
        items={[
          { value: formatNumber(stats.sent), label: 'Sent' },
          { value: formatNumber(stats.delivered), label: 'Delivered' },
          { value: formatNumber(stats.failed), label: 'Failed' },
          { value: formatNumber(stats.pending), label: 'Pending' },
        ]}
      />
      <SegmentTabs variant="underline" items={TABS} value={tab} onChange={setTab} style={styles.tabs} />
      <SearchBar iconRight placeholder="Search SMS blasts" value={query} onChangeText={setQuery} containerStyle={styles.search} />

      {filtered.length === 0 ? (
        <EmptyState icon="mail-outline" title={`No ${tab} blasts`} message="Send a new SMS blast to your attendees." />
      ) : (
        filtered.map((b) => <SmsCard key={b.id} blast={b} onPress={() => setOpen(b)} />)
      )}

      <BottomSheet visible={!!open} onClose={() => setOpen(null)} title="SMS Blast" scroll>
        {open ? (
          <View style={styles.sheet}>
            <AppText variant="h3">{open.title}</AppText>
            <AppText variant="caption" secondary>
              Sent: {formatNumericDate(open.sentAt)} · {formatNumber(open.recipients)} recipients
            </AppText>
            <View style={styles.message}>
              <AppText>{open.message}</AppText>
            </View>
            <View style={styles.metaRow}>
              <Meta label="Audience" value={open.audience} />
              <Meta label="Scope" value={open.scope} />
            </View>
            <Meta label="Consent" value={open.consentFilter} />
            <Button title="Close" variant="white" onPress={() => setOpen(null)} style={styles.close} />
          </View>
        ) : null}
      </BottomSheet>
    </Screen>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.meta}>
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { marginBottom: 16 },
  tabs: { marginBottom: 16 },
  search: { marginBottom: 16 },
  sheet: { gap: 12 },
  message: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14 },
  metaRow: { flexDirection: 'row', gap: 12 },
  meta: { flex: 1, gap: 2 },
  close: { marginTop: 8 },
});
