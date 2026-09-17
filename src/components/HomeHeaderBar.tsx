import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { FigmaIcon } from '@/components/icons/FigmaIcon';
import { AppText, NestLogo } from '@/components/ui';
import { colors } from '@/theme';

type Props = {
  /** Caption above the address ("You location" / "Your location"). Omit to hide the location block. */
  caption?: string;
  location?: string;
  onLocationPress?: () => void;
  right?: ReactNode;
};

/** Figma "Tab 2" header: white NEST mark + location column + round glass action buttons. */
export function HomeHeaderBar({ caption, location, onLocationPress, right }: Props) {
  return (
    <View style={styles.row}>
      <NestLogo variant="white" size={40} />
      {location ? (
        <Pressable onPress={onLocationPress} style={styles.location} hitSlop={8} accessibilityRole="button" accessibilityLabel="Change location">
          <View style={styles.captionRow}>
            <FigmaIcon name="pin" size={14} color={colors.white} />
            <AppText variant="caption" color={colors.white}>
              {caption ?? 'You location'}
            </AppText>
          </View>
          <View style={styles.addressRow}>
            <AppText variant="title" color={colors.white} numberOfLines={1} style={styles.address}>
              {location}
            </AppText>
            <FigmaIcon name="dropdown" size={14} color={colors.white} />
          </View>
        </Pressable>
      ) : (
        <View style={styles.flex} />
      )}
      <View style={styles.actions}>{right}</View>
    </View>
  );
}

/** Round 40pt glass button with a white hairline ring, as used on the orange headers. */
export function HeaderGlassButton({ children, onPress, badge, accessibilityLabel }: { children: ReactNode; onPress: () => void; badge?: boolean; accessibilityLabel: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} hitSlop={6} style={({ pressed }) => [styles.glass, pressed && styles.pressed]}>
      {children}
      {badge ? <View style={styles.badge} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 44 },
  flex: { flex: 1 },
  location: { flex: 1, gap: 4, justifyContent: 'center' },
  captionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  address: { flexShrink: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  glass: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  badge: { position: 'absolute', top: 9, right: 10, width: 6, height: 6, borderRadius: 3, backgroundColor: '#E01E2E' },
});
