import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { colors } from '@/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
      }}>
      <Stack.Screen name="register-success" options={{ presentation: 'transparentModal', animation: 'fade' }} />
    </Stack>
  );
}
