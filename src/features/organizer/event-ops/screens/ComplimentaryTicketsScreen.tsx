import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Button, EmptyState, Header, Screen, SearchBar, useToast } from '@/components/ui';
import { USERS } from '@/data/mock';
import type { User } from '@/data/types';
import { useEvent } from '@/hooks/useEvent';
import { haptic } from '@/lib/haptics';
import { useTicketsStore } from '@/store';
import { colors, radius } from '@/theme';

import { ChooseTicketTypeSheet } from '../../shared/ChooseTicketTypeSheet';

const GUESTS = USERS.filter((u) => u.id.startsWith('u_f'));

/** Send Complimentary Tickets — pick a guest, choose a ticket type + quantity, send for free. */
export function ComplimentaryTicketsScreen() {
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = useEvent(id);
  const soldTickets = useTicketsStore((s) => s.soldTickets);
  const sendComplimentary = useTicketsStore((s) => s.sendComplimentary);
  const [query, setQuery] = useState('');
  const [recipient, setRecipient] = useState<User | null>(null);

  const sentTo = useMemo(
    () => new Set(soldTickets.filter((t) => t.eventId === id && t.complimentary).map((t) => t.holderName)),
    [soldTickets, id],
  );

  const guests = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GUESTS;
    return GUESTS.filter((u) => [u.displayName, u.phone, u.email].some((v) => v.toLowerCase().includes(q)));
  }, [query]);

  const ticketTypes = useMemo(() => (event?.ticketTypes ?? []).filter((t) => t.enabled || t.isGuestList), [event]);

  return (
    <Screen scroll keyboard>
      <Header title="Complimentary Tickets" />
      <SearchBar placeholder="Search by Name, Phone, Email" value={query} onChangeText={setQuery} containerStyle={styles.search} />

      {guests.length === 0 ? (
        <EmptyState icon="people-outline" title="No guests found" message="Try a different name, phone number or email." />
      ) : (
        guests.map((u) => {
          const sent = sentTo.has(u.displayName);
          return (
            <View key={u.id} style={styles.row}>
              <Avatar uri={u.avatar} size={48} />
              <View style={styles.flex}>
                <AppText variant="title" numberOfLines={1}>
                  {u.displayName}
                </AppText>
                <AppText variant="caption" secondary>
                  {u.phone}
                </AppText>
              </View>
              <Button
                title={sent ? 'Sent' : 'Send Ticket'}
                variant={sent ? 'surface' : 'white'}
                size="sm"
                fullWidth={false}
                disabled={sent}
                onPress={() => {
                  if (!ticketTypes.length) {
                    haptic.error();
                    toast('Add a ticket type to this event first', 'error');
                    return;
                  }
                  setRecipient(u);
                }}
              />
            </View>
          );
        })
      )}

      <ChooseTicketTypeSheet
        visible={!!recipient}
        onClose={() => setRecipient(null)}
        ticketTypes={ticketTypes}
        onSend={(tt, qty) => {
          if (!recipient || !event) return;
          sendComplimentary({
            eventId: event.id,
            ticketTypeId: tt.id,
            ticketTypeName: tt.name,
            qty,
            recipientName: recipient.displayName,
            recipientAvatar: recipient.avatar,
          });
          haptic.success();
          setRecipient(null);
          router.push(`/organizer/event/${event.id}/ticket-sent`);
        }}
      />
    </Screen>
  );
}

export default ComplimentaryTicketsScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  search: { marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 12,
    marginBottom: 10,
  },
});
