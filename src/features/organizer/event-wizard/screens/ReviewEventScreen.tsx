import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, useToast } from '@/components/ui';
import type { EventStatus, TicketType } from '@/data/types';
import { useMyOrganizations } from '@/features/organizer/hooks';
import { haptic } from '@/lib/haptics';
import { useEventsStore, useOrganizerStore } from '@/store';

import { EventOverview } from '../../event-ops/components/EventOverview';
import { buildEvent } from '../buildEvent';

/** Review Event — final wizard step; previews the event exactly like the guest details page. */
export function ReviewEventScreen() {
  const router = useRouter();
  const toast = useToast();
  const draft = useOrganizerStore((s) => s.draft);
  const setDraft = useOrganizerStore((s) => s.setDraft);
  const resetDraft = useOrganizerStore((s) => s.resetDraft);
  const existing = useEventsStore((s) => s.events.find((e) => e.id === draft.id));
  const upsertEvent = useEventsStore((s) => s.upsertEvent);
  const organizations = useEventsStore((s) => s.organizations);
  const myOrgs = useMyOrganizations();

  const org = useMemo(
    () => organizations.find((o) => o.id === draft.organizationId) ?? myOrgs[0],
    [organizations, draft.organizationId, myOrgs],
  );
  const preview = useMemo(() => buildEvent(draft, org, existing?.status ?? 'draft', existing), [draft, org, existing]);

  const submit = (status: EventStatus) => {
    if (!draft.name.trim()) {
      haptic.error();
      toast('Give your event a name first', 'error');
      return;
    }
    if (status === 'live' && draft.attendance === 'ticketed' && !draft.ticketTypes.some((t) => t.enabled)) {
      haptic.error();
      toast('Add at least one ticket type before publishing', 'error');
      router.push('/organizer/create-event/ticket-types');
      return;
    }
    const finalStatus: EventStatus = status === 'live' && existing?.status === 'past' ? 'past' : status;
    upsertEvent(buildEvent(draft, org, finalStatus, existing));
    resetDraft();
    haptic.success();
    toast(status === 'draft' ? 'Draft saved' : 'Event published', 'success');
    router.replace('/organizer/create-event/submitted');
  };

  const editTicket = (tt: TicketType) => router.push({ pathname: '/organizer/create-event/ticket-type', params: { id: tt.id } });

  return (
    <EventOverview
      event={preview}
      org={org}
      headerTitle="Review Event"
      onToggleAttendees={(v) => setDraft({ showAttendeesPublic: v })}
      onEditTicket={editTicket}
      footer={
        <View style={styles.footer}>
          <Button title="Save draft" variant="white" style={styles.flex} onPress={() => submit('draft')} />
          <Button title="Publish event" style={styles.flex} onPress={() => submit('live')} />
        </View>
      }
    />
  );
}

export default ReviewEventScreen;

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});
