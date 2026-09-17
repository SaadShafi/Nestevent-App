import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BarChart } from '@/components/charts';
import { AppText, Button, Icon, MCIcon, Select, StatCard } from '@/components/ui';
import { useMyEvents } from '@/features/organizer/hooks';
import { formatCompact, formatCurrency } from '@/lib/format';
import { useOrganizerStore } from '@/store';
import { colors, radius } from '@/theme';

import { StatIcon } from '../../components/StatsRow';

const WEEK = [
  { label: 'Mon', value: 62 },
  { label: 'Tue', value: 48 },
  { label: 'Wed', value: 55 },
  { label: 'Thu', value: 30 },
  { label: 'Fri', value: 100, tooltip: '4h' },
  { label: 'Sat', value: 46 },
  { label: 'Sun', value: 70 },
];

/** Dashboard → Analytics tab: event selector, KPI tiles, weekly bar chart, Sales / Promo tiles. */
export function AnalyticsTab() {
  const router = useRouter();
  const events = useMyEvents();
  const promos = useOrganizerStore((s) => s.promoCodes);
  const [eventId, setEventId] = useState<string | null>(null);

  const selected = events.find((e) => e.id === eventId);
  const options = useMemo(() => events.map((e) => ({ value: e.id, label: e.title })), [events]);

  // One event when selected, otherwise the totals across all of the organizer's events.
  const stats = useMemo(() => {
    const source = selected ? [selected] : events;
    return source.reduce(
      (t, e) => ({
        revenue: t.revenue + (e.stats?.revenue ?? 0),
        ticketsSold: t.ticketsSold + (e.stats?.ticketsSold ?? 0),
        pageVisits: t.pageVisits + (e.stats?.pageVisits ?? 0),
      }),
      { revenue: 0, ticketsSold: 0, pageVisits: 0 },
    );
  }, [selected, events]);
  const revenue = formatCurrency(stats.revenue, { compact: true });
  const views = formatCompact(stats.pageVisits);
  const conversion = stats.pageVisits > 0 ? `${((stats.ticketsSold / stats.pageVisits) * 100).toFixed(1)}%` : '0%';
  const sales = formatCurrency(stats.revenue, { compact: true });
  const promoPerformance = formatCurrency(
    promos.filter((p) => !selected || !p.eventId || p.eventId === selected.id).reduce((n, p) => n + p.revenue, 0),
    { compact: true },
  );

  return (
    <View style={styles.wrap}>
      <AppText variant="label" style={styles.label}>
        Individual Event Analytics
      </AppText>
      <Select options={options} value={eventId} onChange={setEventId} placeholder="All events" sheetTitle="Select event" />

      <View style={styles.stats}>
        <StatCard
          value={revenue}
          label="Revenue"
          icon={
            <StatIcon>
              <Icon name="wallet-outline" size={15} color={colors.primary} />
            </StatIcon>
          }
        />
        <StatCard
          value={views}
          label="Views"
          icon={
            <StatIcon>
              <Icon name="eye-outline" size={15} color={colors.primary} />
            </StatIcon>
          }
        />
        <StatCard
          value={conversion}
          label="Conversion"
          icon={
            <StatIcon>
              <Icon name="trending-up-outline" size={15} color={colors.primary} />
            </StatIcon>
          }
        />
      </View>

      <BarChart data={WEEK} />

      <View style={styles.tiles}>
        <View style={[styles.tile, styles.tileOrange]}>
          <View style={[styles.tileIcon, styles.tileIconLight]}>
            <Icon name="time-outline" size={22} color={colors.black} />
          </View>
          <AppText variant="label" style={styles.tileTitle}>
            Sales Over Time
          </AppText>
          <AppText variant="h1">{sales}</AppText>
        </View>
        <View style={[styles.tile, styles.tileDark]}>
          <View style={[styles.tileIcon, styles.tileIconGrey]}>
            <MCIcon name="head-cog-outline" size={22} color={colors.black} />
          </View>
          <AppText variant="label" style={styles.tileTitle}>
            Promo Performance
          </AppText>
          <AppText variant="h1">{promoPerformance}</AppText>
        </View>
      </View>

      {selected ? (
        <Button
          title="View full analytics"
          variant="white"
          style={styles.cta}
          onPress={() => router.push(`/organizer/analytics/${selected.id}`)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  label: { marginBottom: -6 },
  stats: { flexDirection: 'row', gap: 10 },
  tiles: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, borderRadius: radius.xl, padding: 16, minHeight: 156, justifyContent: 'space-between' },
  tileOrange: { backgroundColor: colors.primary },
  tileDark: { backgroundColor: colors.surface },
  tileIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  tileIconLight: { backgroundColor: '#FFD4B8' },
  tileIconGrey: { backgroundColor: '#D9D9D9' },
  tileTitle: { marginBottom: 4 },
  cta: { marginTop: 4 },
});
