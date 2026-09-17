import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { Button, Header, Screen, Select } from '@/components/ui';
import { useMyEvents } from '@/features/organizer/hooks';
import { haptic } from '@/lib/haptics';

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

  const [audience, setAudience] = useState<string | null>('Current attendees');
  const [scope, setScope] = useState<string | null>(scopes[0]?.value ?? null);
  const [consent, setConsent] = useState<string | null>('Consented contacts only');
  const [errors, setErrors] = useState<{ audience?: string; scope?: string; consent?: string }>({});
  const clearError = (key: keyof typeof errors) => setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));

  const next = () => {
    const errs: typeof errors = {};
    if (!audience) errs.audience = 'Choose an audience';
    if (!scope) errs.scope = 'Choose an event scope';
    if (!consent) errs.consent = 'Choose a consent filter';
    setErrors(errs);
    if (!audience || !scope || !consent) {
      haptic.error();
      return;
    }
    router.push({ pathname: '/organizer/marketing/sms/message', params: { audience, scope, consent } });
  };

  return (
    <Screen scroll footer={<Button title="Continue" variant="white" onPress={next} />}>
      <Header title="SMS Blast Audience" />
      <Select
        outlined
        label="Audience"
        options={AUDIENCES}
        value={audience}
        onChange={(v) => {
          setAudience(v);
          clearError('audience');
        }}
        error={errors.audience}
      />
      <Select
        outlined
        label="Event scope"
        options={scopes}
        value={scope}
        onChange={(v) => {
          setScope(v);
          clearError('scope');
        }}
        error={errors.scope}
      />
      <Select
        outlined
        label="Consent filter"
        options={CONSENT}
        value={consent}
        onChange={(v) => {
          setConsent(v);
          clearError('consent');
        }}
        error={errors.consent}
      />
    </Screen>
  );
}
