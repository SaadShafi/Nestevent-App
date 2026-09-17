import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, BottomSheet, Icon } from '@/components/ui';
import { colors } from '@/theme';

import { SORT_LABEL, type CommentSort } from './CommentList';

/** "Best comments ▾" trigger. */
export function SortTrigger({ value, onPress }: { value: CommentSort; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.trigger} accessibilityRole="button">
      <AppText variant="caption">{SORT_LABEL[value]}</AppText>
      <Icon name="chevron-down" size={14} color={colors.text} />
    </Pressable>
  );
}

/** Small dropdown (bottom sheet) to switch between "Best comments" and "Newest". */
export function SortMenu({
  visible,
  value,
  onClose,
  onChange,
}: {
  visible: boolean;
  value: CommentSort;
  onClose: () => void;
  onChange: (v: CommentSort) => void;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Sort comments">
      {(Object.keys(SORT_LABEL) as CommentSort[]).map((k) => (
        <Pressable
          key={k}
          onPress={() => {
            onChange(k);
            onClose();
          }}
          style={[styles.row, value === k && styles.active]}>
          <AppText variant="title" style={styles.flex}>
            {SORT_LABEL[k]}
          </AppText>
          {value === k ? <Icon name="checkmark-circle" size={20} color={colors.primary} /> : null}
        </Pressable>
      ))}
      <View style={styles.spacer} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  trigger: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 8, backgroundColor: colors.surface },
  active: { borderWidth: 1.5, borderColor: colors.primary },
  flex: { flex: 1 },
  spacer: { height: 8 },
});
