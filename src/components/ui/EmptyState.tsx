import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IoniconName } from './Icon';

export function EmptyState({ icon = 'sparkles-outline', title, message }: { icon?: IoniconName; title: string; message?: string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={28} color={colors.primary} />
      </View>
      <AppText variant="h3" center>
        {title}
      </AppText>
      {message ? (
        <AppText center secondary style={styles.msg}>
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  msg: { marginTop: 6 },
});
