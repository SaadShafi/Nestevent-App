import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon, IconButton, Toggle } from '@/components/ui';
import type { TicketType } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

import { ticketSummary } from './utils';

type Props = {
  ticket: TicketType;
  selected?: boolean;
  onPress?: () => void;
  /** Circular pencil + red trash on the right (Ticket Types hub) */
  onEdit?: () => void;
  onRemove?: () => void;
  /** Toggle for the guest-list row */
  onToggle?: (v: boolean) => void;
  /** Inline "Edit" pencil link next to the name (Review Event) */
  editLink?: () => void;
  right?: ReactNode;
  showQty?: boolean;
};

/** Ticket type card used by the wizard hub, Review Event and the Choose Ticket Type sheet. */
export function TicketTypeCard({ ticket, selected, onPress, onEdit, onRemove, onToggle, editLink, right, showQty = true }: Props) {
  const guest = !!ticket.isGuestList;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, selected && styles.selected, pressed && onPress && styles.pressed]}>
      <View style={styles.row}>
        {guest ? (
          <View style={styles.guestIcon}>
            <Icon name="people" size={22} color={colors.primary} />
          </View>
        ) : null}
        <View style={styles.flex}>
          <View style={styles.nameRow}>
            <AppText variant="h2">{ticket.name}</AppText>
            {editLink ? (
              <Pressable onPress={editLink} hitSlop={8} style={styles.editLink}>
                <Icon name="pencil" size={12} color={colors.text} />
                <AppText variant="captionMedium">Edit</AppText>
              </Pressable>
            ) : null}
          </View>
          <AppText variant="caption" secondary style={styles.summary}>
            {ticketSummary(ticket, { qty: showQty })}
          </AppText>
        </View>
        {onEdit || onRemove ? (
          <View style={styles.actionsCol}>
            <View style={styles.actions}>
              {onEdit ? <IconButton name="pencil" size={30} iconSize={14} backgroundColor={colors.surfaceHigh} onPress={onEdit} accessibilityLabel="Edit ticket type" /> : null}
              {onRemove ? (
                <IconButton name="trash-outline" size={30} iconSize={14} color={colors.danger} backgroundColor={colors.dangerSoft} onPress={onRemove} accessibilityLabel="Remove ticket type" />
              ) : null}
            </View>
            {onToggle ? (
              <Toggle
                value={ticket.enabled}
                onValueChange={(v) => {
                  haptic.selection();
                  onToggle(v);
                }}
              />
            ) : null}
          </View>
        ) : null}
        {right}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginBottom: 14,
  },
  selected: { borderColor: colors.primary },
  pressed: { opacity: 0.9 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  editLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  summary: { marginTop: 4 },
  guestIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,107,0,0.16)', alignItems: 'center', justifyContent: 'center' },
  actionsCol: { alignItems: 'flex-end', gap: 10 },
  actions: { flexDirection: 'row', gap: 8 },
});
