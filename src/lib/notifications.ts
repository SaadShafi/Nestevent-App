import { Platform } from 'react-native';

/**
 * expo-notifications throws at import time inside Expo Go on Android (SDK 53+),
 * so it is loaded lazily and guarded. In a development build it works normally.
 */
export async function requestPushPermission(): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Notifications = require('expo-notifications') as typeof import('expo-notifications');
    const res = await Notifications.requestPermissionsAsync();
    return !!res.granted;
  } catch {
    // Expo Go (Android) or module unavailable: treat as granted so the toggle still works in demos.
    return Platform.OS === 'android';
  }
}
