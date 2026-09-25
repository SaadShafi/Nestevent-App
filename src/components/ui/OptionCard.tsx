import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  selected?: boolean;
  onPress?: () => void;
  /** Filled orange when selected (Create Post sheet) instead of outlined (Select Role) */
  filled?: boolean;
  compact?: boolean;
  /** Override the selected check colour (Create Post sheet uses the green tick). */
  checkColor?: string;
};

/** Selectable card with check badge — Select Role, Attendance Model, Create Post sheet. */
export function OptionCard({ title, description, icon, selected, onPress, filled, compact, checkColor }: Props) {
  return (
    <Pressable
      onPress={() => {
        haptic.selection();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compact,
        selected && (filled ? styles.filled : styles.outlined),
        pressed && styles.pressed,
      ]}>
      {compact ? (
        <View style={styles.compactRow}>
          {icon ? <View style={styles.compactIcon}>{icon}</View> : null}
          <AppText variant="label" style={styles.flex}>
            {title}
          </AppText>
          {selected ? <Icon name="checkmark-circle" size={22} color={checkColor ?? (filled ? colors.white : colors.success)} /> : null}
        </View>
      ) : (
        <>
          <View style={styles.top}>
            {icon}
            {selected ? <Icon name="checkmark-circle" size={22} color={colors.success} /> : <View />}
          </View>
          <AppText variant="h3" style={styles.title}>
            {title}
          </AppText>
          {description ? (
            <AppText variant="caption" secondary style={styles.desc}>
              {description}
            </AppText>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginBottom: 14,
  },
  compact: { padding: 14, borderRadius: radius.pill, marginBottom: 10 },
  outlined: { borderColor: colors.primary },
  filled: { backgroundColor: colors.primary },
  pressed: { opacity: 0.9 },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  title: { marginBottom: 6 },
  desc: { lineHeight: 18 },
  compactRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  compactIcon: { width: 28, alignItems: 'center' },
  flex: { flex: 1 },
});
