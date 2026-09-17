import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button, ConfirmDialog, Header, Screen, useToast } from '@/components/ui';
import type { TicketType } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { useOrganizerStore } from '@/store';

import { TicketTypeCard } from '../../shared/TicketTypeCard';
import { defaultTicketTypes } from '../../shared/utils';
import { WizardHeading } from '../../shared/WizardHeading';

/** Ticket Types — configuration hub. */
export function TicketTypesScreen() {
  const router = useRouter();
  const toast = useToast();
  const ticketTypes = useOrganizerStore((s) => s.draft.ticketTypes);
  const setDraft = useOrganizerStore((s) => s.setDraft);
  const [pendingRemove, setPendingRemove] = useState<TicketType | null>(null);

  useEffect(() => {
    if (ticketTypes.length === 0) setDraft({ ticketTypes: defaultTicketTypes() });
  }, [ticketTypes.length, setDraft]);

  const update = (tt: TicketType) => setDraft({ ticketTypes: ticketTypes.map((t) => (t.id === tt.id ? tt : t)) });

  const next = () => {
    if (!ticketTypes.some((t) => t.enabled)) {
      haptic.error();
      toast('Enable at least one ticket type', 'error');
      return;
    }
    router.push('/organizer/create-event/guest-list');
  };

  return (
    <Screen scroll footer={<Button title="Save & Continue" variant="white" onPress={next} />}>
      <Header left="back" />
      <WizardHeading title="Ticket Types" subtitle="Ticket configuration hub" />

      {ticketTypes.map((tt, i) => (
        <TicketTypeCard
          key={tt.id}
          ticket={tt}
          selected={i === 0}
          onEdit={() => router.push({ pathname: '/organizer/create-event/ticket-type', params: { id: tt.id } })}
          onRemove={() => setPendingRemove(tt)}
          onToggle={tt.isGuestList ? (v) => update({ ...tt, enabled: v }) : undefined}
        />
      ))}

      <Button title="Add Ticket Type" variant="outlinePrimary" onPress={() => router.push('/organizer/create-event/ticket-type')} style={styles.add} />

      <ConfirmDialog
        visible={!!pendingRemove}
        onClose={() => setPendingRemove(null)}
        title="Remove ticket type?"
        message={pendingRemove ? `"${pendingRemove.name}" will be removed from this event.` : undefined}
        confirmLabel="Remove"
        confirmVariant="danger"
        onConfirm={() => {
          if (!pendingRemove) return;
          haptic.medium();
          setDraft({ ticketTypes: ticketTypes.filter((t) => t.id !== pendingRemove.id) });
        }}
      />
    </Screen>
  );
}

export default TicketTypesScreen;

const styles = StyleSheet.create({
  add: { marginTop: 4 },
});
