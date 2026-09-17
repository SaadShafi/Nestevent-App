import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, StyleSheet, View } from 'react-native';

import { Button, DateTimeField, Header, Input, Screen, Select, useToast } from '@/components/ui';
import type { TicketType } from '@/data/types';
import { useEvent } from '@/hooks/useEvent';
import { uid } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useEventsStore, useOrganizerStore } from '@/store';

import { parseMoney } from '../../utils';
import { dateToTimeLabel, timeLabelToDate } from '../../shared/utils';
import { WizardHeading } from '../../shared/WizardHeading';

const AGE_OPTIONS = [
  { value: 'None', label: 'None' },
  { value: '18+', label: '18+' },
  { value: '21+', label: '21+' },
];
const AREA_OPTIONS = [
  { value: 'General', label: 'General' },
  { value: 'VIP', label: 'VIP' },
  { value: 'Backstage', label: 'Backstage' },
  { value: 'Custom', label: 'Custom' },
];

type Step = 1 | 2;

/**
 * Add / Edit Ticket Type — two steps on one screen (details → access restrictions) with a quick
 * cross-fade. `?id` edits a draft ticket type; `?id&eventId` edits a live event's ticket type.
 */
export function TicketTypeFormScreen() {
  const router = useRouter();
  const toast = useToast();
  const { id, eventId } = useLocalSearchParams<{ id?: string; eventId?: string }>();
  const event = useEvent(eventId);
  const draftTypes = useOrganizerStore((s) => s.draft.ticketTypes);
  const setDraft = useOrganizerStore((s) => s.setDraft);
  const upsertTicketType = useEventsStore((s) => s.upsertTicketType);

  const source = eventId ? (event?.ticketTypes ?? []) : draftTypes;
  const existing = useMemo(() => source.find((t) => t.id === id), [source, id]);
  const isEdit = !!existing;

  const [step, setStep] = useState<Step>(1);
  const opacity = useRef(new Animated.Value(1)).current;

  const [name, setName] = useState(existing?.name ?? '');
  const [price, setPrice] = useState(existing ? `$${existing.price.toFixed(2)}` : '');
  const [quantity, setQuantity] = useState(existing ? String(existing.quantity) : '');
  const [startTime, setStartTime] = useState<Date | null>(timeLabelToDate(existing?.startTime));
  const [endTime, setEndTime] = useState<Date | null>(timeLabelToDate(existing?.endTime));
  const [minPerOrder, setMinPerOrder] = useState(existing ? String(existing.minPerOrder) : '1');
  const [maxPerOrder, setMaxPerOrder] = useState(existing ? String(existing.maxPerOrder) : '4');
  const [ageRestriction, setAgeRestriction] = useState(existing?.ageRestriction ?? 'None');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [accessArea, setAccessArea] = useState(existing?.accessArea ?? 'General');
  const [checkoutNote, setCheckoutNote] = useState(existing?.checkoutNote ?? '');
  const [errors, setErrors] = useState<{ name?: string; price?: string; quantity?: string; min?: string; max?: string }>({});

  const goTo = useCallback(
    (next: Step) => {
      Animated.timing(opacity, { toValue: 0, duration: 110, useNativeDriver: true }).start(() => {
        setStep(next);
        Animated.timing(opacity, { toValue: 1, duration: 170, useNativeDriver: true }).start();
      });
    },
    [opacity],
  );

  // Android hardware back on step 2 returns to step 1 instead of leaving the form.
  useEffect(() => {
    if (step !== 2) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goTo(1);
      return true;
    });
    return () => sub.remove();
  }, [step, goTo]);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Ticket name is required';
    const priceText = price.trim().replace(/^\$/, '');
    if (!priceText) e.price = 'Enter a price';
    else if (!/^\d+(\.\d{1,2})?$/.test(priceText)) e.price = 'Enter a valid amount (e.g. 35.00)';
    else if (parseMoney(price) < 0) e.price = 'Price cannot be negative';
    if (!/^\d+$/.test(quantity.trim())) e.quantity = 'Enter a whole number';
    else if (parseInt(quantity, 10) <= 0) e.quantity = 'Quantity must be greater than 0';
    const minValid = /^\d+$/.test(minPerOrder.trim());
    const maxValid = /^\d+$/.test(maxPerOrder.trim());
    const min = minValid ? parseInt(minPerOrder, 10) : 0;
    const max = maxValid ? parseInt(maxPerOrder, 10) : 0;
    if (!minValid || min < 1) e.min = 'Minimum is 1';
    if (!maxValid || max < 1) e.max = 'Maximum is at least 1';
    else if (min >= 1 && max < min) e.max = 'Max must be ≥ min';
    setErrors(e);
    if (Object.keys(e).length) {
      haptic.error();
      return false;
    }
    return true;
  };

  const continueToRestrictions = () => {
    if (!validate()) return;
    haptic.light();
    goTo(2);
  };

  const save = () => {
    if (!validate()) {
      goTo(1);
      return;
    }
    const tt: TicketType = {
      id: existing?.id ?? uid('tt'),
      name: name.trim(),
      price: parseMoney(price),
      quantity: parseInt(quantity, 10) || 0,
      sold: existing?.sold ?? 0,
      minPerOrder: parseInt(minPerOrder, 10) || 1,
      maxPerOrder: parseInt(maxPerOrder, 10) || 1,
      ageRestriction: ageRestriction === 'None' ? undefined : ageRestriction,
      description: description.trim() || undefined,
      accessArea,
      checkoutNote: checkoutNote.trim() || undefined,
      startTime: dateToTimeLabel(startTime),
      endTime: dateToTimeLabel(endTime),
      saleEnds: existing?.saleEnds,
      isGuestList: existing?.isGuestList,
      enabled: existing?.enabled ?? true,
    };
    if (eventId) {
      upsertTicketType(eventId, tt);
    } else {
      const exists = draftTypes.some((t) => t.id === tt.id);
      setDraft({ ticketTypes: exists ? draftTypes.map((t) => (t.id === tt.id ? tt : t)) : [...draftTypes, tt] });
    }
    haptic.success();
    toast(isEdit ? 'Ticket type updated' : 'Ticket type added', 'success');
    router.back();
  };

  const timeRow = (
    <View style={styles.row}>
      <DateTimeField label="Start Time" mode="time" value={startTime} onChange={setStartTime} containerStyle={styles.flex} />
      <DateTimeField label="End Time" mode="time" value={endTime} onChange={setEndTime} containerStyle={styles.flex} />
    </View>
  );
  const limitsRow = (
    <View style={styles.row}>
      <Input
        label="Minimum Per Order"
        placeholder="1"
        value={minPerOrder}
        onChangeText={setMinPerOrder}
        keyboardType="number-pad"
        error={errors.min}
        containerStyle={styles.flex}
      />
      <Input
        label="Maximum Per Order"
        placeholder="4"
        value={maxPerOrder}
        onChangeText={setMaxPerOrder}
        keyboardType="number-pad"
        error={errors.max}
        containerStyle={styles.flex}
      />
    </View>
  );

  return (
    <Screen
      scroll
      keyboard
      footer={<Button title="Save & Continue" variant="white" onPress={step === 1 ? continueToRestrictions : save} />}>
      {isEdit && step === 1 ? <Header title="Edit Ticket Type" /> : <Header left="back" onBack={step === 2 ? () => goTo(1) : undefined} />}

      <Animated.View style={{ opacity }}>
        {step === 1 ? (
          <>
            {!isEdit ? <WizardHeading title="Add Ticket Type" subtitle="Name, price, quantity and order limits." /> : null}
            <Input label="Ticket Name" placeholder="General" value={name} onChangeText={setName} error={errors.name} autoCapitalize="words" />
            <Input label="Price" placeholder="$35.00" value={price} onChangeText={setPrice} keyboardType="decimal-pad" error={errors.price} />
            <Input
              label="Quantity Available"
              placeholder="1000"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              error={errors.quantity}
            />
            {timeRow}
            {limitsRow}
          </>
        ) : (
          <>
            <WizardHeading title="Ticket Access Restrictions" subtitle="Who can buy this ticket and where it grants access." />
            <Select label="Age Restriction" options={AGE_OPTIONS} value={ageRestriction} onChange={setAgeRestriction} sheetTitle="Age Restriction" />
            <Input
              label="Ticket Description"
              placeholder="What's included with this ticket"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={1000}
            />
            <Select label="Access Area" options={AREA_OPTIONS} value={accessArea} onChange={setAccessArea} sheetTitle="Access Area" />
            <Input label="Notes Shown At Checkout" placeholder="Valid ID Required" value={checkoutNote} onChangeText={setCheckoutNote} />
            {timeRow}
            {limitsRow}
          </>
        )}
      </Animated.View>
    </Screen>
  );
}

export default TicketTypeFormScreen;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});
