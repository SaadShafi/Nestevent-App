import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, BottomSheet, Button, EmptyState, Header, Icon, ListRow, MCIcon, Screen, SearchBar, useToast } from '@/components/ui';
import type { TrackingLink } from '@/data/types';
import { formatCurrency } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { shareContent } from '@/lib/share';
import { useOrganizerStore } from '@/store';
import { colors, radius } from '@/theme';

import { StatIcon, StatsRow } from '../../components/StatsRow';
import { formatMonthRange, formatNumber } from '../../utils';
import { TrackingLinkCard } from '../components/TrackingLinkCard';

type Sort = 'recent' | 'clicks';

/** Tracking Link Performance: totals, search, sort and the list of tracking links. */
export function TrackingLinksScreen() {
  const router = useRouter();
  const toast = useToast();
  const links = useOrganizerStore((s) => s.trackingLinks);
  const removeTrackingLink = useOrganizerStore((s) => s.removeTrackingLink);

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('recent');
  const [moreFor, setMoreFor] = useState<TrackingLink | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? links.filter((l) => l.campaign.toLowerCase().includes(q) || l.url.toLowerCase().includes(q)) : links;
    return [...list].sort((a, b) =>
      sort === 'clicks' ? b.clicks - a.clicks : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [links, query, sort]);

  const totals = useMemo(
    () =>
      links.reduce(
        (t, l) => ({ clicks: t.clicks + l.clicks, sales: t.sales + l.sales, revenue: t.revenue + l.revenue }),
        { clicks: 0, sales: 0, revenue: 0 },
      ),
    [links],
  );
  const conversion = totals.clicks > 0 ? `${((totals.sales / totals.clicks) * 100).toFixed(1)}%` : '0%';

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const featured = filtered[0] ?? links[0];

  const copy = async (l: TrackingLink) => {
    await Clipboard.setStringAsync(`https://${l.url}`);
    haptic.success();
    toast('Link copied', 'success');
  };

  return (
    <Screen
      scroll
      footer={<Button title="Generate New link" variant="white" onPress={() => router.push('/organizer/marketing/tracking-links/create')} />}>
      <Header title="Tracking Link Performance" />

      {featured ? (
        <View style={styles.hero}>
          <View style={styles.flex}>
            <AppText variant="h1" numberOfLines={1}>
              {featured.campaign}
            </AppText>
            <AppText variant="caption" color={colors.primaryLight} numberOfLines={1}>
              {featured.url}
            </AppText>
          </View>
          <Pressable
            onPress={() => toast('Showing the last 30 days')}
            style={({ pressed }) => [styles.datePill, pressed && styles.pressed]}>
            <AppText variant="captionMedium">{formatMonthRange(start, end)}</AppText>
            <Icon name="calendar-outline" size={14} color={colors.text} />
          </Pressable>
        </View>
      ) : null}

      <StatsRow
        style={styles.stats}
        items={[
          {
            value: formatNumber(totals.clicks),
            label: 'Clicks',
            icon: (
              <StatIcon>
                <MCIcon name="cursor-default-click-outline" size={15} color={colors.primary} />
              </StatIcon>
            ),
          },
          {
            value: formatNumber(totals.sales),
            label: 'Sales',
            icon: (
              <StatIcon>
                <Icon name="bag-outline" size={15} color={colors.primary} />
              </StatIcon>
            ),
          },
          {
            value: formatCurrency(totals.revenue),
            label: 'Revenue',
            icon: (
              <StatIcon>
                <Icon name="logo-usd" size={15} color={colors.primary} />
              </StatIcon>
            ),
          },
          {
            value: conversion,
            label: 'Conversion',
            icon: (
              <StatIcon>
                <MCIcon name="percent-outline" size={15} color={colors.primary} />
              </StatIcon>
            ),
          },
        ]}
      />

      <SearchBar placeholder="Search tracking link..." value={query} onChangeText={setQuery} containerStyle={styles.search} />

      <View style={styles.listHeader}>
        <AppText variant="label">All Tracking Links {links.length}</AppText>
        <Pressable
          onPress={() => {
            haptic.selection();
            setSort((s) => (s === 'recent' ? 'clicks' : 'recent'));
          }}
          hitSlop={8}
          style={styles.sort}>
          <AppText variant="caption" secondary>
            Sort: <AppText variant="captionMedium">{sort === 'recent' ? 'Recent' : 'Clicks'}</AppText>
          </AppText>
          <Icon name="chevron-down" size={14} color={colors.text} />
        </Pressable>
      </View>

      {filtered.length === 0 ? (
        <EmptyState icon="link-outline" title="No tracking links" message="Generate a link to attribute sales to promoters." />
      ) : (
        filtered.map((l) => <TrackingLinkCard key={l.id} link={l} onCopy={() => copy(l)} onMore={() => setMoreFor(l)} />)
      )}

      <BottomSheet visible={!!moreFor} onClose={() => setMoreFor(null)} title={moreFor?.campaign}>
        <ListRow
          title="Share"
          icon="share-social-outline"
          onPress={() => {
            const l = moreFor;
            setMoreFor(null);
            if (l) shareContent({ title: l.campaign, message: `Get tickets: ${l.url}`, url: `https://${l.url}` });
          }}
        />
        <ListRow
          title="Copy link"
          icon="copy-outline"
          onPress={() => {
            const l = moreFor;
            setMoreFor(null);
            if (l) copy(l);
          }}
        />
        <ListRow
          title="Delete"
          icon="trash-outline"
          danger
          onPress={() => {
            const l = moreFor;
            setMoreFor(null);
            if (!l) return;
            removeTrackingLink(l.id);
            haptic.success();
            toast('Tracking link deleted', 'success');
          }}
        />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.8 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    height: 36,
  },
  stats: { marginBottom: 16 },
  search: { marginBottom: 16 },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sort: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
