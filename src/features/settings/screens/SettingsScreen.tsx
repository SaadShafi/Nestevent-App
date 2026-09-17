import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { ConfirmDialog, Header, Icon, ListRow, Screen, Toggle, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { requestPushPermission } from '@/lib/notifications';
import { useAuthStore } from '@/store';
import { colors } from '@/theme';

import { BecomeOrganizerCard } from '../components/BecomeOrganizerCard';
import { DeleteAccountDialog } from '../components/DeleteAccountDialog';

/** Settings: profile / password / push toggle / (organizer: wallet + bank) / delete account + Become Organizer card. */
export function SettingsScreen() {
  const router = useRouter();
  const toast = useToast();
  const role = useAuthStore((s) => s.role);
  const pushEnabled = useAuthStore((s) => s.pushEnabled);
  const setPushEnabled = useAuthStore((s) => s.setPushEnabled);
  const setPermissions = useAuthStore((s) => s.setPermissions);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const becomeOrganizer = useAuthStore((s) => s.becomeOrganizer);
  const setRole = useAuthStore((s) => s.setRole);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [passwordStep, setPasswordStep] = useState(false);
  const [confirmOrganizer, setConfirmOrganizer] = useState(false);

  const isOrganizer = role === 'organizer';

  const togglePush = async (next: boolean) => {
    haptic.selection();
    if (!next) {
      setPushEnabled(false);
      return;
    }
    try {
      const granted = await requestPushPermission();
      if (!granted) {
        toast('Enable notifications in system settings', 'error');
        setPushEnabled(false);
        return;
      }
      setPermissions({ notifications: true });
      setPushEnabled(true);
    } catch {
      toast('Could not enable notifications', 'error');
      setPushEnabled(false);
    }
  };

  const onDelete = () => {
    haptic.success();
    deleteAccount();
    router.replace('/');
  };

  const onOrganizerCard = () => {
    if (isOrganizer) {
      setRole('guest');
      toast('Switched to Guest view', 'info');
      router.replace('/');
    } else {
      setConfirmOrganizer(true);
    }
  };

  const onBecomeOrganizer = () => {
    becomeOrganizer();
    router.replace('/organizer/create-organization' as never);
  };

  return (
    <Screen scroll>
      <Header title="Setting" />

      <ListRow title="Edit Profile" icon="pencil" iconBg="transparent" onPress={() => router.push('/profile/edit')} />
      <ListRow title="Change Password" icon="key-outline" iconBg="transparent" onPress={() => router.push('/settings/change-password')} />
      <ListRow
        title="Push Notifications"
        icon="notifications-outline"
        iconBg="transparent"
        onPress={() => togglePush(!pushEnabled)}
        right={<Toggle value={pushEnabled} onValueChange={togglePush} />}
      />
      {isOrganizer ? (
        <>
          <ListRow title="My Wallet" icon="wallet-outline" iconBg="transparent" onPress={() => router.push('/organizer/wallet' as never)} />
          <ListRow
            title="Bank Accounts"
            icon="card-outline"
            iconBg="transparent"
            onPress={() => router.push('/organizer/wallet/bank-accounts' as never)}
          />
        </>
      ) : null}
      <ListRow title="Delete Account" icon="trash-outline" iconBg="transparent" danger onPress={() => setConfirmDelete(true)} />

      <BecomeOrganizerCard mode={isOrganizer ? 'organizer' : 'guest'} onPress={onOrganizerCard} />

      <ConfirmDialog
        visible={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        icon={<Icon name="trash" size={56} color={colors.danger} style={styles.trash} />}
        title="Are you Sure?"
        message="Do you really want to delete these Account, you'll permanently lose your:"
        cancelLabel="Cancel"
        confirmLabel="Confirm"
        onConfirm={() => setTimeout(() => setPasswordStep(true), 250)}
      />

      <DeleteAccountDialog visible={passwordStep} onClose={() => setPasswordStep(false)} onConfirm={onDelete} />

      <ConfirmDialog
        visible={confirmOrganizer}
        onClose={() => setConfirmOrganizer(false)}
        icon={<Icon name="people" size={56} color={colors.primary} />}
        title="Become an Organizer?"
        message="You'll set up an organization and unlock event creation, guest management and analytics."
        cancelLabel="Not now"
        confirmLabel="Continue"
        confirmVariant="primary"
        onConfirm={onBecomeOrganizer}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  trash: { marginTop: 4 },
});

export default SettingsScreen;
