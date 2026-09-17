import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { Button, Header, Screen, Select } from '@/components/ui';
import { useMyEvents } from '@/features/organizer/hooks';

const AUDIENCES = [
  { value: 'Current attendees', label: 'Current attendees' },
  { value: 'Past attendees', label: 'Past attendees' },
  { value: 'Both', label: 'Both' },
];
const CONSENT = [
  { value: 'Consented contacts only', label: 'Consented contacts only' },
  { value: 'All contacts', label: 'All contacts', description: 'Not recommended — may violate messaging rules' },
];

/** SMS Blast step 1: pick audience, event scope and consent filter. */
export function SmsAudienceScreen() {
  const router = useRouter();
  const events = useMyEvents();
  const scopes = useMemo(
    () => [...events.map((e) => ({ value: e.title, label: e.title })), { value: 'All NightBloom events', label: 'All NightBloom events' }],
    [events],
  );

  const [audience, setAudience] = useState('Current attendees');
  const [scope, setScope] = useState(scopes[0]?.value ?? 'All NightBloom events');
  const [consent, setConsent] = useState('Consented contacts only');

  return (
    <Screen
      scroll
      footer={
        <Button
          title="Continue"
          variant="white"
          onPress={() => router.push({ pathname: '/organizer/marketing/sms/message', params: { audience, scope, consent } })}
        />
      }>
      <Header title="SMS Blast Audience" />
      <Select outlined label="Audience" options={AUDIENCES} value={audience} onChange={setAudience} />
      <Select outlined label="Event scope" options={scopes} value={scope} onChange={setScope} />
      <Select outlined label="Consent filter" options={CONSENT} value={consent} onChange={setConsent} />
    </Screen>
  );
}
