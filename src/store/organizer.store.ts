import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { BANK_ACCOUNTS, BOOSTS, PROMO_CODES, SMS_BLASTS, TEAM, TRACKING_LINKS, TRANSACTIONS } from '@/data/mock';
import type { BankAccount, Boost, PromoCode, SmsBlast, TeamMember, TrackingLink, Transaction } from '@/data/types';
import { uid } from '@/lib/format';
import { zustandStorage } from '@/lib/storage';

/** Draft used by the multi-step Create Event wizard. */
export type EventDraft = {
  id: string;
  photos: string[];
  name: string;
  organizationId: string | null;
  description: string;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  venueName: string;
  location: string;
  coords: { latitude: number; longitude: number } | null;
  country: string;
  city: string;
  zipcode: string;
  flyer: string | null;
  flyerMode: 'upload' | 'ai' | null;
  visibility: 'public' | 'private' | 'invite' | 'password';
  password: string;
  attendance: 'ticketed' | 'rsvp';
  ticketTypes: import('@/data/types').TicketType[];
  guestList: { enabled: boolean; capacity: string; eligibility: string; contactCapture: string; marketingConsent: string };
  boost: { duration: string; budget: string; start: string } | null;
  showAttendeesPublic: boolean;
};

export const emptyDraft = (): EventDraft => ({
  id: uid('ev'),
  photos: [],
  name: '',
  organizationId: null,
  description: '',
  startDate: null,
  endDate: null,
  startTime: null,
  endTime: null,
  venueName: '',
  location: '',
  coords: null,
  country: '',
  city: '',
  zipcode: '',
  flyer: null,
  flyerMode: null,
  visibility: 'public',
  password: '',
  attendance: 'ticketed',
  ticketTypes: [],
  guestList: {
    enabled: true,
    capacity: '75',
    eligibility: 'Complete Public Profile + Profile Picture',
    contactCapture: 'Email + Phone',
    marketingConsent: 'Explicit Opt-In Required',
  },
  boost: null,
  showAttendeesPublic: true,
});

