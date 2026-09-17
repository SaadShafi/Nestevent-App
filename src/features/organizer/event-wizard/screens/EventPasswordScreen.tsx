import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText, Button, Header, Input, MCIcon, Screen, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useOrganizerStore } from '@/store';
import { colors } from '@/theme';

const RULES = [
  'At least 12 characters long but 14 or more is better.',
  'A combination of uppercase letters, lowercase letters, numbers, and symbols.',
];

/** "Set Event Password" — the step behind Event Visibility → Password Protected → Edit. */
export function EventPasswordScreen() {
  const router = useRouter();
  const toast = useToast();
  const saved = useOrganizerStore((s) => s.draft.password);
  const setDraft = useOrganizerStore((s) => s.setDraft);
  const [password, setPassword] = useState(saved);
  const [confirm, setConfirm] = useState(saved);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const confirmRef = useRef<TextInput>(null);

  const save = () => {
    const next: typeof errors = {};
    if (!password.trim()) next.password = 'Password is required';
    else if (password.trim().length < 4) next.password = 'Use at least 4 characters';
    if (confirm !== password) next.confirm = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length) {
      haptic.error();
      return;
    }
    setDraft({ password: password.trim(), visibility: 'password' });
    haptic.success();
    toast('Event password saved', 'success');
    router.back();
  };

  return (
    <Screen scroll keyboard footer={<Button title="Save Password" variant="white" onPress={save} />}>
      <Header title="Set Event Password" />
      <View style={styles.hero}>
        <View style={styles.badge}>
          <MCIcon name="asterisk" size={22} color={colors.primary} />
          <MCIcon name="asterisk" size={22} color={colors.primary} />
          <MCIcon name="asterisk" size={22} color={colors.primary} />
          <View style={styles.underline} />
        </View>
        <AppText variant="display" center style={styles.title}>
          Set a Password
        </AppText>
        <AppText center secondary style={styles.subtitle}>
          Create a password to control{'\n'}Access to your event
        </AppText>
      </View>

      <Input
        label="Password"
        password
        placeholder="Enter password"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
        }}
        error={errors.password}
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
      />
      <Input
        ref={confirmRef}
        label="Confirm Password"
        password
        placeholder="Confirm Password"
        value={confirm}
        onChangeText={(t) => {
          setConfirm(t);
          if (errors.confirm) setErrors((e) => ({ ...e, confirm: undefined }));
        }}
        error={errors.confirm}
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={save}
      />

      <View style={styles.rules}>
        {RULES.map((r) => (
          <View key={r} style={styles.rule}>
            <AppText variant="caption" secondary>
              •
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

export default EventPasswordScreen;

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: 24, marginBottom: 28 },
  badge: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: 'rgba(255,107,0,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginBottom: 24,
  },
  underline: { position: 'absolute', bottom: 40, width: 56, height: 3, borderRadius: 2, backgroundColor: colors.primary },
  title: { marginBottom: 10 },
  subtitle: { lineHeight: 18 },
  rules: { gap: 8, marginTop: 4 },
  rule: { flexDirection: 'row', gap: 8, paddingHorizontal: 8 },
  ruleText: { flex: 1 },
});
