import { formatShortDate } from '@/lib/format';

/** "1:24 AM" (no leading zero — matches the Figma transaction rows). */
export function shortTime(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** "Today - 1:24 AM" / "Aug 29, 2026 - 9:10 PM" */
export function transactionTime(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const sameDay = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  return `${sameDay ? 'Today' : formatShortDate(d)} - ${shortTime(d)}`;
}

/** "+$5125" / "-$5125" */
export function signedAmount(amount: number) {
  const abs = Math.abs(amount);
  const txt = Number.isInteger(abs) ? `${abs}` : abs.toFixed(2);
  return `${amount < 0 ? '-' : '+'}$${txt}`;
}

/** "1,245" */
export function formatNumber(n: number) {
  return n.toLocaleString('en-US');
}

/** "May 01 - May 30" */
export function formatMonthRange(start: Date, end: Date) {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${MONTHS[start.getMonth()]} ${pad(start.getDate())} - ${MONTHS[end.getMonth()]} ${pad(end.getDate())}`;
}

/** Parse a "$150" / "150.50" style money input into a number (0 when invalid). */
export function parseMoney(v: string) {
  const n = parseFloat(v.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}
