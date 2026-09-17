import * as ImagePicker from 'expo-image-picker';

import type { Attachment } from '@/data/types';

const fileName = (uri: string) => decodeURIComponent(uri.split('/').pop() ?? 'file');

type DocumentPickerModule = typeof import('expo-document-picker');

/** Native modules registered by expo-modules-core (`globalThis.expo.modules`). */
type ExpoGlobal = { expo?: { modules?: Record<string, unknown> } };

/** True when the ExpoDocumentPicker native module is linked into this binary (false in Expo Go). */
function hasNativeDocumentPicker() {
  const mods = (globalThis as ExpoGlobal).expo?.modules;
  return !!mods && mods.ExpoDocumentPicker != null;
}

let documentPicker: DocumentPickerModule | null | undefined;

/**
 * expo-document-picker is not bundled in Expo Go, and even a guarded `require()` makes Metro log a red
 * "Cannot find native module" error when the JS module initialises. Check the native module registry
 * first so the require only ever runs in builds that actually ship the module.
 */
function loadDocumentPicker(): DocumentPickerModule | null {
  if (documentPicker !== undefined) return documentPicker;
  if (!hasNativeDocumentPicker()) {
    documentPicker = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    documentPicker = require('expo-document-picker') as DocumentPickerModule;
  } catch {
    documentPicker = null;
  }
  return documentPicker;
}

/** True when the native document picker is available (false in Expo Go). */
export function canPickDocuments() {
  return loadDocumentPicker() != null;
}

/** Photo or video from the library. */
export async function pickMediaAttachment(): Promise<Attachment | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.85, allowsMultipleSelection: false });
  if (res.canceled || !res.assets[0]) return null;
  const a = res.assets[0];
  return {
    kind: a.type === 'video' ? 'video' : 'image',
    uri: a.uri,
    name: a.fileName ?? fileName(a.uri),
    size: a.fileSize,
    mimeType: a.mimeType,
    width: a.width,
    height: a.height,
  };
}

/** Take a photo with the camera. */
export async function captureAttachment(): Promise<Attachment | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return null;
  const res = await ImagePicker.launchCameraAsync({ quality: 0.85 });
  if (res.canceled || !res.assets[0]) return null;
  const a = res.assets[0];
  return { kind: 'image', uri: a.uri, name: a.fileName ?? fileName(a.uri), size: a.fileSize, mimeType: a.mimeType, width: a.width, height: a.height };
}

/** Any document (PDF, docs, zip…) via the system file picker. Falls back to the media library in Expo Go. */
export async function pickDocumentAttachment(): Promise<Attachment | null> {
  const DocumentPicker = loadDocumentPicker();
  if (!DocumentPicker) return pickMediaAttachment();
  const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
  if (res.canceled || !res.assets[0]) return null;
  const a = res.assets[0];
  const isImage = a.mimeType?.startsWith('image/');
  return { kind: isImage ? 'image' : 'file', uri: a.uri, name: a.name, size: a.size, mimeType: a.mimeType };
}

export function formatBytes(n?: number) {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
