import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useState, type ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { KeyboardAvoidingView, KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
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
  /** Keep focused inputs and the footer above the keyboard (iOS + Android edge-to-edge). */
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
  const [footerHeight, setFooterHeight] = useState(0);
  const footerPadBottom = Math.max(insets.bottom, 12);

  const ScrollComponent = keyboard ? KeyboardAwareScrollView : ScrollView;
  const inner = scroll ? (
    <ScrollComponent
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
      {...(keyboard ? { bottomOffset: (footer ? footerHeight : 0) + 48 } : null)}
      {...scrollProps}
      contentContainerStyle={[
        padded && styles.padded,
        { paddingBottom: (footer ? 8 : 24) + tabSpace },
        contentStyle,
        scrollProps?.contentContainerStyle,
      ]}>
      {children}
    </ScrollComponent>
  ) : (
    <View style={[styles.flex, padded && styles.padded, { paddingBottom: tabSpace }, contentStyle]}>{children}</View>
  );

  const body = keyboard && scroll ? (
    <>
      {header}
      {inner}
      {footer ? (
        // Scroll screens: the scroll view makes room for the keyboard itself; the footer CTA rides on top of it.
        <KeyboardStickyView offset={{ opened: footerPadBottom - 8 }}>
          <View
            onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
            style={[styles.footer, { paddingBottom: footerPadBottom }]}>
            {footer}
          </View>
        </KeyboardStickyView>
      ) : null}
    </>
  ) : keyboard ? (
    <KeyboardAvoidingView style={styles.flex} behavior="padding">
      {header}
      {inner}
      {footer ? <View style={[styles.footer, { paddingBottom: footerPadBottom }]}>{footer}</View> : null}
    </KeyboardAvoidingView>
  ) : (
    <>
      {header}
      {inner}
      {footer ? <View style={[styles.footer, { paddingBottom: footerPadBottom }]}>{footer}</View> : null}
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
