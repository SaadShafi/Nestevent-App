import { StyleSheet, View } from 'react-native';

import { AppText, Icon, type IoniconName } from '@/components/ui';
import { colors } from '@/theme';

type Props = {
  icon: IoniconName;
  title: string;
  subtitle?: string;
  /** Figma Ticket Details: orange icon on a dark circle, 14pt copy (default is the orange circle). */
  dark?: boolean;
};

/** Circle icon + title / subtitle (date + venue rows on Event Details). */
export function InfoRow({ icon, title, subtitle, dark }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.circle, dark && styles.circleDark]}>
        <Icon name={icon} size={dark ? 20 : 18} color={dark ? colors.primary : colors.white} />
      </View>
      <View style={styles.flex}>
        <AppText variant="bodyMedium" style={dark && styles.small}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="body" style={dark && styles.small}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  flex: { flex: 1 },
  circle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  circleDark: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface },
  small: { fontSize: 14, lineHeight: 19 },
});
