import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Header, Icon, Input, Screen, Select, useToast } from '@/components/ui';
import { formatCurrency } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { TAX_RATE, useOrganizerStore } from '@/store';
import { colors, radius } from '@/theme';

import { PaymentBrandIcon, PaymentMethodSheet, PLATFORM_PAYMENT_METHODS } from '../../marketing/components/PaymentMethodSheet';
import { parseMoney } from '../../utils';
import { WizardHeading } from '../../shared/WizardHeading';

const DURATIONS = ['1 Day', '3 Days', '7 Days', '14 Days'].map((d) => ({ value: d, label: d }));
const STARTS = [
  { value: 'Immediately', label: 'Immediately' },
  { value: 'Schedule', label: 'Schedule' },
];

/** Boost Event — optional paid boosting step before Review. */
export function BoostStepScreen() {
  const router = useRouter();
  const toast = useToast();
  const draft = useOrganizerStore((s) => s.draft);
  const setDraft = useOrganizerStore((s) => s.setDraft);
  const addBoost = useOrganizerStore((s) => s.addBoost);

  const [duration, setDuration] = useState(draft.boost?.duration ?? '3 Days');
  const [budget, setBudget] = useState(draft.boost?.budget ?? '$150');
  const [start, setStart] = useState(draft.boost?.start ?? 'Immediately');
  const [paymentId, setPaymentId] = useState(PLATFORM_PAYMENT_METHODS[0]?.id ?? 'pm_card');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [budgetError, setBudgetError] = useState<string | undefined>();

  const payment = PLATFORM_PAYMENT_METHODS.find((m) => m.id === paymentId) ?? PLATFORM_PAYMENT_METHODS[0];

  const totals = useMemo(() => {
    const amount = parseMoney(budget);
    const days = parseInt(duration, 10) || 1;
    const tax = +(amount * TAX_RATE).toFixed(2);
    return { amount, days, tax, total: +(amount + tax).toFixed(2) };
  }, [budget, duration]);

  const pay = () => {
    const budgetText = budget.trim().replace(/^\$/, '');
    if (!budgetText || !/^\d+(\.\d{1,2})?$/.test(budgetText)) {
      haptic.error();
      setBudgetError('Enter a valid budget amount');
      return;
    }
    if (totals.amount <= 0) {
      haptic.error();
      setBudgetError('Budget must be greater than 0');
      return;
    }
    setBudgetError(undefined);
    const boost = { duration, budget: formatCurrency(totals.amount), start };
    setDraft({ boost });
    addBoost({ eventId: draft.id, duration, budget: totals.amount, start });
    haptic.success();
    toast(`Boost of ${formatCurrency(totals.total, { decimals: 2 })} scheduled`, 'success');
    router.push('/organizer/create-event/review');
  };

  const skip = () => {
    setDraft({ boost: null });
    router.push('/organizer/create-event/review');
  };

  return (
    <Screen
      scroll
      keyboard
      footer={
        <View style={styles.footer}>
          <Button title="Boost payment" variant="white" style={styles.flex} onPress={pay} />
          <Button title="Skip boost" style={styles.flex} onPress={skip} />
        </View>
      }>
      <Header left="back" />
      <WizardHeading title="Boost Event" subtitle="Paid event boosting." />

      <Select label="Boost Duration" options={DURATIONS} value={duration} onChange={setDuration} sheetTitle="Boost Duration" />
      <Input
        label="Budget"
        placeholder="$150"
        value={budget}
        onChangeText={(t) => {
          setBudget(t);
          if (budgetError) setBudgetError(undefined);
        }}
        keyboardType="decimal-pad"
        error={budgetError}
      />
      <Select label="Start" options={STARTS} value={start} onChange={setStart} sheetTitle="Start" />

      <View style={styles.summary}>
        <AppText variant="h3" style={styles.summaryTitle}>
          Order Summary
        </AppText>
        <SummaryRow label="Quantity" value={`${totals.days} ${totals.days === 1 ? 'day' : 'days'}`} />
        <SummaryRow label="Tax fee" value={formatCurrency(totals.tax, { decimals: 2 })} />
        <SummaryRow label="Ticket Price" value={formatCurrency(totals.amount, { decimals: 2 })} />
        <View style={styles.divider} />
        <SummaryRow label="Total Payment" value={formatCurrency(totals.total, { decimals: 2 })} bold />
      </View>

      <AppText variant="label" style={styles.paymentLabel}>
        Order Summary
      </AppText>
      <Pressable onPress={() => setPaymentOpen(true)} style={({ pressed }) => [styles.paymentRow, pressed && styles.pressed]}>
        <View style={styles.paymentIcon}>{payment ? <PaymentBrandIcon brand={payment.brand} size={18} /> : null}</View>
        <View style={styles.flex}>
          <AppText variant="title">{payment?.label ?? 'Payment method'}</AppText>
          <AppText variant="caption" secondary>
            {payment?.last4 ? `**** **** **** ${payment.last4}` : (payment?.fee ?? 'Select a payment method')}
          </AppText>
        </View>
        <Icon name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>

      <PaymentMethodSheet visible={paymentOpen} onClose={() => setPaymentOpen(false)} value={paymentId} onChange={setPaymentId} />
    </Screen>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <AppText variant={bold ? 'title' : 'body'} secondary={!bold}>
        {label}
      </AppText>
      <AppText variant={bold ? 'h3' : 'bodyMedium'}>{value}</AppText>
    </View>
  );
}

export default BoostStepScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  footer: { flexDirection: 'row', gap: 12 },
  summary: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderBottomLeftRadius: radius.md,
    borderBottomRightRadius: radius.md,
    padding: 18,
    marginTop: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  summaryTitle: { marginBottom: 10 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 7 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 6 },
  paymentLabel: { marginBottom: 10 },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    minHeight: 64,
    marginBottom: 16,
  },
  paymentIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.85 },
});
