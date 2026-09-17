import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptics are a strong iOS convention; on Android we keep them subtle
 * (only on selection/success) so they don't feel intrusive.
 */
export const haptic = {
  light: () => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  medium: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  selection: () => {
    Haptics.selectionAsync().catch(() => {});
  },
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  error: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  },
};
