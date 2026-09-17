import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors } from '@/theme';

type Props = { checked: boolean; onChange: (v: boolean) => void; label?: string };

/** Small orange square checkbox ("Remember me"). */
export function Checkbox({ checked, onChange, label }: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      hitSlop={8}
      onPress={() => {
        haptic.selection();
        onChange(!checked);
      }}
      style={styles.row}>
      <View style={[styles.box, checked && styles.checked]}>
        {checked ? <Icon name="checkmark" size={13} color={colors.white} /> : null}
      </View>
      {label ? <AppText variant="label">{label}</AppText> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  box: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: { backgroundColor: colors.primary, borderColor: colors.primary },
});
