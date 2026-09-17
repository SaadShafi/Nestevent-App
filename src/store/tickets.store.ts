import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { ORDERS, ORGANIZER_TICKETS, TICKETS } from '@/data/mock';
import type { Order, Ticket } from '@/data/types';
import { zustandStorage } from '@/lib/storage';
import { uid } from '@/lib/format';

type TicketsState = {
  /** Tickets owned by the current user (guest side). */
  myTickets: Ticket[];
  /** Orders + tickets sold by the organizer (organizer side). */
  orders: Order[];
  soldTickets: Ticket[];

  purchase: (args: {
    eventId: string;
    lines: { ticketTypeId: string; ticketTypeName: string; qty: number; price: number }[];
    holderName: string;
    holderAvatar?: string;
    total: number;
    tax: number;
  }) => Order;
  scanTicket: (qrValue: string) => { ok: boolean; ticket?: Ticket; reason?: string };
  markScanned: (ticketId: string) => void;
  sendComplimentary: (args: { eventId: string; ticketTypeId: string; ticketTypeName: string; qty: number; recipientName: string; recipientAvatar: string }) => void;
  resolveRefund: (orderId: string, action: 'approve' | 'decline') => void;
  requestRefund: (orderId: string, reason: string) => void;
};

export const useTicketsStore = create<TicketsState>()(
  persist(
    (set, get) => ({
      myTickets: TICKETS,
      orders: ORDERS,
      soldTickets: ORGANIZER_TICKETS,

      purchase: ({ eventId, lines, holderName, holderAvatar, total, tax }) => {
        const orderId = uid('o');
        const now = new Date().toISOString();
        const tickets: Ticket[] = lines.map((l) => {
          const id = uid('tk');
          return {
            id,
            orderId,
            eventId,
            ticketTypeId: l.ticketTypeId,
            ticketTypeName: l.ticketTypeName,
            holderName,
            holderAvatar,
            qty: l.qty,
            cost: +(l.qty * l.price).toFixed(2),
            qrValue: `NEST|${id}|${eventId}|${l.ticketTypeId}|me`,
            scanned: false,
            purchasedAt: now,
          };
        });
        const order: Order = {
          id: orderId,
          eventId,
          buyerId: 'me',
          buyerName: holderName,
          buyerAvatar: holderAvatar ?? '',
          lines,
          subtotal: +(total - tax).toFixed(2),
          tax,
          total,
          createdAt: now,
          status: 'paid',
          ticketIds: tickets.map((t) => t.id),
        };
        set((s) => ({ myTickets: [...tickets, ...s.myTickets], orders: [order, ...s.orders], soldTickets: [...tickets, ...s.soldTickets] }));
        return order;
      },

      scanTicket: (qrValue) => {
        const all = [...get().soldTickets, ...get().myTickets];
        const ticket = all.find((t) => t.qrValue === qrValue || t.id === qrValue.split('|')[1]);
        if (!ticket) return { ok: false, reason: 'Ticket not found' };
        if (ticket.scanned) return { ok: false, ticket, reason: 'Already scanned' };
        get().markScanned(ticket.id);
        return { ok: true, ticket: { ...ticket, scanned: true } };
      },

      markScanned: (ticketId) => {
        const at = new Date().toISOString();
        set((s) => ({
          soldTickets: s.soldTickets.map((t) => (t.id === ticketId ? { ...t, scanned: true, scannedAt: at } : t)),
          myTickets: s.myTickets.map((t) => (t.id === ticketId ? { ...t, scanned: true, scannedAt: at } : t)),
        }));
      },

      sendComplimentary: ({ eventId, ticketTypeId, ticketTypeName, qty, recipientName, recipientAvatar }) => {
        const id = uid('tk');
        const ticket: Ticket = {
          id,
          orderId: uid('o'),
          eventId,
          ticketTypeId,
          ticketTypeName,
          holderName: recipientName,
          holderAvatar: recipientAvatar,
          qty,
          cost: 0,
          qrValue: `NEST|${id}|${eventId}|${ticketTypeId}|comp`,
          scanned: false,
          purchasedAt: new Date().toISOString(),
          complimentary: true,
        };
        set((s) => ({ soldTickets: [ticket, ...s.soldTickets] }));
      },

      resolveRefund: (orderId, action) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, status: action === 'approve' ? 'refunded' : 'declined' } : o)),
        })),
      requestRefund: (orderId, reason) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, status: 'refund_requested', refundReason: reason } : o)),
        })),
    }),
    { name: 'nest.tickets', storage: zustandStorage },
  ),
);
