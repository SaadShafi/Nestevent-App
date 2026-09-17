import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Button, Icon } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useAuthStore } from '@/store';
import { colors, radius } from '@/theme';

const CONFETTI: { top: number; left?: number; right?: number; color: string; w: number; h: number; rot: string }[] = [
  { top: 6, left: 30, color: '#FF6B00', w: 5, h: 12, rot: '25deg' },
  { top: 28, left: 12, color: '#3B82F6', w: 4, h: 10, rot: '-40deg' },
  { top: 64, left: 18, color: '#22C55E', w: 6, h: 6, rot: '0deg' },
  { top: 96, left: 38, color: '#EF4444', w: 4, h: 9, rot: '60deg' },
  { top: 2, right: 34, color: '#EF4444', w: 5, h: 11, rot: '-20deg' },
  { top: 30, right: 14, color: '#FACC15', w: 6, h: 6, rot: '0deg' },
  { top: 58, right: 24, color: '#3B82F6', w: 4, h: 12, rot: '35deg' },
  { top: 92, right: 40, color: '#FF6B00', w: 5, h: 5, rot: '0deg' },
];

export function RegisterSuccessScreen() {
  const router = useRouter();
  const { role, user } = useAuthStore();

  const start = () => {
    haptic.success();
    if (role === 'organizer') router.replace('/organizer/create-organization');
    else router.replace('/(guest)/(tabs)/home');
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {Platform.OS === 'ios' ? (
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.dim]} />
      )}
      <View style={[StyleSheet.absoluteFill, styles.dimSoft]} />

      <View style={styles.card}>
        <View style={styles.avatarWrap}>
          {CONFETTI.map((c, i) => (
            <View
              key={i}
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: c.top,
                left: c.left,
                right: c.right,
                width: c.w,
                height: c.h,
                borderRadius: 2,
                backgroundColor: c.color,
                transform: [{ rotate: c.rot }],
              }}
            />
          ))}
          <Avatar uri={user.avatar} size={118} ring={colors.success} />
          <View style={styles.badge}>
            <Icon name="checkmark" size={14} color={colors.white} />
          </View>
        </View>

        <AppText variant="h1" center style={styles.title}>
          Register Success
        </AppText>
        <AppText center secondary style={styles.copy}>
          Congratulation! your account is created. Now you can easily use this Application
        </AppText>

        <Button variant="white" title="Let's Get Started!" onPress={start} />
      </View>
    </View>
  );
}

export default RegisterSuccessScreen;

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  dim: { backgroundColor: 'rgba(0,0,0,0.85)' },
  dimSoft: { backgroundColor: 'rgba(0,0,0,0.35)' },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.bg,
    borderRadius: radius.xxl,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  avatarWrap: { width: 180, alignItems: 'center', paddingVertical: 6, marginBottom: 12 },
  badge: {
    position: 'absolute',
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginBottom: 8 },
  copy: { marginBottom: 24, maxWidth: 280 },
});
