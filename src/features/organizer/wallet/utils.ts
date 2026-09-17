/** "**** 9110" — last 4 characters of an account number / IBAN. */
export function maskAccount(number: string) {
  const clean = number.replace(/\s+/g, '');
  return `**** ${clean.slice(-4)}`;
}

/** Keep only digits and a single decimal point with at most 2 decimals ("12.345" → "12.34"). */
export function sanitizeAmount(v: string) {
  const cleaned = v.replace(/[^0-9.]/g, '');
  const [whole = '', ...rest] = cleaned.split('.');
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join('').slice(0, 2)}`;
}
