import { useRouter } from 'expo-router';

import { SuccessScreen } from '@/components/SuccessScreen';

/** "Event Submitted" — success state after publishing / saving from Review Event. */
export function EventSubmittedScreen() {
  const router = useRouter();
  return (
    <SuccessScreen
      title="Event Submitted"
      message="Enjoy Events picked based on your interests and location"
      ctaLabel="Go to Home"
      // dismissTo pops every wizard step still on the stack (details → … → review) instead of
      // leaving them mounted under the tabs, where Ticket Types would re-seed the reset draft.
      onCta={() => router.dismissTo('/(organizer)/(tabs)/home')}
      showBack={false}
    />
  );
}

export default EventSubmittedScreen;
