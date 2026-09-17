import { StyleSheet, View } from 'react-native';

import { AppText, Icon, type IoniconName } from '@/components/ui';
import { colors } from '@/theme';

/** Orange circle icon + title / subtitle (date + venue rows on Event Details). */
export function InfoRow({ icon, title, subtitle }: { icon: IoniconName; title: string; subtitle?: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.circle}>
        <Icon name={icon} size={18} color={colors.white} />
      </View>
      <View style={styles.flex}>
        <AppText variant="bodyMedium">{title}</AppText>
        {subtitle ? <AppText variant="body">{subtitle}</AppText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  flex: { flex: 1 },
  circle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
