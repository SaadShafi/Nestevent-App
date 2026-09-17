import { Platform, Switch, type SwitchProps } from 'react-native';

import { colors } from '@/theme';

/** Orange-tinted switch. Uses the native control (iOS/Android look native). */
export function Toggle(props: SwitchProps) {
  return (
    <Switch
      trackColor={{ false: '#3A3A3A', true: colors.primary }}
      thumbColor={Platform.OS === 'android' ? colors.white : undefined}
      ios_backgroundColor="#3A3A3A"
      {...props}
    />
  );
}
