import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Card, EmptyState, Header, Screen, Stepper } from '@/components/ui';
import type { TicketType } from '@/data/types';
import { useEvent } from '@/hooks/useEvent';
import { formatCurrency } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { cartTotals, useCartStore } from '@/store';
import { colors, layout, radius } from '@/theme';

import { OrderSummaryRows } from '../components/OrderSummary';

const ticketMeta = (t: TicketType) => {
  const parts = [formatCurrency(t.price), `Qty ${t.quantity.toLocaleString('en-US')}`];
  if (t.isGuestList && t.saleEnds) parts.push(`Sale ends ${t.saleEnds}`);
  else {
    parts.push(`Max ${t.maxPerOrder}`);
    if (t.ageRestriction) parts.push(t.ageRestriction);
  }
  return parts.join(' · ');
};

/**
 * Modal routes get their own SafeAreaProvider: inside an iOS sheet the native top inset is 0 (the sheet
 * already sits below the status bar) while full-screen (Android / deep link) it is the real notch inset.
 */
export function CartScreen() {
  return (
    <SafeAreaProvider>
      <CartBody />
    </SafeAreaProvider>
  );
}

function CartBody() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = useEvent(id);
  const lines = useCartStore((s) => s.lines);
  const setEvent = useCartStore((s) => s.setEvent);
  const setQty = useCartStore((s) => s.setQty);

  useEffect(() => {
    if (id) setEvent(id);
  }, [id, setEvent]);

  const priceOf = useMemo(() => {
    const map = new Map(event?.ticketTypes.map((t) => [t.id, t.price]) ?? []);
    return (ttId: string) => map.get(ttId) ?? 0;
  }, [event]);

  const totals = useMemo(() => cartTotals(lines, priceOf), [lines, priceOf]);
  const qtyOf = (ttId: string) => lines.find((l) => l.ticketTypeId === ttId)?.qty ?? 0;

  if (!event) {
    return (
      <Screen>
        <Header title="Cart" left="close" />
        <EmptyState icon="cart-outline" title="Event not found" />
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={['top']}>
      <View style={styles.headerWrap}>
        <Header title="Cart" left="close" />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {event.ticketTypes.map((t) => {
          const qty = qtyOf(t.id);
          return (
            <Card key={t.id} selected={qty > 0} style={styles.ticket} padding={18}>
              <View style={styles.flex}>
                <AppText variant="h2">{t.name}</AppText>
                <AppText variant="caption" secondary style={styles.meta}>
                  {ticketMeta(t)}
                </AppText>
              </View>
              <Stepper value={qty} min={0} max={t.maxPerOrder} onChange={(v) => setQty(t.id, v)} />
            </Card>
          );
        })}
      </ScrollView>

      <View style={[styles.summary, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <AppText variant="h2" style={styles.summaryTitle}>
          Order Summary
        </AppText>
        <OrderSummaryRows totals={totals} />
        <Button
          title="Add To Cart"
          disabled={totals.quantity === 0}
          style={styles.cta}
          onPress={() => {
            haptic.medium();
            router.push(`/event/${event.id}/checkout`);
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerWrap: { paddingHorizontal: layout.screenPadding, paddingTop: 8 },
  list: { paddingHorizontal: layout.screenPadding, paddingBottom: 24 },
  ticket: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  meta: { marginTop: 4 },
  summary: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 22,
  },
  summaryTitle: { marginBottom: 12 },
  cta: { marginTop: 20 },
});
