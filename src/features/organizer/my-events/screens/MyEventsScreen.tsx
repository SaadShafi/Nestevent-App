import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { EventCard } from '@/components/EventCard';
import { AppText, Button, EmptyState, Icon, IconButton, NestLogo, Screen, SegmentTabs } from '@/components/ui';
import type { EventStatus } from '@/data/types';
import { LocationSheet } from '@/features/home/components/LocationSheet';
import { useMyEvents } from '@/features/organizer/hooks';
import { useAuthStore, useOrganizerStore } from '@/store';
import { colors } from '@/theme';

const TABS: { key: EventStatus; label: string }[] = [
  { key: 'live', label: 'Live' },
  { key: 'draft', label: 'Drafts' },
  { key: 'past', label: 'Past' },
];

const EMPTY: Record<EventStatus, { title: string; message: string }> = {
  live: { title: 'No live events', message: 'Publish an event and it will show up here for guests to discover.' },
  draft: { title: 'No drafts', message: 'Start creating an event — you can save it as a draft and finish later.' },
  past: { title: 'No past events', message: 'Events that have already happened will be archived here.' },
};

/** My Events tab — Live / Drafts / Past events for the organizer's organizations. */
export function MyEventsScreen() {
  const router = useRouter();
  const locationLabel = useAuthStore((s) => s.locationLabel);
  const resetDraft = useOrganizerStore((s) => s.resetDraft);
  const events = useMyEvents();
  const [tab, setTab] = useState<EventStatus>('live');
  const [locationOpen, setLocationOpen] = useState(false);

  const rows = useMemo(() => events.filter((e) => e.status === tab), [events, tab]);

  const createEvent = () => {
    resetDraft();
    router.push('/organizer/create-event');
  };

  return (
    <Screen padded withTabBar scroll>
      <View style={styles.headerRow}>
        <NestLogo size={34} />
        <Pressable onPress={() => setLocationOpen(true)} style={styles.location} hitSlop={8}>
          <View style={styles.locationCaption}>
            <Icon name="location-outline" size={14} color={colors.textSecondary} />
            <AppText variant="caption" secondary>
              Your location
            </AppText>
          </View>
          <View style={styles.locationRow}>
            <AppText variant="title" numberOfLines={1} style={styles.locationText}>
              {locationLabel}
            </AppText>
            <Icon name="chevron-down" size={16} color={colors.white} />
          </View>
        </Pressable>
        <View style={styles.actions}>
          <IconButton name="add" iconSize={24} onPress={createEvent} accessibilityLabel="Create event" />
          <IconButton name="chatbubble-ellipses-outline" onPress={() => router.push('/messages')} accessibilityLabel="Messages" />
        </View>
      </View>

      <SegmentTabs items={TABS} value={tab} onChange={setTab} style={styles.tabs} />

      {rows.length === 0 ? (
        <View>
          <EmptyState icon="calendar-outline" title={EMPTY[tab].title} message={EMPTY[tab].message} />
          {tab !== 'past' ? <Button title="Create event" onPress={createEvent} fullWidth={false} style={styles.emptyCta} /> : null}
        </View>
      ) : (
        rows.map((e) => <EventCard key={e.id} event={e} favoritable={false} onPress={() => router.push(`/organizer/event/${e.id}`)} />)
      )}

      <LocationSheet visible={locationOpen} onClose={() => setLocationOpen(false)} />
    </Screen>
  );
}

export default MyEventsScreen;

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 64, marginBottom: 12 },
  location: { flex: 1, gap: 2 },
  locationCaption: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { flexShrink: 1 },
  actions: { flexDirection: 'row', gap: 8 },
  tabs: { marginBottom: 16 },
  emptyCta: { alignSelf: 'center', paddingHorizontal: 32 },
});
