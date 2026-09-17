import { StyleSheet, View } from 'react-native';

import { AppText, Icon, Toggle, type IoniconName } from '@/components/ui';
import { colors, radius } from '@/theme';

type Props = {
  title: string;
  icon: IoniconName;
  value: boolean;
  onChange: (v: boolean) => void;
  busy?: boolean;
};

/** Pill row with an orange icon in a dark-orange circle and a toggle (Permissions screen). */
export function PermissionRow({ title, icon, value, onChange, busy }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={20} color={colors.primary} />
      </View>
      <AppText variant="bodyMedium" style={styles.title}>
        {title}
      </AppText>
      <Toggle value={value} onValueChange={onChange} disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingLeft: 6,
    paddingRight: 14,
    height: 58,
    marginBottom: 12,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,107,0,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1 },
});
