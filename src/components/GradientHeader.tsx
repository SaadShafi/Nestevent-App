import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout, radius } from '@/theme';

/**
 * Orange → black gradient header block used on Home (guest + organizer).
 * Children are laid out inside the safe area.
 */
export function GradientHeader({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={['#FF6B00', '#C24E00', '#3A1A05', '#0B0B0B']}
      locations={[0, 0.35, 0.8, 1]}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[styles.grad, { paddingTop: insets.top + 8 }, style]}>
      <View style={styles.inner}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  grad: { borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl, paddingBottom: 20 },
  inner: { paddingHorizontal: layout.screenPadding },
});
