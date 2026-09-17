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
      onCta={() => router.replace('/(organizer)/(tabs)/home')}
      showBack={false}
    />
  );
}

export default EventSubmittedScreen;
