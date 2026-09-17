import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { Syne_700Bold, Syne_800ExtraBold } from '@expo-google-fonts/syne';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ShareSheetHost, ToastProvider } from '@/components/ui';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 300, fade: true });

const NestTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.bgElevated,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Syne_700Bold,
    Syne_800ExtraBold,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg).catch(() => {});
  }, []);

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <ThemeProvider value={NestTheme}>
          <ToastProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
                // iOS keeps the native push; Android gets a lighter slide so it feels platform-native.
                animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right',
                gestureEnabled: true,
              }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
              <Stack.Screen name="(guest)" options={{ animation: 'fade' }} />
              <Stack.Screen name="(organizer)" options={{ animation: 'fade' }} />
              <Stack.Screen name="filter" options={{ presentation: 'modal' }} />
              <Stack.Screen name="create-post/index" options={{ presentation: 'transparentModal', animation: 'fade' }} />
              <Stack.Screen name="create-post/camera" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="event/[id]/cart" options={{ presentation: 'modal' }} />
              <Stack.Screen name="event/[id]/checkout" options={{ presentation: 'modal' }} />
              <Stack.Screen name="event/[id]/ticket-order" options={{ presentation: 'modal' }} />
              <Stack.Screen name="delivery-address" options={{ presentation: 'modal' }} />
              <Stack.Screen name="organizer/event/[id]/scan" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
            </Stack>
            <ShareSheetHost />
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
