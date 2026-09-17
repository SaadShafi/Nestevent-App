import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, NestLogo } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useTicketsStore } from '@/store';
import { colors, layout } from '@/theme';

/**
 * "Checkout Successfully" — shown right after Place Order (Figma: Guest Flow, frame between Checkout and Ticket Order).
 * Full-screen dark with a warm orange glow, NEST logotype, title + copy, and Back to Home / View Ticket at the bottom.
 */
export function CheckoutSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const myTickets = useTicketsStore((s) => s.myTickets);

  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  const goHome = () => {
    haptic.light();
    router.dismissAll();
    router.replace('/(guest)/(tabs)/home');
  };

  const viewTicket = () => {
    haptic.light();
    // Newest ticket for this event; fall back to the order list if none resolved.
    const ticket = [...myTickets]
      .filter((t) => t.eventId === id)
      .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime())[0];
    if (ticket) router.replace(`/ticket/${ticket.id}`);
    else router.replace(`/event/${id}/ticket-order`);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        pointerEvents="none"
        colors={['#3A1A05', '#1E0D03', colors.bg]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.5, y: 0.35 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,107,0,0.22)', 'rgba(255,107,0,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.topGlow}
      />

      <Animated.View style={[styles.center, { opacity, transform: [{ scale }] }]}>
        <NestLogo size={80} style={styles.logo} />
        <AppText variant="h1" center style={styles.title}>
          Checkout{'\n'}Successfully
        </AppText>
        <AppText center secondary style={styles.copy}>
          Enjoy Events picked based on your interests and location
        </AppText>
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Button title="Back to Home" variant="white" onPress={goHome} style={styles.btn} />
        <Button title="View Ticket" onPress={viewTicket} style={styles.btn} />
      </View>
    </View>
  );
}

export default CheckoutSuccessScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topGlow: { position: 'absolute', left: 0, right: 0, top: 0, height: 420 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: layout.screenPadding },
  logo: { marginBottom: 28 },
  title: { fontSize: 32, lineHeight: 38, marginBottom: 14 },
  copy: { maxWidth: 240 },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: layout.screenPadding },
  btn: { flex: 1 },
});
