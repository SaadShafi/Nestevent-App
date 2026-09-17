import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

type Props = { children: ReactNode; style?: StyleProp<ViewStyle> };

/** Slightly elevated rounded form container with a subtle orange glow at the bottom (Login / Register). */
export function AuthCard({ children, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(255,107,0,0.06)', 'rgba(255,107,0,0.22)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: 'hidden',
  },
  inner: { padding: 20, paddingTop: 24 },
});
