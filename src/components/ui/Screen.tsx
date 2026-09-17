import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import { colors, layout } from '@/theme';

type ScreenProps = {
  children: ReactNode;
  /** Render inside a ScrollView. */
  scroll?: boolean;
  /** Extra props for the ScrollView when scroll is true. */
  scrollProps?: ScrollViewProps;
  /** Safe-area edges to pad. Defaults to top only (tab bar / bottom handled by screens). */
  edges?: Edge[];
  /** Apply horizontal screen padding. Default true. */
  padded?: boolean;
  /** Show the orange glow at the bottom (matches auth + list screens in Figma). */
  glow?: boolean;
  /** Leave space at the bottom for the floating tab bar. */
  withTabBar?: boolean;
  /** Wrap in KeyboardAvoidingView (iOS padding / Android height). */
  keyboard?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  /** Fixed footer rendered under the scroll area (e.g. primary CTA). */
  footer?: ReactNode;
  /** Fixed header rendered above the scroll area (stays put while content scrolls). */
  header?: ReactNode;
};

export function Screen({
  children,
  scroll = false,
  scrollProps,
  edges = ['top'],
  padded = true,
  glow = false,
  withTabBar = false,
  keyboard = false,
  style,
  contentStyle,
  backgroundColor = colors.bg,
  footer,
  header,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const padTop = edges.includes('top') ? insets.top : 0;
  const padBottom = edges.includes('bottom') ? Math.max(insets.bottom, 12) : 0;
  const tabSpace = withTabBar ? layout.tabBarHeight + layout.tabBarBottomOffset + insets.bottom + 16 : 0;

  const inner = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
      {...scrollProps}
      contentContainerStyle={[
        padded && styles.padded,
        { paddingBottom: (footer ? 8 : 24) + tabSpace },
        contentStyle,
        scrollProps?.contentContainerStyle,
      ]}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded, { paddingBottom: tabSpace }, contentStyle]}>{children}</View>
  );

  const body = keyboard ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      {header}
      {inner}
      {footer ? <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>{footer}</View> : null}
    </KeyboardAvoidingView>
  ) : (
    <>
      {header}
      {inner}
      {footer ? <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>{footer}</View> : null}
    </>
  );

  return (
    <View style={[styles.flex, { backgroundColor, paddingTop: padTop, paddingBottom: padBottom }, style]}>
      <StatusBar style="light" />
      {glow ? (
        <LinearGradient
          pointerEvents="none"
          colors={['transparent', 'rgba(255,107,0,0.10)', 'rgba(255,107,0,0.32)']}
          style={styles.glow}
        />
      ) : null}
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { paddingHorizontal: layout.screenPadding },
  glow: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 260 },
  footer: { paddingHorizontal: layout.screenPadding, paddingTop: 8, backgroundColor: 'transparent' },
});
