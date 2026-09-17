import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Header, Input, Screen, Select, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useOrganizerStore } from '@/store';

import { WizardHeading } from '../../shared/WizardHeading';

const ENABLED_OPTIONS = [
  { value: 'enabled', label: 'Enabled' },
  { value: 'disabled', label: 'Disabled' },
];
const ELIGIBILITY_OPTIONS = [
  { value: 'Complete Public Profile + Profile Picture', label: 'Complete Public Profile + Profile Picture' },
  { value: 'Public Profile only', label: 'Public Profile only' },
  { value: 'Anyone', label: 'Anyone' },
];
const CAPTURE_OPTIONS = [
  { value: 'Email + Phone', label: 'Email + Phone' },
  { value: 'Email only', label: 'Email only' },
  { value: 'Phone only', label: 'Phone only' },
];
const CONSENT_OPTIONS = [
  { value: 'Explicit Opt-In Required', label: 'Explicit Opt-In Required' },
  { value: 'Implicit', label: 'Implicit' },
  { value: 'None', label: 'None' },
];

/** Guest List Setup — capacity, eligibility, RSVP capture and marketing consent. */
export function GuestListSetupScreen() {
  const router = useRouter();
  const toast = useToast();
  const guestList = useOrganizerStore((s) => s.draft.guestList);
  const setDraft = useOrganizerStore((s) => s.setDraft);
  const [capacityError, setCapacityError] = useState<string | undefined>();

  const patch = (p: Partial<typeof guestList>) => setDraft({ guestList: { ...guestList, ...p } });

  const next = () => {
    if (guestList.enabled && !/^\d+$/.test(guestList.capacity.trim())) {
      haptic.error();
      setCapacityError('Enter a numeric capacity');
      return;
    }
    if (guestList.enabled && parseInt(guestList.capacity, 10) <= 0) {
      haptic.error();
      setCapacityError('Capacity must be greater than 0');
      return;
    }
    setCapacityError(undefined);
    router.push('/organizer/create-event/boost');
  };

  return (
    <Screen
      scroll
      keyboard
      footer={
        <View style={styles.footer}>
          <Button title="Configure waitlist" variant="white" style={styles.flex} onPress={() => toast('Waitlist settings coming soon', 'info')} />
          <Button title="Continue to review" style={styles.flex} onPress={next} />
        </View>
      }>
      <Header left="back" />
      <WizardHeading title="Guest List Setup" subtitle="Free RSVP list with capacity and eligibility rules." />

      <Select
        label="Guest List"
        options={ENABLED_OPTIONS}
        value={guestList.enabled ? 'enabled' : 'disabled'}
        onChange={(v) => patch({ enabled: v === 'enabled' })}
        sheetTitle="Guest List"
      />
      <Input
        label="Guest List Capacity"
        placeholder="75"
        value={guestList.capacity}
        onChangeText={(t) => {
          patch({ capacity: t.replace(/[^0-9]/g, '') });
          if (capacityError) setCapacityError(undefined);
        }}
        keyboardType="number-pad"
        editable={guestList.enabled}
        error={guestList.enabled ? capacityError : undefined}
      />
      <Select label="Eligibility" options={ELIGIBILITY_OPTIONS} value={guestList.eligibility} onChange={(v) => patch({ eligibility: v })} sheetTitle="Eligibility" />
      <Select
        label="RSVP Contact Capture"
        options={CAPTURE_OPTIONS}
        value={guestList.contactCapture}
        onChange={(v) => patch({ contactCapture: v })}
        sheetTitle="RSVP Contact Capture"
      />
      <Select
        label="Marketing Consent"
        options={CONSENT_OPTIONS}
        value={guestList.marketingConsent}
        onChange={(v) => patch({ marketingConsent: v })}
        sheetTitle="Marketing Consent"
      />
    </Screen>
  );
}

export default GuestListSetupScreen;

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});
