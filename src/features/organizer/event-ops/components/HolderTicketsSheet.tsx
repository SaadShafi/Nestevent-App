import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, BottomSheet, Button, EmptyState, Icon } from '@/components/ui';
import type { Ticket } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { useTicketsStore } from '@/store';
import { colors, radius } from '@/theme';

import { scanStamp } from '../utils';
import { StatusPill } from './StatusPill';

type Props = {
  visible: boolean;
  onClose: () => void;
  holderName: string;
  holderAvatar?: string;
  tickets: Ticket[];
};

/**
 * Post-scan sheet (Figma "QR code" result): holder avatar + name and every ticket they hold
 * for this event, each with a green "Scanned" pill or a white "Scan" action.
 */
export function HolderTicketsSheet({ visible, onClose, holderName, holderAvatar, tickets }: Props) {
  const markScanned = useTicketsStore((s) => s.markScanned);

  return (
    <BottomSheet visible={visible} onClose={onClose} scroll closeButton>
      <View style={styles.holder}>
        <Avatar uri={holderAvatar} size={64} ring={colors.primary} />
        <AppText variant="h1" numberOfLines={2} style={styles.name}>
          {holderName}
        </AppText>
      </View>

      {tickets.length === 0 ? (
        <EmptyState icon="ticket-outline" title="No tickets" message="This guest has no tickets for this event." />
      ) : (
        tickets.map((t) => (
          <View key={t.id} style={styles.row}>
            <View style={styles.rowIcon}>
              <Icon name="ticket-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <AppText variant="title">
                {t.ticketTypeName}
                {t.qty > 1 ? ` × ${t.qty}` : ''}
              </AppText>
              <AppText variant="caption" secondary>
                {t.scanned ? `Scanned ${scanStamp(t.scannedAt ?? t.purchasedAt)}` : `Scan ${scanStamp(t.purchasedAt)}`}
              </AppText>
            </View>
            {t.scanned ? (
              <StatusPill label="Scanned" tone="success" icon="checkmark" />
            ) : (
              <Button
                title="Scan"
                variant="white"
                size="sm"
                fullWidth={false}
                left={<Icon name="scan-outline" size={14} color={colors.black} />}
                onPress={() => {
                  markScanned(t.id);
                  haptic.success();
                }}
              />
            )}
          </View>
        ))
      )}
      <Button title="Done" variant="surface" onPress={onClose} style={styles.done} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  holder: { alignItems: 'center', gap: 12, marginBottom: 20, marginTop: 4 },
  name: { textAlign: 'center', paddingHorizontal: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
  },
  rowIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  done: { marginTop: 8 },
});
