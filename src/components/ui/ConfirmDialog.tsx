import { BlurView } from 'expo-blur';
import { type ReactNode } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

import { AppText } from './AppText';
import { useBlurTarget } from './BlurTarget';
import { Button, type ButtonVariant } from './Button';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  icon?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  confirmVariant?: ButtonVariant;
  /** 'center' card (delete account) or 'bottom' sheet (logout) */
  placement?: 'center' | 'bottom';
};

/** Centered confirmation card (Delete Account) or bottom confirm (Logout) from the Figma. */
export function ConfirmDialog({
  visible,
  onClose,
  title,
  message,
  icon,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  confirmVariant = 'white',
  placement = 'center',
}: Props) {
  const blurTarget = useBlurTarget();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.root, placement === 'bottom' && styles.rootBottom]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
        ) : blurTarget ? (
          <BlurView intensity={35} tint="dark" blurTarget={blurTarget} blurMethod="dimezisBlurViewSdk31Plus" style={StyleSheet.absoluteFill} />
        ) : null}
        <Pressable style={[StyleSheet.absoluteFill, styles.dim]} onPress={onClose} />
        <View style={[styles.card, placement === 'bottom' && styles.cardBottom]}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <AppText variant="h1" center style={styles.title}>
            {title}
          </AppText>
          {message ? (
            <AppText center secondary style={styles.message}>
              {message}
            </AppText>
          ) : null}
          <View style={styles.actions}>
            <Button title={cancelLabel} variant="outline" onPress={onClose} style={styles.btn} />
            <Button
              title={confirmLabel}
              variant={confirmVariant}
              onPress={() => {
                onClose();
                onConfirm();
              }}
              style={styles.btn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  rootBottom: { justifyContent: 'flex-end', padding: 0 },
  dim: { backgroundColor: 'rgba(0,0,0,0.6)' },
  card: {
    width: '100%',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.xxl,
    padding: 24,
    alignItems: 'center',
  },
  cardBottom: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, paddingBottom: 40 },
  icon: { marginBottom: 16 },
  title: { marginBottom: 8 },
  message: { marginBottom: 24 },
  actions: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  btn: { flex: 1 },
});
