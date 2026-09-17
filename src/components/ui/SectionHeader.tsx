import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

import { AppText } from './AppText';

export function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.row}>
      <AppText variant="h3">{title}</AppText>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <AppText variant="label" color={colors.primary}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 8 },
});
