import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, EmptyState, Header, IconButton, Screen, Select, useToast } from '@/components/ui';
import { useMyEvents } from '@/features/organizer/hooks';
import { formatCurrency } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { shareContent } from '@/lib/share';
import { useOrganizerStore } from '@/store';
import { colors, radius } from '@/theme';

import { StatsRow } from '../../components/StatsRow';
import { promoDiscountLabel } from '../components/PromoCard';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Aug 1–29" or "Aug 1 – Sep 12" */
function schedule(starts: string, expires: string) {
  const s = new Date(starts);
  const e = new Date(expires);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) return `${MONTHS[s.getMonth()]} ${s.getDate()}–${e.getDate()}`;
  return `${MONTHS[s.getMonth()]} ${s.getDate()} – ${MONTHS[e.getMonth()]} ${e.getDate()}`;
}

/** Promo Code Detail: stats, eligibility / schedule / usage, edit + pause, event assignment. */
export function PromoCodeDetailScreen() {
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const promo = useOrganizerStore((s) => s.promoCodes.find((p) => p.id === id));
  const togglePromo = useOrganizerStore((s) => s.togglePromo);
  const updatePromo = useOrganizerStore((s) => s.updatePromo);
  const events = useMyEvents();
  const eventOptions = useMemo(() => events.map((e) => ({ value: e.id, label: e.title })), [events]);

  if (!promo) {
    return (
      <Screen>
        <Header title="Promo Code Detail" />
        <EmptyState icon="pricetag-outline" title="Promo code not found" />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header
        title="Promo Code Detail"
        right={
          <IconButton
            name="share-social-outline"
            onPress={() => {
              haptic.light();
              shareContent({
                title: `Promo code ${promo.code}`,
                message: `Use code ${promo.code} for ${promoDiscountLabel(promo)} on Nest tickets!`,
                url: `https://nest.app/promo/${promo.code}`,
              });
            }}
            accessibilityLabel="Share promo code"
          />
        }
      />
      <AppText variant="h1">{promo.code}</AppText>
      <AppText variant="caption" secondary style={styles.caption}>
        {promoDiscountLabel(promo)} · {promo.active ? 'Active' : 'Paused'}
      </AppText>

      <StatsRow
        style={styles.stats}
        items={[
          { value: String(promo.uses), label: 'Uses' },
          { value: formatCurrency(promo.revenue), label: 'Revenue' },
          { value: formatCurrency(promo.discounts), label: 'Discounts' },
          { value: `${promo.conversion.toFixed(1)}%`, label: 'Conversion' },
        ]}
      />

      <View style={styles.infoRow}>
        <InfoCard title="Eligible tickets" value={promo.eligible} />
        <InfoCard title="Schedule" value={schedule(promo.starts, promo.expires)} />
        <InfoCard title="Usage" value={`${promo.uses} / ${promo.usageLimit}`} />
      </View>

      <View style={styles.actions}>
        <Button
          title="Edit promo"
          variant="surface"
          size="sm"
          fullWidth={false}
          onPress={() => router.push(`/organizer/marketing/promo-codes/create?id=${promo.id}`)}
        />
        <Button
          title={promo.active ? 'Pause promo' : 'Resume promo'}
          variant="white"
          size="sm"
          fullWidth={false}
          onPress={() => {
            togglePromo(promo.id);
            haptic.success();
            toast(promo.active ? 'Promo paused' : 'Promo resumed', 'success');
          }}
        />
      </View>

      <AppText variant="label" style={styles.selectLabel}>
        Select Event
      </AppText>
      <Select
        options={eventOptions}
        value={promo.eventId ?? null}
        placeholder="Select event"
        sheetTitle="Assign to event"
        onChange={(eventId) => {
          updatePromo({ ...promo, eventId });
          haptic.selection();
          toast('Promo assigned to event', 'success');
        }}
      />
    </Screen>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.info}>
      <AppText variant="h3">{title}</AppText>
      <AppText variant="caption" secondary>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  caption: { marginTop: 2, marginBottom: 16 },
  stats: { marginBottom: 12 },
  infoRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  info: {
    flex: 1,
    minHeight: 92,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: '#2C2C3A',
    borderRadius: radius.md,
    padding: 14,
    gap: 6,
  },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  selectLabel: { marginBottom: 8 },
});
