/** "4:21pm" */
export function shortClock(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m}${ampm}`;
}

export function isSameDay(a: Date | string, b: Date | string) {
  const x = typeof a === 'string' ? new Date(a) : a;
  const y = typeof b === 'string' ? new Date(b) : b;
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
}
