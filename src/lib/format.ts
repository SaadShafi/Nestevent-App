export function formatCurrency(value: number, opts: { compact?: boolean; decimals?: number } = {}) {
  const { compact = false, decimals } = opts;
  if (compact) {
    if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  const d = decimals ?? (Number.isInteger(value) ? 0 : 2);
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}`;
}

export function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${value}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function formatTime(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** "Dec 18 - 08:00 PM" */
export function formatEventDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${MONTHS[d.getMonth()]} ${d.getDate()} - ${formatTime(d)}`;
}

/** "August 21 - August 23 2026" */
export function formatDateRange(start: Date | string, end?: Date | string) {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = end ? (typeof end === 'string' ? new Date(end) : end) : undefined;
  const sTxt = `${MONTHS_LONG[s.getMonth()]} ${s.getDate()}`;
  if (!e) return `${sTxt} ${s.getFullYear()}`;
  return `${sTxt} - ${MONTHS_LONG[e.getMonth()]} ${e.getDate()} ${e.getFullYear()}`;
}

/** "Aug 29, 2026" */
export function formatShortDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** "Thursday, Nov 4, 2025" */
export function formatLongDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${DAYS_LONG[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** "10/05/2025" */
export function formatNumericDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}

export function timeAgo(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.max(0, Date.now() - d.getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days >= 14 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

export function pluralize(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function maskCard(last4: string) {
  return `****  ****  ****  ${last4}`;
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
