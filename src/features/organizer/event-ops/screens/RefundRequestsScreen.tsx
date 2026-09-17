import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, BottomSheet, Button, EmptyState, Header, Screen, SegmentTabs, useToast } from '@/components/ui';
import type { Order } from '@/data/types';
import { formatCurrency, formatEventDate } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useTicketsStore } from '@/store';
import { colors } from '@/theme';

import { StatusPill } from '../components/StatusPill';
import { orderNumber } from '../../shared/utils';

type Tab = 'pending' | 'resolved';
const TABS: { key: Tab; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'resolved', label: 'Resolved' },
];

const ticketLabel = (o: Order) => o.lines.map((l) => l.ticketTypeName).join(', ');

/** Refund Requests — approve / decline pending refunds for this event. */
export function RefundRequestsScreen() {
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orders = useTicketsStore((s) => s.orders);
  const resolveRefund = useTicketsStore((s) => s.resolveRefund);
  const [tab, setTab] = useState<Tab>('pending');
  const [detailId, setDetailId] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      orders.filter((o) => {
        if (o.eventId !== id) return false;
        return tab === 'pending' ? o.status === 'refund_requested' : o.status === 'refunded' || o.status === 'declined';
      }),
    [orders, id, tab],
  );
  const detail = orders.find((o) => o.id === detailId) ?? null;

  const resolve = (action: 'approve' | 'decline') => {
    if (!detail) return;
    resolveRefund(detail.id, action);
    if (action === 'approve') haptic.success();
    else haptic.medium();
    toast(action === 'approve' ? `Refund of ${formatCurrency(detail.total, { decimals: 2 })} approved` : 'Refund request declined', action === 'approve' ? 'success' : 'info');
    setDetailId(null);
  };

  return (
    <Screen scroll>
      <Header title="Refund Requests" />
      <SegmentTabs items={TABS} value={tab} onChange={setTab} style={styles.tabs} />

      {rows.length === 0 ? (
        <EmptyState
          icon="cash-outline"
          title={tab === 'pending' ? 'No pending requests' : 'Nothing resolved yet'}
          message={tab === 'pending' ? 'Refund requests from attendees will appear here.' : 'Approved and declined refunds will be listed here.'}
        />
      ) : (
        rows.map((o) => (
          <View key={o.id} style={styles.card}>
            <View style={styles.top}>
              <Avatar uri={o.buyerAvatar} size={44} />
              <View style={styles.flex}>
                <AppText variant="h3" numberOfLines={1}>
                  {o.buyerName}
                </AppText>
                <AppText variant="caption" secondary>
                  {ticketLabel(o)} · {orderNumber(o.id, true)}
                </AppText>
              </View>
              <AppText variant="h2">{formatCurrency(o.total, { decimals: 2 })}</AppText>
            </View>
            <View style={styles.reason}>
              <AppText variant="caption" secondary>
                Reason
              </AppText>
              <AppText variant="body">{o.refundReason ?? 'No reason provided'}</AppText>
            </View>
            <View style={styles.actions}>
              {o.status === 'refunded' ? (
                <StatusPill label="Refunded" tone="success" icon="checkmark" />
              ) : o.status === 'declined' ? (
                <StatusPill label="Declined" tone="danger" icon="close" />
              ) : (
                <StatusPill label="Pending" tone="primary" />
              )}
              <Pressable
                onPress={() => {
                  haptic.light();
                  setDetailId(o.id);
                }}
                hitSlop={8}>
                <AppText variant="label" color={colors.primary}>
                  View Detail
                </AppText>
              </Pressable>
            </View>
          </View>
        ))
      )}

      <BottomSheet visible={!!detail} onClose={() => setDetailId(null)} title="Refund request">
        {detail ? (
          <>
            <View style={styles.detailHolder}>
              <Avatar uri={detail.buyerAvatar} size={48} />
              <View style={styles.flex}>
                <AppText variant="title">{detail.buyerName}</AppText>
                <AppText variant="caption" secondary>
                  {orderNumber(detail.id, true)} · {formatEventDate(detail.createdAt)}
                </AppText>
              </View>
            </View>
            {detail.lines.map((l, i) => (
              <View key={`${l.ticketTypeId}-${i}`} style={styles.line}>
                <AppText secondary style={styles.flex}>
                  {l.ticketTypeName} × {l.qty}
                </AppText>
                <AppText variant="bodyMedium">{formatCurrency(l.qty * l.price, { decimals: 2 })}</AppText>
              </View>
            ))}
            <View style={styles.line}>
              <AppText secondary style={styles.flex}>
                Tax
              </AppText>
              <AppText variant="bodyMedium">{formatCurrency(detail.tax, { decimals: 2 })}</AppText>
            </View>
            <View style={[styles.line, styles.total]}>
              <AppText variant="title" style={styles.flex}>
                Refund total
              </AppText>
              <AppText variant="h3">{formatCurrency(detail.total, { decimals: 2 })}</AppText>
            </View>
            <View style={styles.reasonBox}>
              <AppText variant="caption" secondary>
                Reason
              </AppText>
              <AppText>{detail.refundReason ?? 'No reason provided'}</AppText>
            </View>
            {detail.status === 'refund_requested' ? (
              <View style={styles.buttons}>
                <Button title="Decline" variant="danger" style={styles.flex} onPress={() => resolve('decline')} />
                <Button title="Approve" variant="success" style={styles.flex} onPress={() => resolve('approve')} />
              </View>
            ) : (
              <View style={styles.resolved}>
                <StatusPill
                  label={detail.status === 'refunded' ? 'Refunded' : 'Declined'}
                  tone={detail.status === 'refunded' ? 'success' : 'danger'}
                  icon={detail.status === 'refunded' ? 'checkmark' : 'close'}
                />
              </View>
            )}
          </>
        ) : null}
      </BottomSheet>
    </Screen>
  );
}

export default RefundRequestsScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabs: { marginBottom: 16 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 14, marginBottom: 12 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reason: { marginTop: 12, gap: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  detailHolder: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  line: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  total: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, marginTop: 4 },
  reasonBox: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, gap: 4, marginTop: 12, marginBottom: 16 },
  buttons: { flexDirection: 'row', gap: 12 },
  resolved: { alignItems: 'center', paddingVertical: 4 },
});
