import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppText, Card, EmptyState, Header, Screen } from '@/components/ui';
import type { Ticket } from '@/data/types';
import { useEvent } from '@/hooks/useEvent';
import { formatCurrency, formatEventDate } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useTicketsStore } from '@/store';
import { colors, radius } from '@/theme';

type Group = { name: string; qty: number; price: number; first: Ticket };

/** Modal route: own SafeAreaProvider so the top inset is right both as an iOS sheet and full-screen (see CartScreen). */
export function TicketOrderScreen() {
  return (
    <SafeAreaProvider>
      <TicketOrderBody />
    </SafeAreaProvider>
  );
}

function TicketOrderBody() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = useEvent(id);
  const myTickets = useTicketsStore((s) => s.myTickets);

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Group>();
    myTickets
      .filter((t) => t.eventId === id)
      .forEach((t) => {
        const price = event?.ticketTypes.find((tt) => tt.id === t.ticketTypeId)?.price ?? (t.qty ? t.cost / t.qty : 0);
        const g = map.get(t.ticketTypeName);
        if (g) g.qty += t.qty;
        else map.set(t.ticketTypeName, { name: t.ticketTypeName, qty: t.qty, price, first: t });
      });
    return [...map.values()];
  }, [myTickets, id, event]);

  return (
    <Screen scroll>
      <Header title="Ticket Order" left="close" />
      {groups.length === 0 ? (
        <EmptyState icon="ticket-outline" title="No tickets for this event" message="Tickets you buy will show up here." />
      ) : (
        groups.map((g) => (
          <Card key={g.name} style={styles.card} padding={18}>
            <View style={styles.top}>
              <View style={styles.flex}>
                <AppText variant="h2">{g.name}</AppText>
                <AppText variant="caption" secondary style={styles.meta}>
                  {formatCurrency(g.price)} · {event ? formatEventDate(event.startDate) : ''}
                </AppText>
              </View>
              <View style={styles.pill}>
                <AppText variant="captionMedium">{g.qty} Tickets</AppText>
              </View>
            </View>
            <Pressable
              onPress={() => {
                haptic.light();
                router.push(`/ticket/${g.first.id}`);
              }}
              hitSlop={8}
              style={styles.link}>
              <AppText variant="label">View Tickets</AppText>
            </Pressable>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { marginBottom: 14 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  meta: { marginTop: 4 },
  pill: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill },
  link: { marginTop: 14, alignSelf: 'flex-start' },
});
