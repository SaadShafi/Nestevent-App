import { useRouter } from 'expo-router';

import { SuccessScreen } from '@/components/SuccessScreen';

export function OrganizationSuccessScreen() {
  const router = useRouter();
  return (
    <SuccessScreen
      title="Organization Successfully"
      message="Enjoy Events picked based on your interests and location"
      ctaLabel="Go to Home"
      // Pop Create Organization + Team & Roles first so they don't linger under the tabs
      // (onboarding has no tabs beneath them yet, so dismissTo would only push).
      onCta={() => {
        router.dismissAll();
        router.replace('/(organizer)/(tabs)/home');
      }}
    />
  );
}

export default OrganizationSuccessScreen;
