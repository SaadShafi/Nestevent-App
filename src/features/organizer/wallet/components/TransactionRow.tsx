import { StyleSheet, View } from 'react-native';

import { AppText, Avatar } from '@/components/ui';
import type { Transaction } from '@/data/types';
import { initials } from '@/lib/format';
import { colors } from '@/theme';

import { signedAmount, transactionTime } from '../../utils';

/** Wallet / Transactions History row: avatar + name/role on the left, signed amount + time on the right. */
export function TransactionRow({ tx }: { tx: Transaction }) {
  const positive = tx.amount >= 0;
  return (
    <View style={styles.row}>
      {tx.avatar ? (
        <Avatar uri={tx.avatar} size={44} />
      ) : (
        <View style={styles.fallback}>
          <AppText variant="label" color={colors.primary}>
            {initials(tx.name) || '$'}
          </AppText>
        </View>
      )}
      <View style={styles.text}>
        <AppText variant="title" numberOfLines={1}>
          {tx.name}
        </AppText>
        <AppText variant="caption" secondary numberOfLines={1}>
          {tx.role}
        </AppText>
      </View>
      <View style={styles.right}>
        <AppText variant="h3" color={positive ? colors.success : colors.danger}>
          {signedAmount(tx.amount)}
        </AppText>
        <AppText variant="caption" secondary>
          {transactionTime(tx.at)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  fallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  right: { alignItems: 'flex-end', gap: 2 },
});
