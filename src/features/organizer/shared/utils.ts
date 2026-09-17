import { IMG, avatar } from '@/data/images';
import type { EventItem, EventStatus, Organization, TicketType } from '@/data/types';
import { uid } from '@/lib/format';
import { DEFAULT_COORDS } from '@/lib/location';
import type { EventDraft } from '@/store';

export const toDate = (iso: string | null | undefined): Date | null => (iso ? new Date(iso) : null);

/** Merge the calendar day of `dateIso` with the clock time of `timeIso` into one ISO string. */
export function combineDateTime(dateIso: string | null, timeIso: string | null): string {
  const d = dateIso ? new Date(dateIso) : new Date();
  if (timeIso) {
    const t = new Date(timeIso);
    d.setHours(t.getHours(), t.getMinutes(), 0, 0);
  }
  return d.toISOString();
}

/** "10:00 PM" → Date (today). Ticket types keep times as display labels. */
export function timeLabelToDate(label?: string | null): Date | null {
  if (!label) return null;
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(label.trim());
  if (!m) return null;
  let h = parseInt(m[1] ?? '0', 10);
  const min = parseInt(m[2] ?? '0', 10);
  const ampm = (m[3] ?? '').toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  const d = new Date();
  d.setHours(h, min, 0, 0);
  return d;
}

/** Date → "10:00 PM" (matches mock ticket-type time labels). */
export function dateToTimeLabel(d: Date | null): string | undefined {
  if (!d) return undefined;
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`;
}

/** "$35 · Qty 1,000 · Max 4 · 21+" / "$25 · Qty 300 · Sale ends Aug 15" */
export function ticketSummary(tt: TicketType, opts: { qty?: boolean } = {}) {
  const parts = [`$${tt.price}`];
  if (opts.qty !== false) parts.push(`Qty ${tt.quantity.toLocaleString('en-US')}`);
  if (tt.saleEnds) parts.push(`Sale ends ${tt.saleEnds}`);
  else parts.push(`Max ${tt.maxPerOrder}`);
  if (tt.ageRestriction && tt.ageRestriction !== 'None') parts.push(tt.ageRestriction);
  return parts.join(' · ');
}

/** Stable pseudo order number "#NG2248219" derived from the order id. */
export function orderNumber(id: string, dash = false) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const digits = String(1000000 + (h % 9000000));
  return dash ? `#NG-${digits.slice(2)}` : `#NG${digits}`;
}

/** Seed ticket types for the wizard hub (matches the Figma "Ticket configuration hub"). */
export function defaultTicketTypes(): TicketType[] {
  return [
    { id: uid('tt'), name: 'General', price: 35, quantity: 300, sold: 0, minPerOrder: 1, maxPerOrder: 4, enabled: true, startTime: '10:00 PM', endTime: '4:00 AM', accessArea: 'General' },
    { id: uid('tt'), name: 'VIP', price: 85, quantity: 300, sold: 0, minPerOrder: 1, maxPerOrder: 2, ageRestriction: '21+', enabled: true, startTime: '10:00 PM', endTime: '4:00 AM', accessArea: 'VIP' },
    { id: uid('tt'), name: 'Guest List', price: 25, quantity: 300, sold: 0, minPerOrder: 1, maxPerOrder: 4, saleEnds: 'Aug 15', isGuestList: true, enabled: false },
  ];
}

export const GUEST_AVATARS = [avatar(5), avatar(9), avatar(16), avatar(25)];

/** Build a publishable EventItem out of the wizard draft. */
export function draftToEvent(draft: EventDraft, org: Organization | undefined, status: EventStatus, existing?: EventItem): EventItem {
  const enabled = draft.ticketTypes.filter((t) => t.enabled && !t.isGuestList);
  const priced = enabled.length ? enabled : draft.ticketTypes;
  const priceFrom = priced.length ? Math.min(...priced.map((t) => t.price)) : 0;
  const cover = draft.flyer ?? draft.photos[0] ?? existing?.cover ?? IMG.flyerUrban;
  return {
    id: draft.id,
    title: draft.name.trim() || 'Untitled event',
    subtitle: existing?.subtitle ?? org?.name,
    category: existing?.category ?? org?.category ?? 'Music',
    genre: existing?.genre ?? org?.category,
    cover,
    gallery: draft.photos.length ? draft.photos : [cover],
    organizationId: draft.organizationId ?? org?.id ?? '',
    description: draft.description,
    startDate: combineDateTime(draft.startDate, draft.startTime),
    endDate: combineDateTime(draft.endDate ?? draft.startDate, draft.endTime ?? draft.startTime),
    venueName: draft.venueName,
    address: draft.location,
    city: draft.city,
    country: draft.country,
    zipcode: draft.zipcode || undefined,
    coords: draft.coords ?? existing?.coords ?? DEFAULT_COORDS,
    priceFrom,
    attendees: existing?.attendees ?? 0,
    attendeeAvatars: existing?.attendeeAvatars ?? [],
    ticketTypes: draft.ticketTypes,
    visibility: draft.visibility,
    password: draft.visibility === 'password' ? draft.password : undefined,
    attendance: draft.attendance,
    showAttendeesPublic: draft.showAttendeesPublic,
    guestList: { ...draft.guestList, capacity: parseInt(draft.guestList.capacity, 10) || 0 },
    status,
    boosted: existing?.boosted || !!draft.boost,
    stats: existing?.stats,
  };
}
