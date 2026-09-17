import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, layout, radius } from '@/theme';

type Props = { title?: string; onPress: () => void; disabled?: boolean };

/** Dark pill CTA with an orange circle arrow on the left and faint chevrons on the right (Select Role). */
export function GetStartedButton({ title = 'Get Started', onPress, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        haptic.medium();
        onPress();
      }}
      style={({ pressed }) => [styles.base, pressed && styles.pressed, disabled && styles.disabled]}>
      <View style={styles.circle}>
        <Icon name="arrow-forward" size={22} color={colors.white} />
      </View>
      <View pointerEvents="none" style={styles.titleWrap}>
        <AppText variant="button" center>
          {title}
        </AppText>
      </View>
      <View style={styles.spacer} />
      <View style={styles.chevrons}>
        {[0.25, 0.4, 0.6].map((o, i) => (
          <Icon key={i} name="chevron-forward" size={16} color={`rgba(255,255,255,${o})`} style={styles.chev} />
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: layout.buttonHeight + 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 22,
  },
  circle: {
    width: layout.buttonHeight - 4,
    height: layout.buttonHeight - 4,
    borderRadius: (layout.buttonHeight - 4) / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  spacer: { flex: 1 },
  chevrons: { flexDirection: 'row', alignItems: 'center' },
  chev: { marginLeft: -6 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});
