import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Header, Icon, Input, Screen, Select, useToast } from '@/components/ui';
import { useMyEvents } from '@/features/organizer/hooks';
import { formatCurrency } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { TAX_RATE, useOrganizerStore } from '@/store';
import { colors, radius } from '@/theme';

import { parseMoney } from '../../utils';
import { PLATFORM_PAYMENT_METHODS, PaymentBrandIcon, PaymentMethodSheet } from '../components/PaymentMethodSheet';

const DURATIONS = ['1 Day', '3 Days', '7 Days', '14 Days', '30 Days'].map((d) => ({ value: d, label: d }));
const STARTS = [
  { value: 'Immediately', label: 'Immediately' },
  { value: 'Schedule', label: 'Schedule', description: 'Starts on the event publish date' },
];

/** Create Boost Event: event, duration, budget, start + order summary and payment. */
export function CreateBoostScreen() {
  const router = useRouter();
  const toast = useToast();
  const events = useMyEvents();
  const addBoost = useOrganizerStore((s) => s.addBoost);
  const eventOptions = useMemo(() => events.map((e) => ({ value: e.id, label: e.title })), [events]);

  const [eventId, setEventId] = useState<string | null>(null);
  const [duration, setDuration] = useState('3 Days');
  const [budget, setBudget] = useState('150');
  const [start, setStart] = useState('Immediately');
  const [paymentId, setPaymentId] = useState(PLATFORM_PAYMENT_METHODS[0]?.id ?? 'pm_card');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [errors, setErrors] = useState<{ event?: string; budget?: string }>({});

  const amount = parseMoney(budget);
  const days = parseInt(duration, 10) || 1;
  const tax = +(amount * TAX_RATE).toFixed(2);
  const total = +(amount + tax).toFixed(2);
  const payment = PLATFORM_PAYMENT_METHODS.find((m) => m.id === paymentId) ?? PLATFORM_PAYMENT_METHODS[0];

  const submit = () => {
    const next: typeof errors = {};
    if (!eventId) next.event = 'Select an event to boost';
    if (amount <= 0) next.budget = 'Enter a budget';
    setErrors(next);
    if (Object.keys(next).length || !eventId) {
      haptic.error();
      return;
    }
    addBoost({ eventId, duration, budget: amount, start });
    haptic.success();
    toast(`Boost payment of ${formatCurrency(total, { decimals: 2 })} confirmed`, 'success');
    router.back();
  };

  return (
    <Screen scroll keyboard footer={<Button title="Boost payment" variant="white" onPress={submit} />}>
      <Header title="Create Boost Event" />
      <Select label="Select Event" placeholder="Select event" options={eventOptions} value={eventId} onChange={setEventId} error={errors.event} />
      <Select label="Boost Duration" options={DURATIONS} value={duration} onChange={setDuration} />
      <Input
        label="Budget"
        placeholder="$150"
        value={budget}
        onChangeText={setBudget}
        keyboardType="decimal-pad"
        left={<AppText secondary>$</AppText>}
        error={errors.budget}
      />
      <Select label="Start" options={STARTS} value={start} onChange={setStart} />

      <View style={styles.summary}>
        <AppText variant="h2" style={styles.summaryTitle}>
          Order Summary
        </AppText>
        <Row label="Quantity" value={`${days}`} />
        <Row label="Tax fee" value={formatCurrency(tax, { decimals: 2 })} />
        <Row label="Ticket Price" value={formatCurrency(amount)} />
        <View style={[styles.row, styles.totalRow]}>
          <AppText variant="h2">Total Payment</AppText>
          <AppText variant="h1">{formatCurrency(total)}</AppText>
        </View>

        <AppText variant="h3" style={styles.paymentTitle}>
          Order Summary
        </AppText>
        <Pressable onPress={() => setPaymentOpen(true)} style={({ pressed }) => [styles.payment, pressed && styles.pressed]}>
          <View style={styles.payIcon}>{payment ? <PaymentBrandIcon brand={payment.brand} size={18} /> : null}</View>
          <View style={styles.flex}>
            <AppText variant="title">{payment?.label ?? 'Payment method'}</AppText>
            {payment?.last4 ? (
              <AppText variant="caption" secondary>
                **** **** **** {payment.last4}
              </AppText>
            ) : payment?.fee ? (
              <AppText variant="caption" secondary>
                {payment.fee}
              </AppText>
            ) : null}
          </View>
          <Icon name="chevron-down" size={18} color={colors.text} />
        </Pressable>
      </View>

      <PaymentMethodSheet visible={paymentOpen} onClose={() => setPaymentOpen(false)} value={paymentId} onChange={setPaymentId} />
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" secondary>
        {label}
      </AppText>
      <AppText variant="caption">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  summary: { backgroundColor: colors.bgElevated, borderRadius: radius.xxl, padding: 18, marginTop: 4, gap: 10 },
  summaryTitle: { marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalRow: { marginTop: 4 },
  paymentTitle: { marginTop: 10 },
  payment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    minHeight: 60,
  },
  payIcon: { width: 36, alignItems: 'center' },
});
