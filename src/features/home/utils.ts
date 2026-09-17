import { useAuthStore } from '@/store';

export type TabName = 'home' | 'search' | 'social' | 'tickets' | 'profile' | 'events';

/**
 * Role-agnostic tab path. Home / Search / Tickets screens are shared by the guest and
 * organizer tab groups, so any "go to tab" navigation must resolve the right group.
 */
export function tabPath(tab: TabName): string {
  const role = useAuthStore.getState().role;
  const group = role === 'organizer' ? '(organizer)' : '(guest)';
  // The guest group has no "events" tab — fall back to home.
  const name = tab === 'events' && role !== 'organizer' ? 'home' : tab;
  return `/${group}/(tabs)/${name}`;
}
