import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CartLine, DeliveryAddress, PaymentMethod } from '@/data/types';
import { zustandStorage } from '@/lib/storage';

export const TAX_RATE = 0.0102; // matches "$2.55 tax on $250" in Figma

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm_card', brand: 'mastercard', label: 'Debit/Credit Card', last4: '1121' },
  { id: 'pm_paypal', brand: 'paypal', label: 'PayPal', fee: 'No Fee' },
  { id: 'pm_stripe', brand: 'stripe', label: 'Stripe', fee: 'No Fee' },
  { id: 'pm_apple', brand: 'applepay', label: 'Apple Pay', fee: 'No Fee' },
  { id: 'pm_google', brand: 'googlepay', label: 'Google Pay', fee: 'No Fee' },
  { id: 'pm_mc', brand: 'mastercard', label: 'Mastercard', fee: 'Charge %10' },
];

type CartState = {
  eventId: string | null;
  lines: CartLine[];
  promoCode: string | null;
  promoDiscount: number; // fraction, e.g. 0.1
  addresses: DeliveryAddress[];
  selectedAddressId: string | null;
  paymentMethodId: string;

  setEvent: (eventId: string) => void;
  setQty: (ticketTypeId: string, qty: number) => void;
  clear: () => void;
  applyPromo: (code: string) => boolean;
  addAddress: (a: DeliveryAddress) => void;
  updateAddress: (a: DeliveryAddress) => void;
  removeAddress: (id: string) => void;
  selectAddress: (id: string) => void;
  setPaymentMethod: (id: string) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      eventId: null,
      lines: [],
      promoCode: null,
      promoDiscount: 0,
      addresses: [],
      selectedAddressId: null,
      paymentMethodId: 'pm_card',

      setEvent: (eventId) => {
        if (get().eventId !== eventId) set({ eventId, lines: [], promoCode: null, promoDiscount: 0 });
      },
      setQty: (ticketTypeId, qty) =>
        set((s) => {
          const others = s.lines.filter((l) => l.ticketTypeId !== ticketTypeId);
          return { lines: qty > 0 ? [...others, { ticketTypeId, qty }] : others };
        }),
      clear: () => set({ eventId: null, lines: [], promoCode: null, promoDiscount: 0 }),
      applyPromo: (code) => {
        const c = code.trim().toUpperCase();
        if (c === 'NEST10') {
          set({ promoCode: c, promoDiscount: 0.1 });
          return true;
        }
        if (c === 'EARLY25') {
          set({ promoCode: c, promoDiscount: 0.25 });
          return true;
        }
        set({ promoCode: null, promoDiscount: 0 });
        return false;
      },
      addAddress: (a) =>
        set((s) => ({
          addresses: [...s.addresses.map((x) => (a.isDefault ? { ...x, isDefault: false } : x)), a],
          selectedAddressId: a.id,
        })),
      updateAddress: (a) =>
        set((s) => ({
          addresses: s.addresses.map((x) => (x.id === a.id ? a : a.isDefault ? { ...x, isDefault: false } : x)),
        })),
      removeAddress: (id) =>
        set((s) => ({
          addresses: s.addresses.filter((a) => a.id !== id),
          selectedAddressId: s.selectedAddressId === id ? null : s.selectedAddressId,
        })),
      selectAddress: (id) => set({ selectedAddressId: id }),
      setPaymentMethod: (id) => set({ paymentMethodId: id }),
    }),
    { name: 'nest.cart', storage: zustandStorage },
  ),
);

export function cartTotals(lines: CartLine[], priceOf: (ttId: string) => number, discount = 0) {
  const quantity = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.qty * priceOf(l.ticketTypeId), 0);
  const discountAmt = +(subtotal * discount).toFixed(2);
  const tax = +((subtotal - discountAmt) * TAX_RATE).toFixed(2);
  const total = +(subtotal - discountAmt + tax).toFixed(2);
  return { quantity, subtotal, discountAmt, tax, total };
}
