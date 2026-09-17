import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { DonutChart, LineChart } from '@/components/charts';
import { AppText, BottomSheet, Button, Card, EmptyState, Header, Icon, Screen, Select, StatCard } from '@/components/ui';
import { EventCard } from '@/components/EventCard';
import { useEvent } from '@/hooks/useEvent';
import { formatCurrency } from '@/lib/format';
import { colors, radius } from '@/theme';

import { StatIcon } from '../../components/StatsRow';
import { formatMonthRange, formatNumber } from '../../utils';

/** Monthly shape of the sales curve (share of the year's total per month). */
const SALES_SHAPE = [0.076, 0.116, 0.097, 0.062, 0.093, 0.057, 0.069, 0.102, 0.083, 0.052, 0.097, 0.096];
const SALES_LABELS = ['Jan', 'Mar', 'May', 'Jul'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Order = 'order' | 'revenue' | 'tickets';
const ORDER_OPTIONS: { value: Order; label: string }[] = [
  { value: 'order', label: 'Orders' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'tickets', label: 'Tickets' },
];

const RANGES = [
  { key: '30', label: 'Last 30 days', days: 30 },
  { key: '7', label: 'Last 7 days', days: 7 },
  { key: '90', label: 'Last 90 days', days: 90 },
];

/** Full analytics for one event: KPIs, sales line chart, ticket-type donut and summary. */
export function EventAnalyticsScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const event = useEvent(eventId);
  const [order, setOrder] = useState<Order>('order');
  const [rangeKey, setRangeKey] = useState('30');
  const [rangeOpen, setRangeOpen] = useState(false);

  if (!event) {
    return (
      <Screen>
        <Header title="Event Analytics" />
        <EmptyState icon="analytics-outline" title="Event not found" />
      </Screen>
    );
  }

  const stats = event.stats ?? { revenue: 24580, ticketsSold: 1245, pageVisits: 18352 };
  const range = RANGES.find((r) => r.key === rangeKey) ?? RANGES[0];
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - range.days);
  const conversion = stats.pageVisits > 0 ? `${((stats.ticketsSold / stats.pageVisits) * 100).toFixed(1)}%` : '0%';

  const general = Math.round(stats.revenue * 0.65);
  const vip = Math.round(stats.revenue * 0.2);
  const early = stats.revenue - general - vip;

  // Series for the line chart follows the selected metric; the lowest month is highlighted.
  const seriesTotal = order === 'revenue' ? stats.revenue : order === 'tickets' ? stats.ticketsSold : Math.round(stats.ticketsSold / 2.1);
  const series = SALES_SHAPE.map((share) => Math.round(seriesTotal * share));
  const lowIndex = series.reduce((best, v, i) => (v < series[best] ? i : best), 0);
  const lowValue = order === 'revenue' ? formatCurrency(series[lowIndex]) : formatNumber(series[lowIndex]);
  const metricLabel = order === 'revenue' ? 'revenue' : order === 'tickets' ? 'ticket sales' : 'orders';

  return (
    <Screen scroll>
      <Header title="Event Analytics" />
      <EventCard event={event} height={320} favoritable={false} onPress={() => router.push(`/organizer/event/${event.id}`)} />

      <Pressable onPress={() => setRangeOpen(true)} style={({ pressed }) => [styles.rangePill, pressed && styles.pressed]}>
        <AppText variant="label">{formatMonthRange(start, end)}</AppText>
        <Icon name="calendar-outline" size={18} color={colors.text} />
      </Pressable>

      <View style={styles.stats}>
        <StatCard
          value={formatCurrency(stats.revenue)}
          label="Revenue"
          icon={
            <StatIcon>
              <Icon name="wallet-outline" size={15} color={colors.primary} />
            </StatIcon>
          }
        />
        <StatCard
          value={formatNumber(stats.ticketsSold)}
          label="Tickets"
          icon={
            <StatIcon>
              <Icon name="ticket-outline" size={15} color={colors.primary} />
            </StatIcon>
          }
        />
        <StatCard
          value={formatNumber(stats.pageVisits)}
          label="Page Visits"
          icon={
            <StatIcon>
              <Icon name="eye-outline" size={15} color={colors.primary} />
            </StatIcon>
          }
        />
      </View>

      <Select options={ORDER_OPTIONS} value={order} onChange={setOrder} sheetTitle="Chart metric" />

      <Card style={styles.card}>
        <AppText variant="h2">Sales Performance</AppText>
        <AppText variant="caption" secondary style={styles.cardCaption}>
          {formatMonthRange(start, end)}
        </AppText>
        <LineChart
          values={series}
          labels={SALES_LABELS}
          highlightIndex={lowIndex}
          highlightLabel={`${lowValue}: Low ${metricLabel} in ${MONTHS[lowIndex]}`}
        />
        <View style={styles.growth}>
          <AppText variant="h1" color={colors.primary}>
            30%
          </AppText>
          <AppText variant="caption" secondary style={styles.flex}>
            Your sales performance is 30% better compare to last month
          </AppText>
        </View>
      </Card>

      <Card style={styles.card}>
        <AppText variant="h2">Top Tickets Types</AppText>
        <AppText variant="caption" secondary style={styles.cardCaption}>
          {formatMonthRange(start, end)}
        </AppText>
        <DonutChart
          slices={[
            { label: 'General', value: 65, color: colors.primaryLight, amountLabel: formatCurrency(general) },
            { label: 'VIP', value: 20, color: colors.chart2, amountLabel: formatCurrency(vip) },
            { label: 'Early Birds', value: 15, color: colors.chart3, amountLabel: formatCurrency(early) },
          ]}
        />
      </Card>

      <Card style={styles.card}>
        <AppText variant="h2" style={styles.summaryTitle}>
          Summary
        </AppText>
        <SummaryRow label="Total Revenue" value={formatCurrency(stats.revenue)} />
        <SummaryRow label="Total Tickets Sold" value={formatNumber(stats.ticketsSold)} />
        <SummaryRow label="Total Page Visits" value={formatNumber(stats.pageVisits)} />
        <SummaryRow label="Conversions Rate ( Tickets sold/ Visits )" value={conversion} />
      </Card>

      <BottomSheet visible={rangeOpen} onClose={() => setRangeOpen(false)} title="Date range">
        {RANGES.map((r) => (
          <Pressable
            key={r.key}
            onPress={() => {
              setRangeKey(r.key);
              setRangeOpen(false);
            }}
            style={[styles.rangeRow, r.key === rangeKey && styles.rangeRowActive]}>
            <AppText variant="title" style={styles.flex}>
              {r.label}
            </AppText>
            {r.key === rangeKey ? <Icon name="checkmark-circle" size={20} color={colors.primary} /> : null}
          </Pressable>
        ))}
        <Button title="Done" variant="white" onPress={() => setRangeOpen(false)} style={styles.done} />
      </BottomSheet>
    </Screen>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <AppText variant="caption" secondary style={styles.flex}>
        {label}
      </AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.8 },
  rangePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    height: 50,
    marginBottom: 14,
  },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  card: { marginBottom: 14 },
  cardCaption: { marginBottom: 14 },
  growth: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  summaryTitle: { marginBottom: 8 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  rangeRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 8, backgroundColor: colors.surface },
  rangeRowActive: { borderWidth: 1.5, borderColor: colors.primary },
  done: { marginTop: 8 },
});
