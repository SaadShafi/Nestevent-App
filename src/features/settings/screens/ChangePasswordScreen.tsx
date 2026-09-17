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

type Errors = { current?: string; next?: string; confirm?: string };

/** Change Password form (current → new + confirm) with the two guideline bullets. */
export function ChangePasswordScreen() {
  const router = useRouter();
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const nextRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const clear = (key: keyof Errors) => {
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = () => {
    const e: Errors = {};
    if (!required(current)) e.current = 'Enter your current password';
    if (!required(next)) e.next = 'Enter a new password';
    else if (!isStrongPassword(next)) e.next = 'Use 8+ characters with upper, lower case letters and a number';
    else if (next === current) e.next = 'New password must differ from the current one';
    if (confirm !== next) e.confirm = 'Passwords do not match';
    setErrors(e);
    if (Object.keys(e).length) {
      haptic.error();
      return;
    }
    haptic.success();
    toast('Password changed', 'success');
    if (router.canGoBack()) router.back();
    else router.replace('/settings');
  };

  return (
    <Screen scroll keyboard footer={<Button variant="white" title="Change Password" onPress={submit} />}>
      <Header title="Change Password" />

      <Input
        placeholder="Current Password"
        password
        value={current}
        onChangeText={(t) => {
          setCurrent(t);
          clear('current');
        }}
        error={errors.current}
        textContentType="password"
        returnKeyType="next"
        onSubmitEditing={() => nextRef.current?.focus()}
      />

      <AppText variant="label" style={styles.sectionLabel}>
        Set New Password
      </AppText>
      <Input
        ref={nextRef}
        placeholder="New Password"
        password
        value={next}
        onChangeText={(t) => {
          setNext(t);
          clear('next');
        }}
        error={errors.next}
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
      />
      <Input
        ref={confirmRef}
        placeholder="Confirm Password"
        password
        value={confirm}
        onChangeText={(t) => {
          setConfirm(t);
          clear('confirm');
        }}
        error={errors.confirm}
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

const styles = StyleSheet.create({
  sectionLabel: { marginTop: 16, marginBottom: 10 },
  rules: { marginTop: 4, gap: 8, paddingHorizontal: 6 },
  rule: { flexDirection: 'row', gap: 8 },
  ruleText: { flex: 1 },
});

export default ChangePasswordScreen;
