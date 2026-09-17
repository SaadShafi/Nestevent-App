import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { haptic } from '@/lib/haptics';
import { registerShareSheet, type ShareOptions } from '@/lib/share';
import { colors, radius } from '@/theme';

import { AppText } from './AppText';
import { BottomSheet } from './BottomSheet';
import { BrandIcon, Icon } from './Icon';
import { useToast } from './Toast';

type Target = {
  key: string;
  label: string;
  bg: string;
  icon: 'whatsapp' | 'instagram' | 'facebook' | 'x-twitter' | 'telegram' | 'snapchat';
  /** Build the deep link; return null when the platform can't take text (opens native share instead). */
  url: (text: string, url?: string) => string | null;
  web?: (text: string, url?: string) => string;
};

const enc = encodeURIComponent;

const TARGETS: Target[] = [
  { key: 'whatsapp', label: 'WhatsApp', bg: '#25D366', icon: 'whatsapp', url: (t, u) => `whatsapp://send?text=${enc(u ? `${t}\n${u}` : t)}`, web: (t, u) => `https://wa.me/?text=${enc(u ? `${t}\n${u}` : t)}` },
  { key: 'instagram', label: 'Instagram', bg: '#E1306C', icon: 'instagram', url: () => null },
  { key: 'facebook', label: 'Facebook', bg: '#1877F2', icon: 'facebook', url: (_t, u) => (u ? `fb://facewebmodal/f?href=${enc(u)}` : null), web: (_t, u) => `https://www.facebook.com/sharer/sharer.php?u=${enc(u ?? '')}` },
  { key: 'x', label: 'X', bg: '#000000', icon: 'x-twitter', url: (t, u) => `twitter://post?message=${enc(u ? `${t} ${u}` : t)}`, web: (t, u) => `https://twitter.com/intent/tweet?text=${enc(t)}${u ? `&url=${enc(u)}` : ''}` },
  { key: 'telegram', label: 'Telegram', bg: '#26A5E4', icon: 'telegram', url: (t, u) => `tg://msg?text=${enc(u ? `${t}\n${u}` : t)}`, web: (t, u) => `https://t.me/share/url?url=${enc(u ?? '')}&text=${enc(t)}` },
  { key: 'snapchat', label: 'Snapchat', bg: '#FFFC00', icon: 'snapchat', url: () => null },
];

async function nativeShare(opts: ShareOptions) {
  try {
    if (Platform.OS === 'ios') {
      await Share.share({ title: opts.title, message: opts.message, url: opts.url }, { subject: opts.title });
    } else {
      await Share.share({ title: opts.title, message: opts.url ? `${opts.message}\n${opts.url}` : opts.message }, { dialogTitle: opts.title });
    }
  } catch {
    // dismissed
  }
}

/**
 * App-wide share sheet: WhatsApp / Instagram / Facebook / X / Telegram / Snapchat / Copy link / More.
 * Mounted once in the root layout; opened through `shareContent()` from '@/lib/share'.
 */
export function ShareSheetHost() {
  const toast = useToast();
  const [opts, setOpts] = useState<ShareOptions | null>(null);

  useEffect(() => registerShareSheet((o) => setOpts(o)), []);

  const close = () => setOpts(null);

  const open = async (t: Target) => {
    if (!opts) return;
    haptic.selection();
    const deep = t.url(opts.message, opts.url);
    try {
      if (deep && (await Linking.canOpenURL(deep))) {
        await Linking.openURL(deep);
        close();
        return;
      }
      if (t.web) {
        await Linking.openURL(t.web(opts.message, opts.url));
        close();
        return;
      }
    } catch {
      // fall through to native
    }
    // Instagram / Snapchat don't accept text links: hand off to the OS sheet where their share extensions live.
    close();
    setTimeout(() => nativeShare(opts), 250);
  };

  const copy = async () => {
    if (!opts) return;
    await Clipboard.setStringAsync(opts.url ?? opts.message);
    haptic.success();
    toast('Link copied', 'success');
    close();
  };

  const more = () => {
    if (!opts) return;
    close();
    setTimeout(() => nativeShare(opts), 250);
  };

  return (
    <BottomSheet visible={!!opts} onClose={close} title="Share">
      {opts ? (
        <View style={styles.preview}>
          <AppText variant="title" numberOfLines={1}>
            {opts.title}
          </AppText>
          {opts.url ? (
            <AppText variant="caption" secondary numberOfLines={1}>
              {opts.url}
            </AppText>
          ) : null}
        </View>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.targets}>
        {TARGETS.map((t) => (
          <Pressable key={t.key} onPress={() => open(t)} style={styles.target} accessibilityRole="button" accessibilityLabel={`Share to ${t.label}`}>
            <View style={[styles.circle, { backgroundColor: t.bg }]}>
              <BrandIcon name={t.icon} size={26} color={t.key === 'snapchat' ? colors.black : colors.white} />
            </View>
            <AppText variant="caption" center>
              {t.label}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.actions}>
        <Pressable onPress={copy} style={styles.action}>
          <Icon name="link-outline" size={20} />
          <AppText variant="bodyMedium" style={styles.flex}>
            Copy link
          </AppText>
        </Pressable>
        <Pressable onPress={more} style={styles.action}>
          <Icon name="ellipsis-horizontal-circle-outline" size={20} />
          <AppText variant="bodyMedium" style={styles.flex}>
            More options…
          </AppText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  preview: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, marginBottom: 16 },
  targets: { gap: 18, paddingVertical: 4, paddingHorizontal: 4 },
  target: { alignItems: 'center', gap: 8, width: 64 },
  circle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  actions: { marginTop: 18, backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, height: 52 },
});
