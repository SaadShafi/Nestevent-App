import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FigmaIcon, type FigmaIconName } from '@/components/icons/FigmaIcon';
import { AppText } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, layout, radius } from '@/theme';

export type TabConfig = {
  name: string;
  label: string;
  icon: FigmaIconName;
  /** Render as the "+" action tile (guest create) */
  action?: boolean;
};

type Props = BottomTabBarProps & { tabs: TabConfig[]; onAction?: () => void; profileLabel?: string };

/**
 * Bottom Nav from the Figma: translucent dark pill (rgba(29,29,29,0.5) over blur), 70pt tall,
 * with the active tab as an orange gradient pill (#FF8800 → #D83E00) holding a 20pt icon and a
 * 14pt bold label; inactive tabs are 24pt vuesax line icons spread evenly.
 */
export function FloatingTabBar({ state, navigation, tabs, onAction, profileLabel }: Props) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8) + 8;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      <View style={styles.bar}>
        {Platform.OS === 'ios' ? <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} /> : null}
        <View style={[StyleSheet.absoluteFill, styles.tint]} />
        {tabs.map((tab) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
          const route = state.routes[routeIndex];
          const focused = state.index === routeIndex;

          if (tab.action) {
            return (
              <Pressable
                key={tab.name}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
                hitSlop={8}
                onPress={() => {
                  haptic.medium();
                  onAction?.();
                }}
                style={styles.item}>
                <FigmaIcon name="tabPlus" width={46} height={34} color={colors.white} />
              </Pressable>
            );
          }

          const onPress = () => {
            if (!route) return;
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              haptic.selection();
              navigation.navigate(route.name, route.params);
            }
          };

          const label = tab.name === 'profile' && profileLabel ? profileLabel : tab.label;

          if (focused) {
            return (
              <Pressable key={tab.name} accessibilityRole="tab" accessibilityState={{ selected: true }} accessibilityLabel={tab.label} onPress={onPress}>
                <LinearGradient colors={['#FF8800', '#D83E00']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.active}>
                  <FigmaIcon name={tab.icon} size={20} color={colors.white} />
                  <AppText variant="label" style={styles.activeLabel} numberOfLines={1}>
                    {label}
                  </AppText>
                </LinearGradient>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={tab.name}
              accessibilityRole="tab"
              accessibilityState={{ selected: false }}
              accessibilityLabel={tab.label}
              hitSlop={8}
              onPress={onPress}
              style={styles.item}>
              <FigmaIcon name={tab.icon} size={24} color={colors.white} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  bar: {
    height: layout.tabBarHeight,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 20,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  tint: { backgroundColor: Platform.OS === 'ios' ? 'rgba(29,29,29,0.5)' : 'rgba(29,29,29,0.92)' },
  item: { height: 44, minWidth: 40, alignItems: 'center', justifyContent: 'center' },
  active: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  activeLabel: { color: colors.white, flexShrink: 0 },
});
