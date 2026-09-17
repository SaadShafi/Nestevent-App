import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, ConfirmDialog, IconButton } from '@/components/ui';
import { useAuthStore } from '@/store';

import { SideDrawer } from './SideDrawer';

/**
 * Hamburger drawer + logout confirmation, shared by every tab screen.
 *
 *   const { openDrawer, drawer } = useAppDrawer();
 *   ...
 *   <IconButton name="menu-outline" onPress={openDrawer} />
 *   {drawer}
 */
export function useAppDrawer() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const drawer = (
    <>
      <SideDrawer visible={open} onClose={() => setOpen(false)} onLogout={() => setConfirm(true)} />
      <ConfirmDialog
        visible={confirm}
        onClose={() => setConfirm(false)}
        placement="bottom"
        title="Logout"
        message="Are you sure you want to log out?"
        confirmLabel="Yes Logout"
        onConfirm={() => {
          signOut();
          router.replace('/');
        }}
      />
    </>
  );

  return { openDrawer: () => setOpen(true), drawer };
}

/**
 * Standard tab header: hamburger + avatar + name on the left, action buttons on the right
 * (Social / Tickets / Profile tabs in the Figma).
 */
export function TabHeader({ onMenu, right, subtitle }: { onMenu: () => void; right?: ReactNode; subtitle?: string }) {
  const user = useAuthStore((s) => s.user);
  return (
    <View style={styles.row}>
      <IconButton name="menu-outline" onPress={onMenu} accessibilityLabel="Open menu" />
      <Avatar uri={user.avatar} size={40} />
      <View style={styles.name}>
        <AppText variant="title" numberOfLines={1}>
          {user.displayName}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" secondary numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 56, marginBottom: 8 },
  name: { flex: 1 },
  right: { flexDirection: 'row', gap: 8 },
});
