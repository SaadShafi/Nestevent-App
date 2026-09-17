import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { Button, DateTimeField, Header, Input, Screen, Select, useToast } from '@/components/ui';
import type { PromoCode } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { useOrganizerStore } from '@/store';

type DiscountType = PromoCode['discountType'];
type AppliesTo = 'all' | 'selected';

const DISCOUNT_TYPES: { value: DiscountType; label: string }[] = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed' },
];
const APPLIES_TO: { value: AppliesTo; label: string }[] = [
  { value: 'all', label: 'All tickets' },
  { value: 'selected', label: 'Selected ticket types' },
];

const appliesValue = (label: string): AppliesTo => (label === 'All tickets' ? 'all' : 'selected');
const appliesLabel = (v: AppliesTo) => (v === 'all' ? 'All tickets' : 'Selected ticket types');

/** Create / edit (?id=) a promo code. */
export function CreatePromoCodeScreen() {
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useOrganizerStore((s) => s.promoCodes.find((p) => p.id === id));
  const addPromo = useOrganizerStore((s) => s.addPromo);
  const updatePromo = useOrganizerStore((s) => s.updatePromo);

  const [code, setCode] = useState(existing?.code ?? '');
  const [discountType, setDiscountType] = useState<DiscountType>(existing?.discountType ?? 'percentage');
  const [value, setValue] = useState(existing ? String(existing.value) : '');
  const [appliesTo, setAppliesTo] = useState<AppliesTo>(existing ? appliesValue(existing.appliesTo) : 'all');
  const [usageLimit, setUsageLimit] = useState(existing ? String(existing.usageLimit) : '');
  const [perUserLimit, setPerUserLimit] = useState(existing ? String(existing.perUserLimit) : '');
  const [starts, setStarts] = useState<Date | null>(existing ? new Date(existing.starts) : null);
  const [expires, setExpires] = useState<Date | null>(existing ? new Date(existing.expires) : null);
  const [errors, setErrors] = useState<{ code?: string; value?: string; usageLimit?: string; perUserLimit?: string; starts?: string; expires?: string }>({});
  const clearError = (key: keyof typeof errors) => setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));

  const submit = () => {
    const next: typeof errors = {};
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) next.code = 'Enter a promo code';
    else if (!/^[A-Z0-9_-]{3,20}$/.test(cleanCode)) next.code = 'Use 3–20 letters or numbers';
    const num = parseFloat(value);
    if (!value.trim() || !/^\d+(\.\d{1,2})?$/.test(value.trim())) next.value = 'Enter a numeric discount value';
    else if (num <= 0) next.value = 'Discount must be greater than 0';
    else if (discountType === 'percentage' && num > 100) next.value = 'Percentage cannot exceed 100%';
    if (!/^\d+$/.test(usageLimit.trim()) || parseInt(usageLimit, 10) < 1) next.usageLimit = 'Enter a whole number of 1 or more';
    if (!/^\d+$/.test(perUserLimit.trim()) || parseInt(perUserLimit, 10) < 1) next.perUserLimit = 'Enter a whole number of 1 or more';
    if (!starts) next.starts = 'Pick a start date';
    if (!expires) next.expires = 'Pick an expiry date';
    if (starts && expires && expires.getTime() <= starts.getTime()) next.expires = 'Expiry must be after the start date';
    setErrors(next);
    if (Object.keys(next).length || !starts || !expires) {
      haptic.error();
      return;
    }
    const base = {
      code: cleanCode,
      discountType,
      value: num,
      appliesTo: appliesLabel(appliesTo),
      eligible: appliesTo === 'all' ? 'All tickets' : (existing?.eligible ?? 'GA · VIP'),
      usageLimit: parseInt(usageLimit, 10),
      perUserLimit: parseInt(perUserLimit, 10),
      starts: starts.toISOString(),
      expires: expires.toISOString(),
    };
    haptic.success();
    if (existing) {
      updatePromo({ ...existing, ...base });
      toast('Promo code updated', 'success');
      router.back();
      return;
    }
    const promo = addPromo({ ...base, eventId: undefined });
    toast('Promo code created', 'success');
    router.replace(`/organizer/marketing/promo-codes/${promo.id}`);
  };

  return (
    <Screen scroll keyboard footer={<Button title={existing ? 'Save changes' : 'Create promo'} variant="white" onPress={submit} />}>
      <Header title={existing ? 'Edit Promo Code' : 'Create Promo Code'} />
      <Input
        outlined
        label="Code"
        placeholder="NEST10"
        value={code}
        onChangeText={(t) => {
          setCode(t.toUpperCase());
          clearError('code');
        }}
        autoCapitalize="characters"
        autoCorrect={false}
        error={errors.code}
      />
      <Select
        outlined
        label="Discount type"
        placeholder="Percentage / Fixed"
        options={DISCOUNT_TYPES}
        value={discountType}
        onChange={(v) => {
          setDiscountType(v);
          clearError('value');
        }}
      />
      <Input
        outlined
        label="Discount value"
        placeholder={discountType === 'percentage' ? '10%' : '$25'}
        value={value}
        onChangeText={(t) => {
          setValue(t);
          clearError('value');
        }}
        keyboardType="decimal-pad"
        error={errors.value}
      />
      <Select outlined label="Applies to" placeholder="All tickets / Selected ticket types" options={APPLIES_TO} value={appliesTo} onChange={setAppliesTo} />
      <Input
        outlined
        label="Usage limit"
        placeholder="500"
        value={usageLimit}
        onChangeText={(t) => {
          setUsageLimit(t);
          clearError('usageLimit');
        }}
        keyboardType="number-pad"
        error={errors.usageLimit}
      />
      <Input
        outlined
        label="Per-user limit"
        placeholder="1"
        value={perUserLimit}
        onChangeText={(t) => {
          setPerUserLimit(t);
          clearError('perUserLimit');
        }}
        keyboardType="number-pad"
        error={errors.perUserLimit}
      />
      <DateTimeField
        outlined
        label="Starts"
        placeholder="Aug 1"
        value={starts}
        onChange={(d) => {
          setStarts(d);
          clearError('starts');
          clearError('expires');
        }}
        error={errors.starts}
      />
      <DateTimeField
        outlined
        label="Expires"
        placeholder="Aug 29"
        value={expires}
        onChange={(d) => {
          setExpires(d);
          clearError('expires');
        }}
        minimumDate={starts ?? undefined}
        error={errors.expires}
      />
    </Screen>
  );
}
