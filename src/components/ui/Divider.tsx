import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

import { AppText } from './AppText';

export function Divider({ label, spacing = 16 }: { label?: string; spacing?: number }) {
  if (!label) return <View style={[styles.line, { marginVertical: spacing }]} />;
  return (
    <View style={[styles.row, { marginVertical: spacing }]}>
      <View style={styles.line} />
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
