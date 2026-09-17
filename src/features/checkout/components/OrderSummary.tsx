import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { formatCurrency } from '@/lib/format';
import { colors } from '@/theme';

type Totals = { quantity: number; subtotal: number; tax: number; total: number; discountAmt?: number };

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <AppText variant={bold ? 'h2' : 'caption'} secondary={!bold}>
        {label}
      </AppText>
      <AppText variant={bold ? 'h2' : 'caption'} secondary={!bold}>
        {value}
      </AppText>
    </View>
  );
}

/** Quantity / Tax fee / Ticket Price / Total Payment rows used by Cart + Checkout. */
export function OrderSummaryRows({ totals, promoCode }: { totals: Totals; promoCode?: string | null }) {
  return (
    <View style={styles.rows}>
      <Row label="Quantity" value={`${totals.quantity}`} />
      <Row label="Tax fee" value={formatCurrency(totals.tax, { decimals: 2 })} />
      <Row label="Ticket Price" value={formatCurrency(totals.subtotal)} />
      {promoCode && totals.discountAmt ? (
        <View style={styles.row}>
          <AppText variant="caption" color={colors.success}>
            Promo {promoCode}
          </AppText>
          <AppText variant="caption" color={colors.success}>
            -{formatCurrency(totals.discountAmt, { decimals: 2 })}
          </AppText>
        </View>
      ) : null}
      <Row label="Total Payment" value={formatCurrency(totals.total)} bold />
    </View>
  );
}

const styles = StyleSheet.create({
  rows: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
