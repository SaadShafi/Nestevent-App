import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { PermissionsAndroid, Platform, StyleSheet } from 'react-native';

import { AppText, Button, Header, Screen, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { requestPushPermission } from '@/lib/notifications';
import { useAuthStore } from '@/store';

import { PermissionRow } from '../components/PermissionRow';

type Key = 'contacts' | 'bluetooth' | 'notifications' | 'location';

async function requestBluetooth(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const sdk = typeof Platform.Version === 'number' ? Platform.Version : parseInt(String(Platform.Version), 10);
  if (sdk < 31) return true; // Pre-Android 12: bluetooth perms are install-time.
  try {
    const res = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    ]);
    return Object.values(res).every((v) => v === PermissionsAndroid.RESULTS.GRANTED);
  } catch {
    return false;
  }
}

export function PermissionsScreen() {
  const router = useRouter();
  const toast = useToast();
  const { permissions, setPermissions, completeProfile } = useAuthStore();
  const [busy, setBusy] = useState<Key | null>(null);

  const request = async (key: Key): Promise<boolean> => {
    try {
      switch (key) {
        case 'contacts': {
          const { granted } = await Contacts.requestPermissionsAsync();
          return granted;
        }
        case 'notifications': {
          return requestPushPermission();
        }
        case 'location': {
          const { granted } = await Location.requestForegroundPermissionsAsync();
          return granted;
        }
        case 'bluetooth': {
          if (Platform.OS === 'ios') {
            toast('Bluetooth will be requested when needed', 'info');
            return true;
          }
          return requestBluetooth();
        }
      }
    } catch {
      return false;
    }
  };

  const onToggle = async (key: Key, value: boolean) => {
    haptic.selection();
    if (!value) {
      setPermissions({ [key]: false });
      return;
    }
    setBusy(key);
    const granted = await request(key);
    setBusy(null);
    setPermissions({ [key]: granted });
    if (!granted) toast('Permission not granted. You can enable it later in Settings.', 'error');
  };

  const save = () => {
    haptic.success();
    completeProfile({});
    router.push('/(auth)/register-success');
  };

  return (
    <Screen edges={['top', 'bottom']} footer={<Button variant="white" title="Save & Continue" onPress={save} />}>
      <Header />
      <AppText variant="display" style={styles.title}>
        To Use the{'\n'}application
      </AppText>

      <PermissionRow
        title="Contact Access"
        icon="people-outline"
        value={permissions.contacts}
        busy={busy === 'contacts'}
        onChange={(v) => onToggle('contacts', v)}
      />
      <PermissionRow
        title="Bluetooth Access"
        icon="bluetooth-outline"
        value={permissions.bluetooth}
        busy={busy === 'bluetooth'}
        onChange={(v) => onToggle('bluetooth', v)}
      />
      <PermissionRow
        title="Push Notifications"
        icon="notifications-outline"
        value={permissions.notifications}
        busy={busy === 'notifications'}
        onChange={(v) => onToggle('notifications', v)}
      />
      <PermissionRow
        title="Location"
        icon="location-outline"
        value={permissions.location}
        busy={busy === 'location'}
        onChange={(v) => onToggle('location', v)}
      />
    </Screen>
  );
}

export default PermissionsScreen;

const styles = StyleSheet.create({
  title: { marginTop: 8, marginBottom: 24 },
});
