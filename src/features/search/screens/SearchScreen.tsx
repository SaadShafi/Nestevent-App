import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EventCard } from '@/components/EventCard';
import { AppText, Button, EmptyState, Header, Screen, SearchBar, SegmentTabs } from '@/components/ui';
import { USERS, findUser } from '@/data/mock';
import type { EventItem, Organization, User } from '@/data/types';
import { formatCompact } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { DEFAULT_COORDS, distanceKm } from '@/lib/location';
import { useAuthStore, useEventsStore } from '@/store';

import { tabPath } from '../../home/utils';
import { OrgCard } from '../components/OrgCard';
import { UserRow, type SearchPerson } from '../components/UserRow';

type Quick = 'Events' | 'Organizations' | 'Users' | 'Tonight';
type Chip = Quick | '';

const QUICK: { key: Chip; label: string }[] = [
  { key: 'Events', label: 'Events' },
  { key: 'Organizations', label: 'Organizations' },
  { key: 'Users', label: 'Users' },
  { key: 'Tonight', label: 'Tonight' },
];

const isQuick = (v: unknown): v is Quick => v === 'Events' || v === 'Organizations' || v === 'Users' || v === 'Tonight';

const sameDay = (iso: string, ref: Date) => {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
};

const matches = (q: string, ...fields: (string | undefined)[]) =>
  q.length === 0 || fields.some((f) => f?.toLowerCase().includes(q));

const personFromUser = (u: User): SearchPerson => ({
  id: u.id,
  name: u.displayName,
  avatar: u.avatar,
  kind: 'people',
  meta: `${u.mutualFriends ?? 0} Mutual Friends`,
});

const personFromOrg = (o: Organization): SearchPerson => ({
  id: o.id,
  name: o.name,
  avatar: o.logo,
  kind: 'promoter',
  meta: `${formatCompact(o.followers)} followers`,
});

