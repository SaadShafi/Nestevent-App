import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { Button, Header, Input, Screen, Select, useToast } from '@/components/ui';
import { useMyEvents } from '@/features/organizer/hooks';
import { haptic } from '@/lib/haptics';
import { useOrganizerStore } from '@/store';

const DESTINATIONS = [
  { value: 'Event page', label: 'Event page' },
  { value: 'Ticket checkout', label: 'Ticket checkout' },
  { value: 'Organization page', label: 'Organization page' },
];

/** Create Tracking Link form. */
export function CreateTrackingLinkScreen() {
  const router = useRouter();
  const toast = useToast();
  const events = useMyEvents();
  const addTrackingLink = useOrganizerStore((s) => s.addTrackingLink);
  const eventOptions = useMemo(() => events.map((e) => ({ value: e.id, label: e.title })), [events]);

  const [campaign, setCampaign] = useState('');
  const [eventId, setEventId] = useState<string | null>(null);
  const [promoter, setPromoter] = useState('');
  const [destination, setDestination] = useState('Event page');
  const [errors, setErrors] = useState<{ campaign?: string; event?: string; promoter?: string }>({});
  const clearError = (key: keyof typeof errors) => setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));

  const submit = () => {
    const next: typeof errors = {};
    if (!campaign.trim()) next.campaign = 'Enter a campaign name';
    if (!eventId) next.event = 'Select an event';
    if (!promoter.trim()) next.promoter = 'Enter the promoter or label';
    setErrors(next);
    if (Object.keys(next).length || !eventId) {
      haptic.error();
      return;
    }
    addTrackingLink({ campaign: campaign.trim(), eventId, promoter: promoter.trim(), destination });
    haptic.success();
    toast('Tracking link generated', 'success');
    router.back();
  };

  return (
    <Screen scroll keyboard footer={<Button title="Generate link" variant="white" onPress={submit} />}>
      <Header title="Create Tracking Link" />
      <Input
        outlined
        label="Campaign name"
        placeholder="DJ-MAYA"
        value={campaign}
        onChangeText={(t) => {
          setCampaign(t);
          clearError('campaign');
        }}
        autoCapitalize="characters"
        error={errors.campaign}
      />
      <Select
        outlined
        label="Event"
        placeholder="Midnight Garden"
        options={eventOptions}
        value={eventId}
        onChange={(v) => {
          setEventId(v);
          clearError('event');
        }}
        error={errors.event}
      />
      <Input
        outlined
        label="Label / promoter"
        placeholder="Maya King"
        value={promoter}
        onChangeText={(t) => {
          setPromoter(t);
          clearError('promoter');
        }}
        error={errors.promoter}
      />
      <Select outlined label="Destination" placeholder="Event page" options={DESTINATIONS} value={destination} onChange={setDestination} />
    </Screen>
  );
}
