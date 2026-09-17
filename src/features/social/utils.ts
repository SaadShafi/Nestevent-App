import { formatTime } from '@/lib/format';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Sat,29 Aug - 9:00 PM" (event mini card on the social feed). */
export function formatFeedEventDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const time = formatTime(d).replace(/^0/, '');
  return `${DAYS[d.getDay()]},${d.getDate()} ${MONTHS[d.getMonth()]} - ${time}`;
}

/** "6 min" / "4h" / "2 days" — compact relative time used under author names and comments. */
export function shortTimeAgo(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.max(0, Date.now() - d.getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'now';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  return `${Math.floor(days / 30)}mo`;
}

/** Split a caption into a bold first line + body. */
export function splitCaption(caption: string) {
  const idx = caption.indexOf('\n');
  if (idx === -1) return { title: caption, body: '' };
  return { title: caption.slice(0, idx).trim(), body: caption.slice(idx + 1).trim() };
}
