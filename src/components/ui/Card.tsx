import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  /** Orange border (selected state) */
  selected?: boolean;
  padding?: number;
};

/** Dark rounded surface card. */
export function Card({ children, style, onPress, selected, padding = 16 }: Props) {
  const content = (
    <View style={[styles.card, { padding }, selected && styles.selected, style]}>{children}</View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1.5, borderColor: 'transparent' },
  selected: { borderColor: colors.primary },
  pressed: { opacity: 0.9 },
});
