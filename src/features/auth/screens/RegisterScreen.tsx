import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText, Button, Input, NestLogo, PhoneInput, Screen } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { isEmail, isPhone, isStrongPassword, required } from '@/lib/validation';
import { useAuthStore } from '@/store';
import { colors } from '@/theme';

import { AuthCard } from '../components/AuthCard';

type Errors = Partial<Record<'firstName' | 'lastName' | 'email' | 'phone' | 'password' | 'confirm', string>>;

export function RegisterScreen() {
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUp);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const lastRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const clear = (k: keyof Errors) => {
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = () => {
    const next: Errors = {};
    if (!required(firstName)) next.firstName = 'Required';
    if (!required(lastName)) next.lastName = 'Required';
    if (!required(email)) next.email = 'Email is required';
    else if (!isEmail(email)) next.email = 'Enter a valid email address';
    if (!required(phone)) next.phone = 'Phone number is required';
    else if (!isPhone(phone)) next.phone = 'Enter a valid phone number';
    if (!required(password)) next.password = 'Password is required';
    else if (!isStrongPassword(password))
      next.password = 'Use at least 8 characters with uppercase, lowercase and a number';
    if (confirm !== password) next.confirm = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length) {
      haptic.error();
      return;
    }
    haptic.success();
    const trimmedEmail = email.trim();
    signUp({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: trimmedEmail,
      phone: `${countryCode} ${phone.trim()}`,
      displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
    });
    router.push({ pathname: '/(auth)/otp', params: { email: trimmedEmail, flow: 'register' } });
  };

  return (
    <Screen scroll keyboard glow edges={['top', 'bottom']}>
      <View style={styles.logo}>
        <NestLogo size={44} />
      </View>
      <AppText variant="displaySm" center style={styles.title}>
        Sign Up To Create Account
      </AppText>
      <AppText variant="caption" center secondary style={styles.subtitle}>
        Create An account experience accordingly
      </AppText>

      <AuthCard>
        <View style={styles.row}>
          <Input
            label="First Name"
            placeholder="Enter"
            value={firstName}
            onChangeText={(t) => {
              setFirstName(t);
              clear('firstName');
            }}
            error={errors.firstName}
            autoComplete="given-name"
            textContentType="givenName"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => lastRef.current?.focus()}
            containerStyle={styles.half}
          />
          <Input
            ref={lastRef}
            label="Last Name"
            placeholder="Enter"
            value={lastName}
            onChangeText={(t) => {
              setLastName(t);
              clear('lastName');
            }}
            error={errors.lastName}
            autoComplete="family-name"
            textContentType="familyName"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            containerStyle={styles.half}
          />
        </View>
        <Input
          ref={emailRef}
          label="Email Address"
          placeholder="Enter Your Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            clear('email');
          }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          blurOnSubmit={false}
        />
        <PhoneInput
          label="Phone Number"
          value={phone}
          onChangeText={(t) => {
            setPhone(t);
            clear('phone');
          }}
          error={errors.phone}
          countryCode={countryCode}
          onCountryChange={setCountryCode}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <Input
          ref={passwordRef}
          label="Password"
          placeholder="Enter Password"
          password
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            clear('password');
          }}
          error={errors.password}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <Input
          ref={confirmRef}
          label="Confirm Password"
          placeholder="Confirm Password"
          password
          value={confirm}
          onChangeText={(t) => {
            setConfirm(t);
            clear('confirm');
          }}
          error={errors.confirm}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={submit}
        />

        <Button variant="white" title="Sign Up" onPress={submit} style={styles.cta} />

        <View style={styles.footer}>
          <AppText variant="label" secondary>
            I Already Have An Account{' '}
          </AppText>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/login'))}
            hitSlop={8}>
            <AppText variant="label" color={colors.primary}>
              Sign In
            </AppText>
          </Pressable>
        </View>
      </AuthCard>
    </Screen>
  );
}

export default RegisterScreen;

const styles = StyleSheet.create({
  logo: { alignItems: 'center', marginTop: 12, marginBottom: 12 },
  title: { marginBottom: 6 },
  subtitle: { marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  cta: { marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, paddingBottom: 4 },
});
