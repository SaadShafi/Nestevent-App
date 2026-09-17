export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
export const isPhone = (v: string) => v.replace(/\D/g, '').length >= 7;
export const isStrongPassword = (v: string) =>
  v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v);
export const required = (v: string | undefined | null) => !!v && v.trim().length > 0;
/** Postal code: 3–10 digits (optionally with a single dash, e.g. 12345-6789). */
export const isZip = (v: string) => /^\d{3,10}(-\d{2,4})?$/.test(v.trim());
/** Numeric one-time code of exactly `length` digits. */
export const isOtp = (v: string, length = 4) => new RegExp(`^\\d{${length}}$`).test(v);
export const maxLen = (v: string, max: number) => v.trim().length <= max;
export const isUrl = (v: string) => /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(v.trim());
