import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AppText, Button, Header, PhoneInput, Screen } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { isPhone, required } from '@/lib/validation';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | undefined>();

  const submit = () => {
    const message = !required(phone)
      ? 'Phone number is required'
      : !isPhone(phone)
        ? 'Enter a valid phone number'
        : undefined;
    if (message) {
      setError(message);
      haptic.error();
      return;
    }
    haptic.success();
    const full = `${countryCode} ${phone.trim()}`;
    router.push({ pathname: '/(auth)/otp', params: { flow: 'reset', email: full } });
  };

  return (
    <Screen keyboard glow edges={['top', 'bottom']} footer={<Button variant="white" title="Continue" onPress={submit} />}>
      <Header title="Forgot Password" />
      <AppText variant="displaySm" center style={styles.title}>
        In order to reset{'\n'}your password
      </AppText>
      <AppText variant="caption" center secondary style={styles.body}>
        You need to enter your registered phone number
      </AppText>

      <PhoneInput
        label="Phone Number"
        value={phone}
        onChangeText={(t) => {
          setPhone(t);
          if (error) setError(undefined);
        }}
        error={error}
        countryCode={countryCode}
        onCountryChange={setCountryCode}
        returnKeyType="done"
        onSubmitEditing={submit}
        autoFocus
      />
    </Screen>
  );
}

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  title: { marginTop: 8, marginBottom: 16 },
  body: { marginBottom: 32 },
});
