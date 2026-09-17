import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

import type { EventItem } from '@/data/types';
import { shareContent } from '@/lib/share';

export const eventUrl = (id: string) => `https://nest.app/e/${id}`;

export function shareEvent(event: EventItem) {
  return shareContent({
    title: event.title,
    message: `${event.title} — ${event.venueName}, ${event.city}`,
    url: eventUrl(event.id),
  });
}

/**
 * Adds the event to the device calendar using the class-based expo-calendar API.
 * iOS → default calendar; Android → first calendar that allows modifications.
 * Returns an error message on failure (caller shows the toast).
 */
export async function addEventToCalendar(event: EventItem): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const { status } = await Calendar.requestCalendarPermissions();
    if (status !== 'granted') return { ok: false, reason: 'Calendar permission is required' };

    let calendar: Calendar.ExpoCalendar | undefined;
    if (Platform.OS === 'ios') {
      calendar = Calendar.getDefaultCalendarSync();
    } else {
      const all = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
      calendar = all.find((c) => c.allowsModifications && c.isPrimary) ?? all.find((c) => c.allowsModifications);
    }
    if (!calendar) return { ok: false, reason: 'No writable calendar found' };

    await calendar.createEvent({
      title: event.title,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      location: `${event.venueName}, ${event.address}`,
      notes: event.description,
      url: eventUrl(event.id),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : 'Could not add to calendar' };
  }
}
