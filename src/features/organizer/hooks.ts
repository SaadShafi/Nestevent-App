import { useShallow } from 'zustand/react/shallow';

import { useEventsStore } from '@/store';

/**
 * Organizer-side store selectors.
 *
 * These return *derived arrays*; with zustand v5 (useSyncExternalStore) a selector that
 * builds a new array on every call causes "Maximum update depth exceeded". `useShallow`
 * keeps the previous result while the members are the same, so screens stay stable.
 */

/** Organizations owned by the current (organizer) user. */
export function useMyOrganizations() {
  return useEventsStore(useShallow((s) => s.organizations.filter((o) => o.ownerId === 'me')));
}

/** Events belonging to the organizer's organizations. */
export function useMyEvents() {
  return useEventsStore(
    useShallow((s) => {
      const mine = new Set(s.organizations.filter((o) => o.ownerId === 'me').map((o) => o.id));
      return s.events.filter((e) => mine.has(e.organizationId));
    }),
  );
}
