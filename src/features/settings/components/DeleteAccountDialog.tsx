import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Icon, IconButton, Input } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

type Props = { visible: boolean; onClose: () => void; onConfirm: (password: string) => void };

/**
 * Second step of account deletion (Figma): confirm your password + agree to Terms & Privacy,
 * then the red "Delete Account" button.
 */
export function DeleteAccountDialog({ visible, onClose, onConfirm }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const close = () => {
    setPassword('');
    setError(undefined);
    onClose();
  };

  const submit = () => {
    if (!password.trim()) {
      haptic.error();
      setError('Enter your password to continue');
      return;
    }
    if (password.trim().length < 6) {
      haptic.error();
      setError('Password must be at least 6 characters');
      return;
    }
    if (!agree) {
      haptic.error();
      setError('Please agree to the Terms and Privacy Policy');
      return;
    }
    const value = password;
    close();
    onConfirm(value);
  };

  const openLegal = (path: '/settings/terms' | '/settings/privacy') => {
    close();
    setTimeout(() => router.push(path), 200);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <View style={styles.root}>
        {Platform.OS === 'ios' ? <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} /> : null}
        <Pressable style={[StyleSheet.absoluteFill, styles.dim]} onPress={close} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
          <View style={styles.card}>
            <IconButton name="close" size={32} iconSize={16} backgroundColor="transparent" onPress={close} style={styles.close} accessibilityLabel="Close" />
            <Icon name="trash" size={72} color={colors.danger} style={styles.bin} />
            <AppText variant="h1" center>
              Delete Account
            </AppText>
            <AppText variant="caption" center secondary style={styles.subtitle}>
              To Delete your Account Confirm your Password
            </AppText>

            <Input
              password
              placeholder="New Password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (error) setError(undefined);
              }}
              error={error}
              autoCapitalize="none"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={submit}
              containerStyle={styles.input}
            />

            <Pressable
              onPress={() => {
                haptic.selection();
                setAgree((a) => !a);
              }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agree }}
              style={styles.agreeRow}>
              <View style={[styles.checkbox, agree && styles.checkboxOn]}>{agree ? <Icon name="checkmark" size={11} color={colors.black} /> : null}</View>
              <AppText variant="caption" style={styles.agreeText}>
                By Tapping Confirm, Agree To Nest{' '}
                <AppText variant="captionMedium" onPress={() => openLegal('/settings/terms')}>
                  Terms And Conditions
                </AppText>{' '}
                &{' '}
                <AppText variant="captionMedium" onPress={() => openLegal('/settings/privacy')}>
                  Privacy Policy
                </AppText>
              </AppText>
            </Pressable>

            <Button title="Delete Account" onPress={submit} style={styles.delete} textColor={colors.white} />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', padding: 24 },
  kav: { justifyContent: 'center' },
  dim: { backgroundColor: 'rgba(0,0,0,0.6)' },
  card: { backgroundColor: colors.bgElevated, borderRadius: radius.xxl, paddingHorizontal: 18, paddingTop: 28, paddingBottom: 20, alignItems: 'center' },
  close: { position: 'absolute', top: 10, right: 10 },
  bin: { marginBottom: 16 },
  subtitle: { marginTop: 6, marginBottom: 18 },
  input: { alignSelf: 'stretch', marginBottom: 14 },
  agreeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, alignSelf: 'stretch', paddingHorizontal: 6, marginBottom: 18 },
  checkbox: { width: 16, height: 16, borderRadius: 4, borderWidth: 1.5, borderColor: colors.textMuted, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxOn: { backgroundColor: colors.success, borderColor: colors.success },
  agreeText: { flex: 1, lineHeight: 18 },
  delete: { backgroundColor: colors.danger, alignSelf: 'stretch' },
});
