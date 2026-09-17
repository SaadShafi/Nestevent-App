import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText, Button, Header, Input, Screen, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { isStrongPassword, required } from '@/lib/validation';

const RULES = [
  'At least 12 characters long but 14 or more is better.',
  'A combination of uppercase letters, lowercase letters, numbers, and symbols.',
];

export function SetNewPasswordScreen() {
  const router = useRouter();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const confirmRef = useRef<TextInput>(null);

  const submit = () => {
    const next: typeof errors = {};
    if (!required(password)) next.password = 'Password is required';
    else if (!isStrongPassword(password)) next.password = 'Password does not meet the requirements below';
    if (confirm !== password) next.confirm = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length) {
      haptic.error();
      return;
    }
    haptic.success();
    toast('Password updated', 'success');
    router.replace('/(auth)/login');
  };

  return (
    <Screen keyboard glow edges={['top', 'bottom']} footer={<Button variant="white" title="Continue" onPress={submit} />}>
      <Header title="Set New Password" />
      <AppText variant="displaySm" center style={styles.title}>
        Please enter your{'\n'}new password
      </AppText>

      <Input
        label="Password"
        placeholder="Enter Password"
        password
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
        }}
        error={errors.password}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
        autoFocus
      />
      <Input
        ref={confirmRef}
        label="Confirm Password"
        placeholder="Confirm Password"
        password
        value={confirm}
        onChangeText={(t) => {
          setConfirm(t);
          if (errors.confirm) setErrors((e) => ({ ...e, confirm: undefined }));
        }}
        error={errors.confirm}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={submit}
      />

      <View style={styles.rules}>
        {RULES.map((r) => (
          <View key={r} style={styles.rule}>
            <AppText variant="caption" secondary>
              {'•'}
            </AppText>
            <AppText variant="caption" secondary style={styles.ruleText}>
              {r}
            </AppText>
          </View>
        ))}
      </View>
    </Screen>
  );
}

export default SetNewPasswordScreen;

const styles = StyleSheet.create({
  title: { marginTop: 8, marginBottom: 24 },
  rules: { paddingHorizontal: 8, gap: 8 },
  rule: { flexDirection: 'row', gap: 8 },
  ruleText: { flex: 1 },
});
