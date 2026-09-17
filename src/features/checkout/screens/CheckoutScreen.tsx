import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventRow } from '@/components/EventCard';
import { AppText, BottomSheet, Button, Card, EmptyState, Header, Icon, IconButton, Screen, useToast } from '@/components/ui';
import { useEvent } from '@/hooks/useEvent';
import { formatCurrency, maskCard } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { PAYMENT_METHODS, cartTotals, useAuthStore, useCartStore, useTicketsStore } from '@/store';
import { colors, fonts, layout, radius } from '@/theme';

import { AddressCard } from '../components/AddressCard';
import { OrderSummaryRows } from '../components/OrderSummary';
import { PaymentBrand } from '../components/PaymentBrand';

const METHODS = PAYMENT_METHODS.filter((m) => {
  if (m.brand === 'applepay') return Platform.OS === 'ios';
  if (m.brand === 'googlepay') return Platform.OS === 'android';
  return true;
});

/** Modal route: own SafeAreaProvider so the header clears the status bar when presented full-screen (see CartScreen). */
export function CheckoutScreen() {
  return (
    <SafeAreaProvider>
      <CheckoutBody />
    </SafeAreaProvider>
  );
}

function CheckoutBody() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = useEvent(id);
  const user = useAuthStore((s) => s.user);

  const lines = useCartStore((s) => s.lines);
  const promoCode = useCartStore((s) => s.promoCode);
  const promoDiscount = useCartStore((s) => s.promoDiscount);
  const addresses = useCartStore((s) => s.addresses);
  const selectedAddressId = useCartStore((s) => s.selectedAddressId);
  const paymentMethodId = useCartStore((s) => s.paymentMethodId);
  const applyPromo = useCartStore((s) => s.applyPromo);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);
  const clearCart = useCartStore((s) => s.clear);
  const purchase = useTicketsStore((s) => s.purchase);

  const [promo, setPromo] = useState(promoCode ?? '');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const [placing, setPlacing] = useState(false);

  const address = addresses.find((a) => a.id === selectedAddressId) ?? addresses.find((a) => a.isDefault) ?? addresses[0];
  const method = PAYMENT_METHODS.find((m) => m.id === paymentMethodId) ?? PAYMENT_METHODS[0];

  const priceOf = useMemo(() => {
    const map = new Map(event?.ticketTypes.map((t) => [t.id, t.price]) ?? []);
    return (ttId: string) => map.get(ttId) ?? 0;
  }, [event]);
  const totals = useMemo(() => cartTotals(lines, priceOf, promoDiscount), [lines, priceOf, promoDiscount]);
  const perPerson = totals.quantity > 0 ? totals.total / totals.quantity : 0;

  if (!event) {
    return (
      <Screen>
        <Header title="Checkout" left="close" />
        <EmptyState icon="cart-outline" title="Event not found" />
      </Screen>
    );
  }

  const onApplyPromo = () => {
    if (!promo.trim()) {
      setPromoError('Enter a promo code');
      haptic.error();
      return;
    }
    const ok = applyPromo(promo);
    if (ok) {
      setPromoError(null);
      haptic.success();
      toast(`Promo ${promo.trim().toUpperCase()} applied`, 'success');
    } else {
      setPromoError('Invalid promo code');
      haptic.error();
    }
  };

  const onRemove = () => {
    haptic.light();
    clearCart();
    if (router.canGoBack()) router.back();
    else router.replace(`/event/${event.id}`);
  };

  const onPlaceOrder = () => {
    if (totals.quantity === 0 || placing) return;
    setPlacing(true);
    haptic.medium();
    purchase({
      eventId: event.id,
      lines: lines.map((l) => {
        const tt = event.ticketTypes.find((t) => t.id === l.ticketTypeId);
        return { ticketTypeId: l.ticketTypeId, ticketTypeName: tt?.name ?? 'Ticket', qty: l.qty, price: tt?.price ?? 0 };
      }),
      holderName: user.displayName,
      holderAvatar: user.avatar,
      total: totals.total,
      tax: totals.tax,
    });
    clearCart();
    haptic.success();
    toast('Order placed — tickets are in My Tickets', 'success');
    router.replace(`/event/${event.id}/ticket-order`);
  };

  return (
    <Screen padded={false} edges={['top']} keyboard>
      <View style={styles.headerWrap}>
        <Header title="Checkout" left="close" />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 130 + insets.bottom }}>
        <View style={styles.padded}>
          <AppText variant="label" style={styles.label}>
            Delivery Address
          </AppText>
          <Pressable
            onPress={() => {
              haptic.light();
              router.push('/delivery-address');
            }}
            style={({ pressed }) => [styles.addRow, pressed && styles.pressed]}>
            <AppText variant="body" secondary style={styles.flex}>
              Add Delivery Address
            </AppText>
            <View style={styles.plus}>
              <Icon name="add" size={18} color={colors.white} />
            </View>
          </Pressable>
          {address ? <AddressCard address={address} onEdit={() => router.push(`/delivery-address?id=${address.id}`)} /> : null}

          <AppText variant="label" style={styles.label}>
            Order Details
          </AppText>
          <EventRow
            event={{ ...event, priceFrom: totals.subtotal }}
            right={<IconButton name="trash-outline" size={36} iconSize={18} color={colors.danger} backgroundColor="transparent" onPress={onRemove} accessibilityLabel="Remove from cart" />}
          />
        </View>

        <View style={styles.summary}>
          <AppText variant="h2" style={styles.summaryTitle}>
            Order Summary
          </AppText>
          <OrderSummaryRows totals={totals} promoCode={promoCode} />

          <View style={[styles.promo, promoError ? styles.promoError : null]}>
            <TextInput
              value={promo}
              onChangeText={(t) => {
                setPromo(t);
                if (promoError) setPromoError(null);
              }}
              placeholder="Apply Promo Code"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={onApplyPromo}
              style={styles.promoInput}
            />
            <Button title="Apply" size="sm" fullWidth={false} onPress={onApplyPromo} style={styles.promoBtn} />
          </View>
          {promoError ? (
            <AppText variant="caption" color={colors.danger} style={styles.promoErrorText}>
              {promoError}
            </AppText>
          ) : null}

          <AppText variant="h3" style={styles.paymentLabel}>
            Payment Method
          </AppText>
          <Card onPress={() => setSheet(true)} style={styles.payment} padding={14}>
            <View style={styles.brand}>
              <PaymentBrand brand={method.brand} />
            </View>
            <View style={styles.flex}>
              <AppText variant="title">{method.label}</AppText>
              <AppText variant="caption" secondary>
                {method.last4 ? maskCard(method.last4) : method.fee ?? ''}
              </AppText>
            </View>
            <Icon name="chevron-down" size={18} color={colors.text} />
          </Card>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.flex}>
          <AppText variant="caption" secondary>
            Price
          </AppText>
          <View style={styles.priceRow}>
            <AppText variant="h1">{formatCurrency(perPerson, { decimals: 2 }).replace('$', '$ ')}</AppText>
            <AppText variant="caption" secondary>
              /Person
            </AppText>
          </View>
        </View>
        <Button
          title="Place Order"
          fullWidth={false}
          disabled={totals.quantity === 0}
          loading={placing}
          onPress={onPlaceOrder}
          style={styles.cta}
        />
      </View>

      <BottomSheet visible={sheet} onClose={() => setSheet(false)} title="Select Card" scroll>
        {METHODS.map((m) => {
          const active = m.id === paymentMethodId;
          return (
            <Pressable
              key={m.id}
              onPress={() => {
                haptic.selection();
                setPaymentMethod(m.id);
                setSheet(false);
              }}
              style={[styles.methodRow, active && styles.methodActive]}>
              <View style={styles.brand}>
                <PaymentBrand brand={m.brand} size={26} />
              </View>
              <View style={styles.flex}>
                <AppText variant="title">{m.label}</AppText>
                <AppText variant="caption" secondary>
                  {m.last4 ? maskCard(m.last4) : m.fee ?? ''}
                </AppText>
              </View>
              {active ? <Icon name="checkmark-circle" size={20} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.8 },
  headerWrap: { paddingHorizontal: layout.screenPadding, paddingTop: 8 },
  padded: { paddingHorizontal: layout.screenPadding },
  label: { marginBottom: 10, marginTop: 4 },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingLeft: 18,
    paddingRight: 8,
    height: 54,
    marginBottom: 16,
  },
  plus: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  summary: {
    marginTop: 24,
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 22,
    paddingBottom: 24,
  },
  summaryTitle: { marginBottom: 12 },
  promo: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingLeft: 18,
    paddingRight: 6,
    height: 54,
    gap: 8,
  },
  promoError: { borderWidth: 1, borderColor: colors.danger },
  promoErrorText: { marginTop: 6, marginLeft: 6 },
  promoInput: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 14, height: '100%' },
  promoBtn: { height: 42, paddingHorizontal: 22 },
  paymentLabel: { marginTop: 20, marginBottom: 10 },
  payment: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bg },
  brand: { width: 40, alignItems: 'center', justifyContent: 'center' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 12,
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  cta: { paddingHorizontal: 32 },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  methodActive: { borderColor: colors.primary },
});
