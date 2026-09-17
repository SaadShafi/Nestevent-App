import type { Order, Ticket } from '@/data/types';

import { shortTime } from '../utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Aug 30, 7:30 AM" — scan / order timestamps. */
export function scanStamp(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${shortTime(d)}`;
}

/** Total tickets in an order. */
export function orderQty(order: Order) {
  return order.lines.reduce((n, l) => n + l.qty, 0);
}

/** Sold tickets that belong to an order (by id, falling back to buyer name). */
export function ticketsForOrder(order: Order, sold: Ticket[]) {
  const byId = sold.filter((t) => t.orderId === order.id || order.ticketIds.includes(t.id));
  if (byId.length) return byId;
  return sold.filter((t) => t.eventId === order.eventId && t.holderName === order.buyerName);
}

/** All tickets one holder owns for an event (organizer-side scan sheet). */
export function ticketsForHolder(holderName: string, eventId: string, ...pools: Ticket[][]) {
  const seen = new Set<string>();
  const out: Ticket[] = [];
  pools.flat().forEach((t) => {
    if (t.eventId !== eventId || t.holderName !== holderName || seen.has(t.id)) return;
    seen.add(t.id);
    out.push(t);
  });
  return out;
}

/** Whether any ticket of an order has been scanned at the door. */
export function latestScan(tickets: Ticket[]) {
  const scanned = tickets.filter((t) => t.scanned && t.scannedAt).sort((a, b) => (a.scannedAt! < b.scannedAt! ? 1 : -1));
  return scanned[0]?.scannedAt ?? null;
}
