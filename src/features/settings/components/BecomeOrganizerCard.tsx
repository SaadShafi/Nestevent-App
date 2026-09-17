import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, MCIcon } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, radius, shadows } from '@/theme';

type Props = {
  /** 'guest' → "Become Organizer"; 'organizer' → "Switch to Guest view" */
  mode: 'guest' | 'organizer';
  onPress: () => void;
};

const DOTS = 5;

/** Surface card with orange border, dark circular badge and dotted pattern (Settings). */
export function BecomeOrganizerCard({ mode, onPress }: Props) {
  const organizer = mode === 'organizer';
  return (
    <Pressable
      onPress={() => {
        haptic.medium();
        onPress();
      }}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.dots} pointerEvents="none">
        {Array.from({ length: DOTS * DOTS }).map((_, i) => (
          <View key={i} style={styles.dot} />
        ))}
      </View>
      <View style={styles.badge}>
        <MCIcon name={organizer ? 'account-switch' : 'account-group'} size={40} color={colors.primary} />
      </View>
      <View style={styles.text}>
        {organizer ? (
          <AppText variant="h1">
            Switch to <AppText variant="h1" color={colors.primary}>Guest</AppText> view
          </AppText>
        ) : (
          <AppText variant="h1">
            Become <AppText variant="h1" color={colors.primary}>Organizer</AppText>
          </AppText>
        )}
        <View style={styles.underline} />
        <AppText variant="caption" secondary>
          {organizer ? 'Browse and buy tickets the way your guests do.' : 'Create events, manage guests, and grow your audience.'}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 20,
    marginTop: 14,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.92 },
  dots: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: DOTS * 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    opacity: 0.45,
  },
  dot: { width: 2, height: 2, borderRadius: 1, backgroundColor: colors.primary },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  text: { flex: 1, gap: 6 },
  underline: { width: 28, height: 3, borderRadius: 2, backgroundColor: colors.primary },
});