export function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; filter?: string; results?: string }>();
  const events = useEventsStore((s) => s.events);
  const organizations = useEventsStore((s) => s.organizations);
  const recentSearches = useEventsStore((s) => s.recentSearches);
  const addRecentSearch = useEventsStore((s) => s.addRecentSearch);
  const filters = useEventsStore((s) => s.filters);
  const resetFilters = useEventsStore((s) => s.resetFilters);
  const myCoords = useAuthStore((s) => s.coords);

  const fromFilter = params.results === '1';
  const [query, setQuery] = useState(params.q ?? '');
  const [chip, setChip] = useState<Chip>(() => {
    if (fromFilter) return filters.category;
    return isQuick(params.filter) ? params.filter : '';
  });
  const [applyFilters, setApplyFilters] = useState(fromFilter);

  // Re-sync when navigated to again with different params (tab screens stay mounted).
  useEffect(() => {
    if (params.q != null) setQuery(params.q);
    if (fromFilter) {
      setChip(filters.category);
      setApplyFilters(true);
    } else if (isQuick(params.filter)) {
      setChip(params.filter);
      setApplyFilters(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q, params.filter, params.results]);

  const q = query.trim().toLowerCase();
  const showRecent = q.length === 0 && chip === '';
  const active: Quick = chip === '' ? 'Events' : chip;

  const orgName = (id: string) => organizations.find((o) => o.id === id)?.name;

  const eventResults = useMemo<EventItem[]>(() => {
    const now = new Date();
    let list = events.filter(
      (e) => e.status !== 'draft' && matches(q, e.title, e.subtitle, e.city, e.genre, e.category, e.venueName, orgName(e.organizationId)),
    );
    if (active === 'Tonight') list = list.filter((e) => sameDay(e.startDate, now));
    if (applyFilters) {
      list = list.filter((e) => e.priceFrom >= filters.priceMin && e.priceFrom <= filters.priceMax);
      if (filters.date) list = list.filter((e) => sameDay(e.startDate, new Date(filters.date as string)));
      // Distance from the user's location (falls back to the app's default city); events without coords are kept.
      const origin = myCoords ?? DEFAULT_COORDS;
      list = list.filter((e) => {
        if (!e.coords) return true;
        const d = distanceKm(origin, e.coords);
        return d >= filters.distanceMin && d <= filters.distanceMax;
      });
      // Location text: loose match against the event's city / address so "Celina, Delaware" still narrows results.
      const loc = filters.location.trim().toLowerCase();
      if (loc) {
        const tokens = loc.split(/[,\s]+/).filter((t) => t.length > 2);
        const byCity = list.filter((e) => tokens.some((t) => `${e.city} ${e.address} ${e.country}`.toLowerCase().includes(t)));
        if (byCity.length) list = byCity;
      }
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, organizations, q, active, applyFilters, filters, myCoords]);

  const orgResults = useMemo(
    () => organizations.filter((o) => matches(q, o.name, o.type, o.category, ...o.categories)),
    [organizations, q],
  );

  const userResults = useMemo<SearchPerson[]>(() => {
    const people = USERS.filter((u) => u.kind !== 'promoter' && matches(q, u.displayName)).map(personFromUser);
    const promoters = organizations.filter((o) => matches(q, o.name)).map(personFromOrg);
    // Interleave so promoters sit among people like the Figma list.
    const out: SearchPerson[] = [];
    let pi = 0;
    people.forEach((p, i) => {
      out.push(p);
      if (i % 2 === 0 && pi < promoters.length) out.push(promoters[pi++]);
    });
    while (pi < promoters.length) out.push(promoters[pi++]);
    return out;
  }, [q, organizations]);

  const recent = useMemo<SearchPerson[]>(() => recentSearches.map((id) => personFromUser(findUser(id))), [recentSearches]);

  const viewProfile = (p: SearchPerson) => {
    haptic.light();
    if (p.kind === 'promoter') router.push(`/organization/${p.id}`);
    else {
      addRecentSearch(p.id);
      router.push(`/user/${p.id}`);
    }
  };

  const clearFilters = () => {
    haptic.selection();
    resetFilters();
    setApplyFilters(false);
    setChip('');
  };

  const goBack = () => {
    // "Filter Result" is a mode of the Search tab, not a pushed screen: back returns to plain search.
    if (applyFilters) return clearFilters();
    if (router.canGoBack()) router.back();
    else router.replace(tabPath('home'));
  };

  const filterSummary = [
    filters.location.trim(),
    filters.date ? new Date(filters.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null,
    `$${filters.priceMin}–$${filters.priceMax}`,
    `${filters.distanceMin}–${filters.distanceMax} km`,
  ]
    .filter(Boolean)
    .join(' · ');

  const renderResults = () => {
    if (active === 'Organizations') {
      return orgResults.length ? (
        orgResults.map((o) => <OrgCard key={o.id} org={o} />)
      ) : (
        <EmptyState icon="business-outline" title="No organizations found" message="Try a different name or category." />
      );
    }
    if (active === 'Users') {
      return userResults.length ? (
        userResults.map((p) => <UserRow key={p.id} person={p} onView={() => viewProfile(p)} />)
      ) : (
        <EmptyState icon="people-outline" title="No users found" message="Check the spelling or try another name." />
      );
    }
    if (eventResults.length) return eventResults.map((e) => <EventCard key={e.id} event={e} />);
    return (
      <View>
        <EmptyState
          icon={active === 'Tonight' ? 'moon-outline' : 'calendar-outline'}
          title={active === 'Tonight' ? 'Nothing on tonight' : applyFilters ? 'No events match your filters' : 'No events found'}
          message={
            applyFilters
              ? 'Try widening the price range or picking another date.'
              : active === 'Tonight'
                ? 'Check back later or browse upcoming events.'
                : 'Try another keyword or quick filter.'
          }
        />
      </View>
    );
  };

  return (
    <Screen withTabBar scroll glow={showRecent || active === 'Users'}>
      <Header title={applyFilters ? 'Filter Result' : 'Search'} onBack={goBack} />
      {!applyFilters ? (
        <SearchBar
          placeholder="Events, organizations or users"
          value={query}
          onChangeText={setQuery}
          autoFocus={params.q === ''}
          onFilterPress={() => router.push('/filter')}
        />
      ) : null}

      {showRecent ? (
        <>
          <AppText variant="h3" style={styles.label}>
            Recent Search
          </AppText>
          {recent.length ? (
            recent.map((p) => <UserRow key={p.id} person={p} onView={() => viewProfile(p)} />)
          ) : (
            <EmptyState icon="time-outline" title="No recent searches" message="People you look up will show here." />
          )}
        </>
      ) : (
        <>
          {!applyFilters ? (
            <>
              <AppText variant="h3" style={styles.label}>
                Quick filters
              </AppText>
              <SegmentTabs
                variant="orange"
                scrollable
                items={QUICK}
                value={chip}
                onChange={(k) => setChip(k)}
                style={styles.tabs}
              />
            </>
          ) : (
            <View style={styles.filterBar}>
              <View style={styles.flex}>
                <AppText variant="label">{active}</AppText>
                <AppText variant="caption" secondary numberOfLines={1}>
                  {filterSummary}
                </AppText>
              </View>
              <Button title="Edit" variant="surface" size="sm" fullWidth={false} onPress={() => router.push('/filter')} />
              <Button title="Clear" variant="outline" size="sm" fullWidth={false} onPress={clearFilters} />
            </View>
          )}
          {renderResults()}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: 20, marginBottom: 12 },
  tabs: { paddingBottom: 20 },
  flex: { flex: 1 },
  filterBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 16 },
});
