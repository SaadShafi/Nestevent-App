import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText, Button, Divider, Input, NestLogo, Screen, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { isEmail, required } from '@/lib/validation';
import { useAuthStore } from '@/store';
import { colors, fonts } from '@/theme';

import { AuthCard } from '../components/AuthCard';
import { Checkbox } from '../components/Checkbox';
import { SocialButton } from '../components/SocialButton';

export function LoginScreen() {
  const router = useRouter();
  const toast = useToast();
  const { role, organizationDone, signIn, socialSignIn } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const passwordRef = useRef<TextInput>(null);

  const routeByRole = () => {
    if (role === 'organizer') {
      router.replace(organizationDone ? '/(organizer)/(tabs)/home' : '/organizer/create-organization');
    } else {
      router.replace('/(guest)/(tabs)/home');
    }
  };

  const submit = () => {
    const next: typeof errors = {};
    if (!required(email)) next.email = 'Email is required';
    else if (!isEmail(email)) next.email = 'Enter a valid email address';
    if (!required(password)) next.password = 'Password is required';
    setErrors(next);
    if (Object.keys(next).length) {
      haptic.error();
      return;
    }
    haptic.success();
    signIn(email.trim());
    routeByRole();
  };

  const social = (provider: 'google' | 'apple') => {
    socialSignIn(provider);
    toast(`Signed in with ${provider === 'apple' ? 'Apple' : 'Google'}`, 'success');
    routeByRole();
  };

  const appleFirst = Platform.OS === 'ios';

  return (
    <Screen scroll keyboard glow edges={['top', 'bottom']}>
      <View style={styles.logo}>
        <NestLogo size={44} />
      </View>
      <AppText variant="heading" center numberOfLines={1} adjustsFontSizeToFit style={styles.title}>
        Sign in to your Account
      </AppText>
      <AppText variant="caption" center secondary style={styles.subtitle}>
        Enter your email and password to log in
      </AppText>

      <AuthCard>
        <Input
          dense
          label="Email Address"
          placeholder="Enter Your Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
          }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <Input
          dense
          ref={passwordRef}
          label="Password"
          placeholder="Enter Your Password"
          password
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
          }}
          error={errors.password}
          autoComplete="password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={submit}
        />

        <View style={styles.rememberRow}>
          <Checkbox dense checked={remember} onChange={setRemember} label="Remember me" />
          <Pressable onPress={() => router.push('/(auth)/forgot-password')} hitSlop={8}>
            <AppText variant="caption">Forgot Password ?</AppText>
          </Pressable>
        </View>

        <Button variant="white" title="Sign in" onPress={submit} />

        <Divider label="Or" spacing={20} />

        {appleFirst ? (
          <>
            <SocialButton provider="apple" onPress={() => social('apple')} />
            <SocialButton provider="google" onPress={() => social('google')} />
          </>
        ) : (
          <>
            <SocialButton provider="google" onPress={() => social('google')} />
            <SocialButton provider="apple" onPress={() => social('apple')} />
          </>
        )}

        <View style={styles.footer}>
          <AppText variant="caption" secondary>
            Don't Have An Account?{' '}
          </AppText>
          <Pressable onPress={() => router.push('/(auth)/register')} hitSlop={8}>
            <AppText variant="caption" color={colors.primary} style={styles.link}>
              Sign Up Now
            </AppText>
          </Pressable>
        </View>
      </AuthCard>
    </Screen>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  logo: { alignItems: 'center', marginTop: 12, marginBottom: 12 },
  title: { marginBottom: 6 },
  subtitle: { marginBottom: 20 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: 4 },
  link: { fontFamily: fonts.semibold },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, paddingBottom: 4 },
});
