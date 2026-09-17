import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Header, Screen, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors } from '@/theme';

import { OtpInput } from '../components/OtpInput';

const RESEND_SECONDS = 24;
const CODE_LENGTH = 4;

export function OtpScreen() {
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams<{ email?: string; flow?: string }>();
  const isReset = params.flow === 'reset';
  const target = params.email ?? '';

  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const resend = () => {
    haptic.light();
    setSeconds(RESEND_SECONDS);
    setCode('');
    toast(`A new code was sent to ${target || 'you'}`, 'success');
  };

  const ready = code.length === CODE_LENGTH;

  const submit = () => {
    if (!ready) return;
    haptic.success();
    if (isReset) router.push('/(auth)/set-new-password');
    else router.push('/(auth)/choose-interests');
  };

  return (
    <Screen
      keyboard
      glow
      edges={['top', 'bottom']}
      footer={<Button variant="white" title="Continue" onPress={submit} disabled={!ready} />}>
      <Header title="Enter The Code" />
      <AppText variant="displaySm" center style={styles.title}>
        We have sent you a verification code to
      </AppText>
      <AppText variant="label" center secondary style={styles.target}>
        {isReset ? 'Phone Number' : 'Email Address'}: {target}
      </AppText>

      <View style={styles.otp}>
        <OtpInput value={code} onChange={setCode} length={CODE_LENGTH} />
      </View>

      {seconds > 0 ? (
        <AppText variant="caption" center secondary>
          You can request code again in {seconds} s
        </AppText>
      ) : (
        <Pressable onPress={resend} hitSlop={8} style={styles.resend} accessibilityRole="button">
          <AppText variant="captionMedium" center color={colors.primary}>
            Resend code
          </AppText>
        </Pressable>
      )}
    </Screen>
  );
}

export default OtpScreen;

const styles = StyleSheet.create({
  title: { marginTop: 8, marginBottom: 24, paddingHorizontal: 12 },
  target: { marginBottom: 32 },
  otp: { marginBottom: 32 },
  resend: { alignSelf: 'center' },
});
