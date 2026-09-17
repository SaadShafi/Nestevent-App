import { useMemo } from 'react';

import { useEventsStore } from '@/store';

export function useEvent(id: string | undefined) {
  return useEventsStore((s) => s.events.find((e) => e.id === id));
}

export function useOrganization(id: string | undefined) {
  return useEventsStore((s) => s.organizations.find((o) => o.id === id));
}

/**
 * Organizations owned by the current (organizer) user.
 * Derived with useMemo (not inside the selector): a selector that returns a fresh array every call makes
 * zustand's useSyncExternalStore re-render forever ("getSnapshot should be cached").
 */
export function useMyOrganizations() {
  const organizations = useEventsStore((s) => s.organizations);
  return useMemo(() => organizations.filter((o) => o.ownerId === 'me'), [organizations]);
}

/** Events belonging to the organizer's organizations. */
export function useMyEvents() {
  const organizations = useEventsStore((s) => s.organizations);
  const events = useEventsStore((s) => s.events);
  return useMemo(() => {
    const mine = new Set(organizations.filter((o) => o.ownerId === 'me').map((o) => o.id));
    return events.filter((e) => mine.has(e.organizationId));
  }, [organizations, events]);
}
