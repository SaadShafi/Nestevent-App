import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EventCard } from '@/components/EventCard';
import { TabHeader, useAppDrawer } from '@/components/navigation/AppDrawer';
import { Button, EmptyState, IconButton, Screen, SegmentTabs } from '@/components/ui';
import type { EventItem, Ticket } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { useAuthStore, useEventsStore, useTicketsStore } from '@/store';

import { tabPath } from '../../home/utils';

type Tab = 'upcoming' | 'past';
const TABS: { key: Tab; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
];

export function MyTicketsScreen() {
  const router = useRouter();
  const { openDrawer, drawer } = useAppDrawer();
  const browseMode = useAuthStore((s) => s.browseMode);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const myTickets = useTicketsStore((s) => s.myTickets);
  const events = useEventsStore((s) => s.events);
  const [tab, setTab] = useState<Tab>('upcoming');

  const isBrowse = browseMode && !isAuthenticated;

  const rows = useMemo(() => {
    const now = Date.now();
    const seen = new Set<string>();
    const out: { event: EventItem; ticket: Ticket }[] = [];
    myTickets.forEach((t) => {
      if (seen.has(t.eventId)) return;
      const event = events.find((e) => e.id === t.eventId);
      if (!event) return;
      seen.add(t.eventId);
      const upcoming = new Date(event.startDate).getTime() >= now;
      if ((tab === 'upcoming') === upcoming) out.push({ event, ticket: t });
    });
    return out;
  }, [myTickets, events, tab]);

  const header = (
    <TabHeader
      onMenu={openDrawer}
      right={
        <>
          <IconButton name="search-outline" onPress={() => router.push(tabPath('search'))} accessibilityLabel="Search" />
          <IconButton name="chatbubble-ellipses-outline" onPress={() => router.push('/messages')} accessibilityLabel="Messages" />
        </>
      }
    />
  );

  if (isBrowse) {
    return (
      <Screen withTabBar glow>
        {header}
        <View style={styles.center}>
          <EmptyState icon="ticket-outline" title="Sign in to see your tickets" message="Your purchased tickets and QR codes live here." />
          <Button title="Sign In" variant="white" fullWidth={false} onPress={() => router.push('/(auth)/login')} />
        </View>
        {drawer}
      </Screen>
    );
  }

  return (
    <Screen withTabBar scroll glow={rows.length === 0}>
      {header}
      <SegmentTabs items={TABS} value={tab} onChange={setTab} style={styles.tabs} />
      {rows.length === 0 ? (
        <EmptyState
          icon="ticket-outline"
          title={tab === 'upcoming' ? 'No upcoming tickets' : 'No past tickets'}
          message={tab === 'upcoming' ? 'Grab a ticket from an event to see it here.' : 'Events you attended will show up here.'}
        />
      ) : (
        rows.map(({ event, ticket }) => (
          <EventCard
            key={event.id}
            event={event}
            onPress={() => {
              haptic.light();
              router.push(`/ticket/${ticket.id}`);
            }}
          />
        ))
      )}
      {drawer}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { marginBottom: 16 },
  center: { alignItems: 'center', paddingTop: 40 },
});
