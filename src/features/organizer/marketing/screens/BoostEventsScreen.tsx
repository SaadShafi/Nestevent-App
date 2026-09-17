import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { EventCard } from '@/components/EventCard';
import { Button, EmptyState, Header, Screen, SearchBar, SegmentTabs } from '@/components/ui';
import type { Boost } from '@/data/types';
import { useEventsStore, useOrganizerStore } from '@/store';

import { StatsRow } from '../../components/StatsRow';
import { formatNumber } from '../../utils';

type Status = Boost['status'];
const TABS: { key: Status; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'boosted', label: 'Boosted' },
  { key: 'rejected', label: 'Rejected' },
];

/** Boost Event list: reach stats, status tabs and boosted event cards. */
export function BoostEventsScreen() {
  const router = useRouter();
  const boosts = useOrganizerStore((s) => s.boosts);
  const events = useEventsStore((s) => s.events);
  const [tab, setTab] = useState<Status>('active');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return boosts
      .filter((b) => b.status === tab)
      .map((b) => ({ boost: b, event: events.find((e) => e.id === b.eventId) }))
      .filter((r) => r.event && (!q || r.event.title.toLowerCase().includes(q)));
  }, [boosts, events, tab, query]);

  const stats = useMemo(() => {
    const active = boosts.filter((b) => b.status !== 'rejected');
    const sent = active.reduce((n, b) => n + Math.round(b.budget * 6.7), 0);
    const failed = Math.round(sent * 0.012);
    const pending = boosts.filter((b) => b.status === 'active').length * 11;
    return { sent, delivered: Math.max(0, sent - failed - pending), failed, pending };
  }, [boosts]);

  return (
    <Screen scroll footer={<Button title="Create Boost Event" variant="white" onPress={() => router.push('/organizer/marketing/boost/create')} />}>
      <Header title="Boost Event" />
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
      <SearchBar iconRight placeholder="Search boosted events" value={query} onChangeText={setQuery} containerStyle={styles.search} />

      {rows.length === 0 ? (
        <EmptyState icon="flash-outline" title={`No ${tab} boosts`} message="Boost an event to get paid discovery priority." />
      ) : (
        rows.map(({ boost, event }) =>
          event ? (
            <EventCard key={boost.id} event={event} favoritable={false} onPress={() => router.push(`/organizer/event/${event.id}`)} />
          ) : null,
        )
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { marginBottom: 16 },
  tabs: { marginBottom: 16 },
  search: { marginBottom: 16 },
});