type OrganizerState = {
  team: TeamMember[];
  promoCodes: PromoCode[];
  trackingLinks: TrackingLink[];
  smsBlasts: SmsBlast[];
  boosts: Boost[];
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  walletBalance: number;
  draft: EventDraft;

  setDraft: (patch: Partial<EventDraft>) => void;
  resetDraft: () => void;
  loadDraftFromEvent: (event: import('@/data/types').EventItem) => void;

  addTeamMember: (m: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (m: TeamMember) => void;
  removeTeamMember: (id: string) => void;

  addPromo: (p: Omit<PromoCode, 'id' | 'uses' | 'revenue' | 'discounts' | 'conversion' | 'active'>) => PromoCode;
  togglePromo: (id: string) => void;
  updatePromo: (p: PromoCode) => void;

  addTrackingLink: (l: Omit<TrackingLink, 'id' | 'url' | 'createdAt' | 'clicks' | 'sales' | 'revenue' | 'conversion'>) => TrackingLink;

  addSmsBlast: (b: Omit<SmsBlast, 'id' | 'sentAt' | 'status'>) => void;
  addBoost: (b: Omit<Boost, 'id' | 'createdAt' | 'status'>) => void;

  addBankAccount: (holder: string, number: string, extra?: { bankName?: string; routing?: string; isDefault?: boolean }) => void;
  removeBankAccount: (id: string) => void;
  removeTrackingLink: (id: string) => void;
  setDefaultBank: (id: string) => void;
  requestDeposit: (amount: number) => void;
  withdraw: (amount: number) => void;
};

export const useOrganizerStore = create<OrganizerState>()(
  persist(
    (set) => ({
      team: TEAM,
      promoCodes: PROMO_CODES,
      trackingLinks: TRACKING_LINKS,
      smsBlasts: SMS_BLASTS,
      boosts: BOOSTS,
      bankAccounts: BANK_ACCOUNTS,
      transactions: TRANSACTIONS,
      walletBalance: 24554.96,
      draft: emptyDraft(),

      setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      resetDraft: () => set({ draft: emptyDraft() }),
      loadDraftFromEvent: (e) =>
        set({
          draft: {
            ...emptyDraft(),
            id: e.id,
            photos: e.gallery,
            name: e.title,
            organizationId: e.organizationId,
            description: e.description,
            startDate: e.startDate,
            endDate: e.endDate,
            startTime: e.startDate,
            endTime: e.endDate,
            venueName: e.venueName,
            location: e.address,
            coords: e.coords,
            country: e.country,
            city: e.city,
            zipcode: e.zipcode ?? '',
            flyer: e.cover,
            flyerMode: 'upload',
            visibility: e.visibility,
            password: e.password ?? '',
            attendance: e.attendance,
            ticketTypes: e.ticketTypes,
            guestList: { ...e.guestList, capacity: String(e.guestList.capacity) },
            showAttendeesPublic: e.showAttendeesPublic,
          },
        }),

      addTeamMember: (m) => set((s) => ({ team: [...s.team, { ...m, id: uid('tm') }] })),
      updateTeamMember: (m) => set((s) => ({ team: s.team.map((t) => (t.id === m.id ? m : t)) })),
      removeTeamMember: (id) => set((s) => ({ team: s.team.filter((t) => t.id !== id) })),

      addPromo: (p) => {
        const promo: PromoCode = { ...p, id: uid('pc'), uses: 0, revenue: 0, discounts: 0, conversion: 0, active: true };
        set((s) => ({ promoCodes: [promo, ...s.promoCodes] }));
        return promo;
      },
      togglePromo: (id) => set((s) => ({ promoCodes: s.promoCodes.map((p) => (p.id === id ? { ...p, active: !p.active } : p)) })),
      updatePromo: (p) => set((s) => ({ promoCodes: s.promoCodes.map((x) => (x.id === p.id ? p : x)) })),

      addTrackingLink: (l) => {
        const slug = l.campaign.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const link: TrackingLink = {
          ...l,
          id: uid('tl'),
          url: `nest.app/e/${l.eventId.replace('ev_', '')}?ref=${slug}`,
          createdAt: new Date().toISOString(),
          clicks: 0,
          sales: 0,
          revenue: 0,
          conversion: 0,
        };
        set((s) => ({ trackingLinks: [link, ...s.trackingLinks] }));
        return link;
      },

      addSmsBlast: (b) =>
        set((s) => ({ smsBlasts: [{ ...b, id: uid('s'), sentAt: new Date().toISOString(), status: 'active' }, ...s.smsBlasts] })),
      addBoost: (b) =>
        set((s) => ({ boosts: [{ ...b, id: uid('b'), createdAt: new Date().toISOString(), status: 'active' }, ...s.boosts] })),

      addBankAccount: (holder, number, extra) =>
        set((s) => {
          const makeDefault = extra?.isDefault ?? s.bankAccounts.length === 0;
          return {
            bankAccounts: [
              ...s.bankAccounts.map((b) => (makeDefault ? { ...b, isDefault: false } : b)),
              { id: uid('ba'), holder, number, bankName: extra?.bankName, routing: extra?.routing, isDefault: makeDefault },
            ],
          };
        }),
      removeBankAccount: (id) =>
        set((s) => {
          const rest = s.bankAccounts.filter((b) => b.id !== id);
          if (rest.length && !rest.some((b) => b.isDefault)) rest[0] = { ...rest[0], isDefault: true };
          return { bankAccounts: rest };
        }),
      removeTrackingLink: (id) => set((s) => ({ trackingLinks: s.trackingLinks.filter((l) => l.id !== id) })),
      setDefaultBank: (id) => set((s) => ({ bankAccounts: s.bankAccounts.map((b) => ({ ...b, isDefault: b.id === id })) })),
      requestDeposit: (amount) =>
        set((s) => ({
          transactions: [
            { id: uid('t'), name: 'Deposit request', avatar: s.bankAccounts[0]?.holder ? '' : '', role: 'Wallet', amount, at: new Date().toISOString(), status: 'pending' },
            ...s.transactions,
          ],
        })),
      withdraw: (amount) =>
        set((s) => ({
          walletBalance: +(s.walletBalance - amount).toFixed(2),
          transactions: [
            { id: uid('t'), name: 'Withdrawal', avatar: '', role: 'Bank transfer', amount: -amount, at: new Date().toISOString(), status: 'pending' },
            ...s.transactions,
          ],
        })),
    }),
    { name: 'nest.organizer', storage: zustandStorage },
  ),
);
