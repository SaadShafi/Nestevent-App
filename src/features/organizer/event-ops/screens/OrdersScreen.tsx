import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, EmptyState, Header, Screen, SegmentTabs } from '@/components/ui';
import type { Order, Ticket } from '@/data/types';
import { useEvent } from '@/hooks/useEvent';
import { formatCurrency, formatEventDate } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useTicketsStore } from '@/store';
import { colors } from '@/theme';

import { HolderTicketsSheet } from '../components/HolderTicketsSheet';
import { StatusPill } from '../components/StatusPill';
import { orderNumber } from '../../shared/utils';
import { latestScan, orderQty, scanStamp, ticketsForOrder } from '../utils';

type Tab = 'all' | 'guest' | 'scanned';
const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'guest', label: 'Guest List' },
  { key: 'scanned', label: 'Scanned' },
];

type Row = { order: Order; tickets: Ticket[]; scannedAt: string | null; guestList: boolean };

/** Orders — every ticket order for this event, with Guest List and Scanned filters. */
export function OrdersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = useEvent(id);
  const orders = useTicketsStore((s) => s.orders);
  const soldTickets = useTicketsStore((s) => s.soldTickets);
  const [tab, setTab] = useState<Tab>('all');
  const [selected, setSelected] = useState<Order | null>(null);

  const rows = useMemo<Row[]>(() => {
    const guestIds = new Set((event?.ticketTypes ?? []).filter((t) => t.isGuestList).map((t) => t.id));
    return orders
      .filter((o) => o.eventId === id)
      .map((o) => {
        const tickets = ticketsForOrder(o, soldTickets);
        const guestList = o.lines.some((l) => guestIds.has(l.ticketTypeId) || /guest/i.test(l.ticketTypeName));
        return { order: o, tickets, scannedAt: latestScan(tickets), guestList };
      })
      .filter((r) => (tab === 'guest' ? r.guestList : tab === 'scanned' ? !!r.scannedAt : true));
  }, [orders, soldTickets, id, tab, event]);

  const selectedTickets = useMemo(() => (selected ? ticketsForOrder(selected, soldTickets) : []), [selected, soldTickets]);

  return (
    <Screen scroll>
      <Header title="Orders" />
      <SegmentTabs items={TABS} value={tab} onChange={setTab} style={styles.tabs} />

      {rows.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title={tab === 'scanned' ? 'No scanned tickets yet' : tab === 'guest' ? 'No guest list orders' : 'No orders yet'}
          message="Orders will show up here as soon as tickets are sold."
        />
      ) : (
        rows.map(({ order, scannedAt }) => (
          <Pressable
            key={order.id}
            onPress={() => {
              haptic.light();
              setSelected(order);
            }}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
            <View style={styles.top}>
              <Avatar uri={order.buyerAvatar} size={44} />
              <View style={styles.flex}>
                <AppText variant="h3" numberOfLines={1}>
                  {order.buyerName}
                </AppText>
                <AppText variant="caption" secondary>
                  {orderQty(order)} {orderQty(order) === 1 ? 'Ticket' : 'Tickets'} · {orderNumber(order.id)}
                </AppText>
                <AppText variant="caption" secondary>
                  {formatEventDate(order.createdAt)}
                </AppText>
              </View>
              <AppText variant="h2">{formatCurrency(order.total)}</AppText>
            </View>
            <View style={styles.bottom}>
              <View style={styles.flex}>
                <AppText variant="caption" secondary>
                  Ticket Type
                </AppText>
                <AppText variant="label" numberOfLines={1}>
                  {order.lines.map((l) => (l.qty > 1 ? `${l.ticketTypeName} × ${l.qty}` : l.ticketTypeName)).join(', ')}
                </AppText>
              </View>
              {scannedAt ? (
                <View style={styles.scanCol}>
                  <AppText variant="caption" secondary>
                    Scanned {scanStamp(scannedAt)}
                  </AppText>
                  <StatusPill label="Scanned" tone="success" icon="checkmark" />
                </View>
              ) : order.status === 'refunded' ? (
                <StatusPill label="Refunded" tone="success" />
              ) : order.status === 'declined' ? (
                <StatusPill label="Declined" tone="danger" />
              ) : order.status === 'refund_requested' ? (
                <StatusPill label="Refund requested" tone="primary" />
              ) : null}
            </View>
          </Pressable>
        ))
      )}

      <HolderTicketsSheet
        visible={!!selected}
        onClose={() => setSelected(null)}
        holderName={selected?.buyerName ?? ''}
        holderAvatar={selected?.buyerAvatar}
        tickets={selectedTickets}
      />
    </Screen>
  );
}

export default OrdersScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabs: { marginBottom: 16 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 14, marginBottom: 12 },
  pressed: { opacity: 0.9 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  scanCol: { alignItems: 'flex-end', gap: 6 },
});
