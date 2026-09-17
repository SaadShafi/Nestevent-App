import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button } from '@/components/ui';
import { IMG } from '@/data/images';
import { haptic } from '@/lib/haptics';
import { useAuthStore } from '@/store';
import { colors } from '@/theme';

import { SocialButton } from '../components/SocialButton';

export function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role, hasSeenWalkthrough, socialSignIn, setBrowseMode } = useAuthStore();

  const afterSocial = () => {
    if (role === 'organizer') router.replace('/organizer/create-organization');
    else router.replace('/(guest)/(tabs)/home');
  };

  const social = (provider: 'google' | 'apple') => {
    haptic.medium();
    socialSignIn(provider);
    afterSocial();
  };

  const loginOrSignUp = () => {
    if (!hasSeenWalkthrough) router.push('/(auth)/walkthrough');
    else router.push('/(auth)/login');
  };

  const browse = () => {
    haptic.light();
    setBrowseMode(true);
    router.replace('/(guest)/(tabs)/home');
  };

  const appleFirst = Platform.OS === 'ios';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Image source={{ uri: IMG.onboardingHero }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,107,0,0.95)', 'rgba(255,107,0,0.55)', 'rgba(255,107,0,0)']}
        locations={[0, 0.45, 0.8]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.9)']}
        locations={[0.45, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <AppText variant="display" style={styles.wordmark} numberOfLines={1} adjustsFontSizeToFit>
          NEST
        </AppText>
        <AppText variant="bodyMedium" style={styles.tagline}>
          Discover events. Meet your people.{'\n'}Make memories
        </AppText>
      </View>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) + 4 }]}>
        {appleFirst ? (
          <>
            <SocialButton provider="apple" glass onPress={() => social('apple')} />
            <SocialButton provider="google" glass onPress={() => social('google')} />
          </>
        ) : (
          <>
            <SocialButton provider="google" glass onPress={() => social('google')} />
            <SocialButton provider="apple" glass onPress={() => social('apple')} />
          </>
        )}
        <Button variant="white" title="Login or Sign Up" onPress={loginOrSignUp} style={styles.login} />
        <Pressable onPress={browse} hitSlop={10} style={styles.browse} accessibilityRole="button">
          <AppText variant="label" center>
            Browse Event
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

export default OnboardingScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { paddingHorizontal: 20 },
  wordmark: { fontSize: 118, lineHeight: 118, letterSpacing: -6, marginLeft: -4, marginTop: 12, color: colors.white },
  tagline: { color: colors.white, marginTop: 6, maxWidth: 240 },
  bottom: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 16 },
  login: { marginTop: 4 },
  browse: { paddingVertical: 16 },
});
