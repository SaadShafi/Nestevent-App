import { useRouter } from 'expo-router';

import { Button, Header, MCIcon, OptionCard, Screen } from '@/components/ui';
import { useOrganizerStore } from '@/store';
import { colors } from '@/theme';

import { WizardHeading } from '../../shared/WizardHeading';

const LOREM = 'It is a long established fact that a reader will be distracted by the readable';

/** Attendance Model — Ticketed vs RSVP. */
export function AttendanceModelScreen() {
  const router = useRouter();
  const attendance = useOrganizerStore((s) => s.draft.attendance);
  const setDraft = useOrganizerStore((s) => s.setDraft);

  const next = () => {
    router.push(attendance === 'ticketed' ? '/organizer/create-event/ticket-types' : '/organizer/create-event/guest-list');
  };

  return (
    <Screen scroll footer={<Button title="Save & Continue" variant="white" onPress={next} />}>
      <Header left="back" />
      <WizardHeading title="Attendance Model" subtitle="Choose Ticketed or RSVP" />
      <OptionCard
        title="Ticketed Event"
        description={LOREM}
        icon={<MCIcon name="ticket-confirmation" size={34} color={colors.primary} />}
        selected={attendance === 'ticketed'}
        onPress={() => setDraft({ attendance: 'ticketed' })}
      />
      <OptionCard
        title="RSVP Event"
        description={LOREM}
        icon={<MCIcon name="calendar-heart" size={34} color={colors.primary} />}
        selected={attendance === 'rsvp'}
        onPress={() => setDraft({ attendance: 'rsvp' })}
      />
    </Screen>
  );
}

export default AttendanceModelScreen;
