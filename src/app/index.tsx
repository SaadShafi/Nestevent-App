import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { NestLogo } from '@/components/ui';
import { useAuthStore } from '@/store';
import { colors } from '@/theme';

/**
 * Splash + entry router. Shows the NEST splash briefly, then routes by auth state:
 *   no role           → Select Role
 *   role, no auth     → Onboarding (Google/Apple/Login/Browse)
 *   guest + auth      → guest tabs
 *   organizer + auth  → organizer tabs (or Create Organization first)
 */
export default function Index() {
  const [ready, setReady] = useState(false);
  const { role, isAuthenticated, browseMode, interestsDone, profileDone, organizationDone, hasSeenWalkthrough, pendingEmail } =
    useAuthStore();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 900);
    return () => clearTimeout(t);
  }, []);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <NestLogo size={64} />
      </View>
    );
  }

  if (!role) return <Redirect href="/(auth)/select-role" />;

  if (browseMode && !isAuthenticated) return <Redirect href="/(guest)/(tabs)/home" />;

  if (!isAuthenticated) {
    if (!hasSeenWalkthrough) return <Redirect href="/(auth)/onboarding" />;
    // Partially through sign-up
    if (pendingEmail && !interestsDone) return <Redirect href="/(auth)/choose-interests" />;
    if (pendingEmail && !profileDone) return <Redirect href="/(auth)/profile-setup" />;
    return <Redirect href="/(auth)/login" />;
  }

  if (role === 'organizer') {
    if (!organizationDone) return <Redirect href="/organizer/create-organization" />;
    return <Redirect href="/(organizer)/(tabs)/home" />;
  }
  return <Redirect href="/(guest)/(tabs)/home" />;
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
});
