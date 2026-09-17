import { Platform, Share } from 'react-native';

export type ShareOptions = { title: string; message: string; url?: string };

let opener: ((opts: ShareOptions) => void) | null = null;

/** Registered once by ShareSheetHost (root layout). Returns an unregister fn. */
export function registerShareSheet(fn: (opts: ShareOptions) => void) {
  opener = fn;
  return () => {
    if (opener === fn) opener = null;
  };
}

/**
 * Opens the in-app share sheet (WhatsApp, Instagram, Facebook, X, Telegram, Snapchat, copy link, more)
 * or falls back to the OS share sheet when the host isn't mounted.
 */
export async function shareContent(opts: ShareOptions) {
  if (opener) {
    opener(opts);
    return;
  }
  await nativeShare(opts);
}

/** Native OS share sheet (UIActivityViewController / Android chooser). */
export async function nativeShare(opts: ShareOptions) {
  try {
    if (Platform.OS === 'ios') {
      await Share.share({ title: opts.title, message: opts.message, url: opts.url }, { subject: opts.title });
    } else {
      await Share.share({ title: opts.title, message: opts.url ? `${opts.message}\n${opts.url}` : opts.message }, { dialogTitle: opts.title });
    }
  } catch {
    // user dismissed
  }
}
