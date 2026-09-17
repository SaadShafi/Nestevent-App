import { IMG } from '@/data/images';
import type { EventItem, EventStatus, Organization } from '@/data/types';
import { DEFAULT_COORDS } from '@/lib/location';
import type { EventDraft } from '@/store';

import { combineDateTime } from '../shared/utils';

/**
 * Turn the Create Event wizard draft into a publishable `EventItem`.
 * `existing` (edit flow) preserves attendee / sales data the draft doesn't carry.
 */
export function buildEvent(draft: EventDraft, org: Organization | undefined, status: EventStatus, existing?: EventItem): EventItem {
  const cover = draft.flyer ?? draft.photos[0] ?? existing?.cover ?? IMG.flyerUrban;
  const priced = draft.ticketTypes.filter((t) => t.enabled && !t.isGuestList);
  const pool = priced.length ? priced : draft.ticketTypes;
  const priceFrom = pool.length ? Math.min(...pool.map((t) => t.price)) : 0;

  return {
    id: draft.id,
    title: draft.name.trim() || 'Untitled event',
    subtitle: org?.name ?? existing?.subtitle,
    category: existing?.category ?? 'Music',
    genre: existing?.genre ?? 'Rap',
    cover,
    gallery: draft.photos.length ? draft.photos : [cover],
    organizationId: draft.organizationId ?? org?.id ?? existing?.organizationId ?? '',
    description: draft.description.trim(),
    startDate: combineDateTime(draft.startDate, draft.startTime),
    endDate: combineDateTime(draft.endDate ?? draft.startDate, draft.endTime ?? draft.startTime),
    venueName: draft.venueName.trim(),
    address: draft.location.trim(),
    city: draft.city.trim(),
    country: draft.country.trim(),
    zipcode: draft.zipcode.trim() || undefined,
    coords: draft.coords ?? existing?.coords ?? DEFAULT_COORDS,
    priceFrom,
    attendees: existing?.attendees ?? 0,
    attendeeAvatars: existing?.attendeeAvatars ?? [],
    ticketTypes: draft.ticketTypes,
    visibility: draft.visibility,
    password: draft.visibility === 'password' ? draft.password : undefined,
    attendance: draft.attendance,
    showAttendeesPublic: draft.showAttendeesPublic,
    guestList: {
      enabled: draft.guestList.enabled,
      capacity: Number(draft.guestList.capacity) || 0,
      eligibility: draft.guestList.eligibility,
      contactCapture: draft.guestList.contactCapture,
      marketingConsent: draft.guestList.marketingConsent,
    },
    status,
    boosted: !!draft.boost || !!existing?.boosted,
    stats: existing?.stats ?? { revenue: 0, ticketsSold: 0, pageVisits: 0 },
  };
}
