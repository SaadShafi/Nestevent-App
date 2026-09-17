import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { AppText, IconButton, NestLogo, OptionCard, Screen, SlideToAction } from '@/components/ui';
import type { Role } from '@/data/types';
import { useAuthStore } from '@/store';

import { PARTY_ICON, PEOPLE_CIRCLE_ICON } from '../components/roleIcons';

export function SelectRoleScreen() {
  const router = useRouter();
  const setRole = useAuthStore((s) => s.setRole);
  const currentRole = useAuthStore((s) => s.role);
  const [role, setLocalRole] = useState<Role>(currentRole ?? 'guest');

  const onBack = () => {
    if (router.canGoBack()) router.back();
  };

  const getStarted = () => {
    setRole(role);
    router.push('/(auth)/onboarding');
  };

  return (
    <Screen edges={['top', 'bottom']} footer={<SlideToAction title="Get Started" onComplete={getStarted} />}>
      <View style={styles.header}>
        <IconButton name="chevron-back" onPress={onBack} accessibilityLabel="Go back" />
      </View>
      <View style={styles.logo}>
        <NestLogo size={64} />
      </View>
      <AppText variant="display" center style={styles.title}>
        Select Your Role
      </AppText>
      <AppText center secondary style={styles.subtitle}>
        Choose how you'd like to use Nest
      </AppText>

      <OptionCard
        title="I'm here to Explore Event"
        description="Discover events and experiences that match your interests."
        icon={<SvgXml xml={PARTY_ICON} width={40} height={40} />}
        selected={role === 'guest'}
        onPress={() => setLocalRole('guest')}
      />
      <OptionCard
        title="I'm An Organizer"
        description="Create events, manage guests, and grow your audience."
        icon={<SvgXml xml={PEOPLE_CIRCLE_ICON} width={40} height={40} />}
        selected={role === 'organizer'}
        onPress={() => setLocalRole('organizer')}
      />
    </Screen>
  );
}

export default SelectRoleScreen;

const styles = StyleSheet.create({
  header: { height: 56, justifyContent: 'center' },
  logo: { alignItems: 'center', marginTop: 8, marginBottom: 14 },
  title: { marginBottom: 12 },
  subtitle: { marginBottom: 32 },
});
