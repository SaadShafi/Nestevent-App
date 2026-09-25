import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View, type NativeSyntheticEvent, type TextLayoutEventData } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button } from '@/components/ui';
import { IMG } from '@/data/images';
import { haptic } from '@/lib/haptics';
import { useAuthStore } from '@/store';
import { colors, fonts } from '@/theme';

import { SocialButton } from '../components/SocialButton';

/** Side margin of the wordmark + tagline in the Figma frame. */
const SIDE = 18;
/** Figma "NEST" ink box is ~330 × 230 on a 366pt-wide frame: height ≈ 0.7 × width. */
const WORDMARK_ASPECT = 0.7;
/** Syne ExtraBold metrics (em): cap height, "NEST" ink width (advances minus N/T side bearings), N left bearing. */
const SYNE_CAP_EM = 0.65;
const NEST_INK_EM = 4.496;
const NEST_N_BEARING_EM = 0.07;
const NEST_LETTER_SPACING_EM = -0.06;

/**
 * Figma's full-width, extra-tall NEST wordmark. Syne is far wider than it is tall, so the text is
 * rendered at the size that gives the Figma letter height and then squeezed horizontally to the
 * screen width (scaling down keeps it sharp on iOS). The measured cap top pins it the same on both platforms.
 */
function Wordmark() {
  const { width } = useWindowDimensions();
  const inkWidth = width - SIDE * 2;
  const height = inkWidth * WORDMARK_ASPECT;
  const fontSize = height / SYNE_CAP_EM;
  const scaleX = inkWidth / (fontSize * (NEST_INK_EM + 3 * NEST_LETTER_SPACING_EM));
  const [capTop, setCapTop] = useState<number | null>(null);

  const onTextLayout = (e: NativeSyntheticEvent<TextLayoutEventData>) => {
    const line = e.nativeEvent.lines[0];
    if (!line) return;
    const top = line.y + line.ascender - (line.capHeight || fontSize * SYNE_CAP_EM);
    if (capTop == null || Math.abs(capTop - top) > 0.5) setCapTop(top);
  };

  return (
    <View style={{ height }}>
      <AppText
        variant="display"
        numberOfLines={1}
        allowFontScaling={false}
        onTextLayout={onTextLayout}
        style={[
          styles.wordmark,
          {
            width: fontSize * 5,
            fontSize,
            lineHeight: Math.round(fontSize * 1.2),
            letterSpacing: fontSize * NEST_LETTER_SPACING_EM,
            opacity: capTop == null ? 0 : 1,
            transform: [
              { translateX: -fontSize * NEST_N_BEARING_EM * scaleX },
              { translateY: -(capTop ?? 0) },
              { scaleX },
            ],
          },
        ]}>
        NEST
      </AppText>
    </View>
  );
}

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
        <Wordmark />
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
  top: { paddingHorizontal: SIDE },
  wordmark: { position: 'absolute', top: 20, left: 0, fontFamily: fonts.display, color: colors.white, transformOrigin: 'left top', includeFontPadding: false },
  // 20pt wordmark offset + ~16pt gap under the letters, as in the Figma.
  tagline: { color: colors.white, marginTop: 36, maxWidth: 240 },
  bottom: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 16 },
  login: { marginTop: 4 },
  browse: { paddingVertical: 16 },
});
