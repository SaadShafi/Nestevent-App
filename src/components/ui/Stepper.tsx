import { Pressable, StyleSheet, View } from 'react-native';

import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

type Props = { value: number; min?: number; max?: number; onChange: (v: number) => void };

/** "- 1 +" pill stepper used in Cart / Choose Ticket Type. */
export function Stepper({ value, min = 0, max = 99, onChange }: Props) {
  const dec = () => {
    if (value > min) {
      haptic.selection();
      onChange(value - 1);
    }
  };
  const inc = () => {
    if (value < max) {
      haptic.selection();
      onChange(value + 1);
    }
  };
  return (
    <View style={styles.wrap}>
      <Pressable onPress={dec} hitSlop={8} style={styles.btn}>
        <Icon name="remove" size={16} color={value <= min ? colors.textMuted : colors.text} />
      </Pressable>
      <AppText variant="captionMedium" color={colors.primary} style={styles.value}>
        {value}
      </AppText>
      <Pressable onPress={inc} hitSlop={8} style={styles.btn}>
        <Icon name="add" size={16} color={value >= max ? colors.textMuted : colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.black,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    height: 36,
  },
  btn: { width: 28, height: 36, alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 20, textAlign: 'center' },
});
