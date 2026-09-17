import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Header, Icon, Input, MCIcon, Screen, Toggle } from '@/components/ui';
import type { EventVisibility } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { useOrganizerStore } from '@/store';
import { colors, radius } from '@/theme';

import { WizardHeading } from '../../shared/WizardHeading';

const OPTIONS: { key: EventVisibility; label: string; icon: ReactNode }[] = [
  { key: 'public', label: 'Public', icon: <Icon name="globe" size={18} color={colors.primary} /> },
  { key: 'private', label: 'Private', icon: <MCIcon name="account-lock" size={19} color={colors.primary} /> },
  { key: 'invite', label: 'Invite-Only', icon: <Icon name="lock-closed" size={17} color={colors.primary} /> },
  { key: 'password', label: 'Password Protected', icon: <MCIcon name="asterisk" size={18} color={colors.primary} /> },
];

/** Event Visibility — radio-like toggles; Password Protected expands into a password card. */
export function VisibilityScreen() {
  const router = useRouter();
  const visibility = useOrganizerStore((s) => s.draft.visibility);
  const password = useOrganizerStore((s) => s.draft.password);
  const setDraft = useOrganizerStore((s) => s.setDraft);
  const [error, setError] = useState<string | undefined>();

  const select = (key: EventVisibility, on: boolean) => {
    haptic.selection();
    setDraft({ visibility: on ? key : 'public' });
    if (key !== 'password' || !on) setError(undefined);
    if (key === 'password' && on && !password) router.push('/organizer/create-event/password');
  };

  const next = () => {
    if (visibility === 'password' && !password.trim()) {
      haptic.error();
      setError('Password is required for a password-protected event');
      router.push('/organizer/create-event/password');
      return;
    }
    if (visibility === 'password' && password.trim().length < 4) {
      haptic.error();
      setError('Use at least 4 characters');
      router.push('/organizer/create-event/password');
      return;
    }
    setError(undefined);
    router.push('/organizer/create-event/attendance');
  };

  return (
    <Screen scroll keyboard footer={<Button title="Save & Continue" variant="white" onPress={next} />}>
      <Header left="back" />
      <WizardHeading title="Event Visibility" subtitle="Public, Private or Invite-Only visibility." />

      {OPTIONS.map((o) => {
        const on = visibility === o.key;
        const expanded = o.key === 'password' && on;
        return (
          <View key={o.key} style={[styles.card, expanded && styles.cardExpanded]}>
            <View style={styles.row}>
              <View style={styles.iconWrap}>{o.icon}</View>
              <AppText variant="bodyMedium" style={styles.flex}>
                {o.label}
              </AppText>
              <Toggle value={on} onValueChange={(v) => select(o.key, v)} />
            </View>
            {expanded ? (
              <View style={styles.passwordBlock}>
                <View style={styles.passwordRow}>
                  <Input
                    password
                    placeholder="Set a password"
                    value={password}
                    editable={false}
                    onPressField={() => router.push('/organizer/create-event/password')}
                    onChangeText={(t) => {
                      setDraft({ password: t });
                      if (error) setError(undefined);
                    }}
                    error={error}
                    autoCapitalize="none"
                    containerStyle={[styles.flex, styles.noMargin]}
                    fieldStyle={styles.passwordField}
                  />
                  <Button
                    title="Edit"
                    variant="outlinePrimary"
                    size="md"
                    fullWidth={false}
                    onPress={() => router.push('/organizer/create-event/password')}
                  />
                </View>
                <AppText variant="caption" secondary center style={styles.hint}>
                  Share This Password With Your Audience
                </AppText>
              </View>
            ) : null}
          </View>
        );
      })}
    </Screen>
  );
}

export default VisibilityScreen;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardExpanded: { borderColor: colors.primary, borderRadius: radius.xl, paddingBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,107,0,0.16)', alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  noMargin: { marginBottom: 0 },
  passwordBlock: { marginTop: 14, paddingHorizontal: 4 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  passwordField: { backgroundColor: colors.bg },
  hint: { marginTop: 10 },
});
