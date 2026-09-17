import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { EventCard } from '@/components/EventCard';
import { GradientHeader } from '@/components/GradientHeader';
import { HeaderGlassButton, HomeHeaderBar } from '@/components/HomeHeaderBar';
import { FigmaIcon } from '@/components/icons/FigmaIcon';
import { AppText, EmptyState, Screen, SearchBar, SectionHeader, SegmentTabs } from '@/components/ui';
import { CATEGORIES } from '@/data/mock';
import { haptic } from '@/lib/haptics';
import { useAuthStore, useChatStore, useEventsStore } from '@/store';
import { colors, layout } from '@/theme';

import { LocationSheet } from '../components/LocationSheet';
import { OrganizerRail } from '../components/OrganizerRail';
import { tabPath } from '../utils';

export function HomeScreen() {
  const router = useRouter();
  const browseMode = useAuthStore((s) => s.browseMode);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const locationLabel = useAuthStore((s) => s.locationLabel);
  const hasUnread = useChatStore((s) => s.notifications.some((n) => !n.read));
  const events = useEventsStore((s) => s.events);
  const organizations = useEventsStore((s) => s.organizations);

  const [category, setCategory] = useState('All');
  const [locationOpen, setLocationOpen] = useState(false);

  const isBrowse = browseMode && !isAuthenticated;

  const visibleEvents = useMemo(() => (isBrowse ? events : events.filter((e) => e.status === 'live')), [events, isBrowse]);

  const categoryItems = useMemo(
    () =>
      CATEGORIES.map((c) => {
        if (c === 'All') return { key: c, label: c };
        const count = visibleEvents.filter((e) => e.genre === c).length;
        return count > 0 ? { key: c, label: c, count } : { key: c, label: c };
      }),
    [visibleEvents],
  );

  const filtered = useMemo(
    () => (category === 'All' ? visibleEvents : visibleEvents.filter((e) => e.genre === category)),
    [visibleEvents, category],
  );

  const goSearch = (params?: Record<string, string>) => {
    haptic.light();
    router.push({ pathname: tabPath('search'), params });
  };

  const header = (
    <GradientHeader>
      <HomeHeaderBar
        caption="You location"
        location={isBrowse ? undefined : locationLabel}
        onLocationPress={() => setLocationOpen(true)}
        right={
          <>
            {!isBrowse ? (
              <HeaderGlassButton onPress={() => goSearch()} accessibilityLabel="Search">
                <FigmaIcon name="search" size={21} color={colors.white} />
              </HeaderGlassButton>
            ) : null}
            <HeaderGlassButton onPress={() => router.push('/notifications')} accessibilityLabel="Notifications" badge={hasUnread}>
              <FigmaIcon name="bell" size={20} color={colors.white} />
            </HeaderGlassButton>
          </>
        }
      />
      {isBrowse ? (
        <AppText variant="display" style={styles.browseTitle}>
          Browse Mode{'\n'}For You
        </AppText>
      ) : (
        <Pressable onPress={() => goSearch({ q: '' })} style={styles.searchWrap}>
          <SearchBar editable={false} pointerEvents="none" containerStyle={styles.search} />
        </Pressable>
      )}
    </GradientHeader>
  );

  return (
    <Screen padded={false} withTabBar scroll edges={[]} header={header}>
      <View style={styles.section}>
        <SectionHeader
          title="Top Organizer Event"
          actionLabel={isBrowse ? undefined : 'View all'}
          onAction={() => goSearch({ filter: 'Organizations' })}
        />
      </View>
      <OrganizerRail organizations={organizations} />

      <View style={styles.section}>
        <SectionHeader title="Explore Event" actionLabel={isBrowse ? undefined : 'View all'} onAction={() => goSearch({ filter: 'Events' })} />
      </View>
      <SegmentTabs variant="orange" scrollable items={categoryItems} value={category} onChange={setCategory} style={styles.tabs} />

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <EmptyState icon="calendar-outline" title="No events yet" message="Try another category or check back soon." />
        ) : (
          filtered.map((e) => <EventCard key={e.id} event={e} />)
        )}
      </View>

      <LocationSheet visible={locationOpen} onClose={() => setLocationOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  browseTitle: { marginTop: 24, marginBottom: 4 },
  searchWrap: { marginTop: 18 },
  search: { opacity: 0.95 },
  section: { paddingHorizontal: layout.screenPadding, marginTop: 8 },
  tabs: { paddingHorizontal: layout.screenPadding, paddingBottom: 16 },
  list: { paddingHorizontal: layout.screenPadding },
});
