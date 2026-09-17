import { useRouter } from 'expo-router';

import { SuccessScreen } from '@/components/SuccessScreen';

export function OrganizationSuccessScreen() {
  const router = useRouter();
  return (
    <SuccessScreen
      title="Organization Successfully"
      message="Enjoy Events picked based on your interests and location"
      ctaLabel="Go to Home"
      onCta={() => router.replace('/(organizer)/(tabs)/home')}
    />
  );
}

export default OrganizationSuccessScreen;
