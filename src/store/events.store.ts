import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { EVENTS, ORGANIZATIONS } from '@/data/mock';
import type { EventItem, Organization, TicketType } from '@/data/types';
import { zustandStorage } from '@/lib/storage';

export type EventFilters = {
  category: 'Events' | 'Organizations' | 'Users';
  location: string;
  date: string | null;
  priceMin: number;
  priceMax: number;
  distanceMin: number;
  distanceMax: number;
};

export const DEFAULT_FILTERS: EventFilters = {
  category: 'Events',
  location: 'Celina, Delaware',
  date: null,
  priceMin: 150,
  priceMax: 250,
  distanceMin: 25,
  distanceMax: 40,
};

type EventsState = {
  events: EventItem[];
  organizations: Organization[];
  favorites: string[];
  followedOrgs: string[];
  recentSearches: string[];
  filters: EventFilters;

  toggleFavorite: (eventId: string) => void;
  isFavorite: (eventId: string) => boolean;
  toggleFollowOrg: (orgId: string) => void;
  addRecentSearch: (userId: string) => void;
  setFilters: (f: Partial<EventFilters>) => void;
  resetFilters: () => void;

  // Organizer mutations
  upsertEvent: (event: EventItem) => void;
  deleteEvent: (id: string) => void;
  setEventStatus: (id: string, status: EventItem['status']) => void;
  upsertTicketType: (eventId: string, tt: TicketType) => void;
  removeTicketType: (eventId: string, ttId: string) => void;
  upsertOrganization: (org: Organization) => void;
  getEvent: (id: string) => EventItem | undefined;
  getOrganization: (id: string) => Organization | undefined;
};

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      events: EVENTS,
      organizations: ORGANIZATIONS,
      favorites: [],
      followedOrgs: [],
      recentSearches: ['u_talan', 'u_kesha', 'u_robert'],
      filters: DEFAULT_FILTERS,

      toggleFavorite: (eventId) =>
        set((s) => ({
          favorites: s.favorites.includes(eventId) ? s.favorites.filter((f) => f !== eventId) : [...s.favorites, eventId],
        })),
      isFavorite: (eventId) => get().favorites.includes(eventId),
      toggleFollowOrg: (orgId) =>
        set((s) => ({
          followedOrgs: s.followedOrgs.includes(orgId) ? s.followedOrgs.filter((f) => f !== orgId) : [...s.followedOrgs, orgId],
        })),
      addRecentSearch: (userId) =>
        set((s) => ({ recentSearches: [userId, ...s.recentSearches.filter((r) => r !== userId)].slice(0, 8) })),
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      upsertEvent: (event) =>
        set((s) => {
          const exists = s.events.some((e) => e.id === event.id);
          return { events: exists ? s.events.map((e) => (e.id === event.id ? event : e)) : [event, ...s.events] };
        }),
      deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
      setEventStatus: (id, status) => set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, status } : e)) })),
      upsertTicketType: (eventId, tt) =>
        set((s) => ({
          events: s.events.map((e) => {
            if (e.id !== eventId) return e;
            const exists = e.ticketTypes.some((t) => t.id === tt.id);
            return {
              ...e,
              ticketTypes: exists ? e.ticketTypes.map((t) => (t.id === tt.id ? tt : t)) : [...e.ticketTypes, tt],
            };
          }),
        })),
      removeTicketType: (eventId, ttId) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === eventId ? { ...e, ticketTypes: e.ticketTypes.filter((t) => t.id !== ttId) } : e)),
        })),
      upsertOrganization: (org) =>
        set((s) => {
          const exists = s.organizations.some((o) => o.id === org.id);
          return {
            organizations: exists ? s.organizations.map((o) => (o.id === org.id ? org : o)) : [org, ...s.organizations],
          };
        }),
      getEvent: (id) => get().events.find((e) => e.id === id),
      getOrganization: (id) => get().organizations.find((o) => o.id === id),
    }),
    {
      name: 'nest.events',
      storage: zustandStorage,
      // Only persist user-generated state; mock catalog always comes from code so updates ship.
      partialize: (s) => ({ favorites: s.favorites, followedOrgs: s.followedOrgs, recentSearches: s.recentSearches, filters: s.filters }),
    },
  ),
);
