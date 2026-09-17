import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, ConfirmDialog, EmptyState, Header, Icon, IconButton, ListRow, Screen, useToast, type IoniconName } from '@/components/ui';
import type { TicketType } from '@/data/types';
import { useEvent, useOrganization } from '@/hooks/useEvent';
import { formatEventDate } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { shareContent } from '@/lib/share';
import { useEventsStore } from '@/store';
import { colors } from '@/theme';

import { EventOverview, GLASS } from '../components/EventOverview';

type Action = { title: string; subtitle: string; icon: IoniconName; path: (id: string) => string };

const ACTIONS: Action[] = [
  { title: 'View Analytics', subtitle: 'Revenue, Tickets Sold, Page Visits', icon: 'stats-chart-outline', path: (id) => `/organizer/analytics/${id}` },
  { title: 'Tracking Links', subtitle: 'Track clicks, sales & revenue', icon: 'link-outline', path: () => '/organizer/marketing/tracking-links' },
  { title: 'Promo Code', subtitle: 'Manage discounts and performance', icon: 'pricetag-outline', path: () => '/organizer/marketing/promo-codes' },
  { title: 'Scan Tickets', subtitle: 'Check in attendees at the door', icon: 'scan-outline', path: (id) => `/organizer/event/${id}/scan` },
  { title: 'Orders', subtitle: 'View ticket orders', icon: 'receipt-outline', path: (id) => `/organizer/event/${id}/orders` },
  { title: 'Refund Requests', subtitle: 'Approve or decline', icon: 'cash-outline', path: (id) => `/organizer/event/${id}/refunds` },
  { title: 'Send Complimentary Tickets', subtitle: 'Invite guests for free', icon: 'gift-outline', path: (id) => `/organizer/event/${id}/complimentary` },
];

/** Organizer "View Event" — guest details layout + edit/delete and the event operations menu. */
export function OrganizerEventScreen() {
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = useEvent(id);
  const org = useOrganization(event?.organizationId);
  const upsertEvent = useEventsStore((s) => s.upsertEvent);
  const deleteEvent = useEventsStore((s) => s.deleteEvent);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!event) {
    return (
      <Screen>
        <Header title="View Event" />
        <EmptyState icon="alert-circle-outline" title="Event not found" message="This event may have been deleted." />
      </Screen>
    );
  }

  const edit = () => router.push(`/organizer/event/${event.id}/edit`);
  const share = () => {
    haptic.light();
    shareContent({
      title: event.title,
      message: `${event.title} · ${formatEventDate(event.startDate)} · ${event.venueName || event.city}. Get your tickets on Nest!`,
      url: `https://nest.app/e/${event.id.replace('ev_', '')}`,
    });
  };
  const editTicket = (tt: TicketType) =>
    router.push({ pathname: '/organizer/create-event/ticket-type', params: { id: tt.id, eventId: event.id } });

  const remove = () => {
    haptic.medium();
    deleteEvent(event.id);
    toast('Event deleted', 'success');
    if (router.canGoBack()) router.back();
    else router.replace('/(organizer)/(tabs)/events');
  };

  return (
    <>
      <EventOverview
        event={event}
        org={org}
        headerTitle="View Event"
        headerRight={
          // The header's right slot is 88pt wide: two 40pt buttons fit, a third would overlap the title.
          // Delete lives in the footer.
          <>
            <IconButton name="share-social-outline" size={40} backgroundColor={GLASS} onPress={share} accessibilityLabel="Share event" />
            <IconButton name="create-outline" size={40} backgroundColor={GLASS} onPress={edit} accessibilityLabel="Edit event" />
          </>
        }
        onToggleAttendees={(v) => upsertEvent({ ...event, showAttendeesPublic: v })}
        onEditTicket={editTicket}
        footer={
          <View style={styles.footer}>
            <Button title="Delete" variant="danger" style={styles.flex} onPress={() => setConfirmDelete(true)} />
            <Button title="Edit" variant="white" style={styles.flex} onPress={edit} />
          </View>
        }>
        <AppText variant="h3" style={styles.sectionTitle}>
          Manage
        </AppText>
        {ACTIONS.map((a) => (
          <ListRow key={a.title} title={a.title} subtitle={a.subtitle} icon={a.icon} chevron onPress={() => router.push(a.path(event.id))} />
        ))}
      </EventOverview>

      <ConfirmDialog
        visible={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete event?"
        message={`"${event.title}" and its ticket types will be permanently removed.`}
        icon={<Icon name="trash-outline" size={34} color={colors.danger} />}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={remove}
      />
    </>
  );
}

export default OrganizerEventScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  footer: { flexDirection: 'row', gap: 12 },
  sectionTitle: { marginTop: 12, marginBottom: 10 },
});
