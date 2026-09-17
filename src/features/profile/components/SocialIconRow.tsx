import { LinearGradient } from 'expo-linear-gradient';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { BrandIcon, Icon, useToast } from '@/components/ui';
import type { User } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { shareContent } from '@/lib/share';
import { colors } from '@/theme';

type Socials = User['socials'];
type NetworkKey = keyof Socials;

const SIZE = 40;

const NETWORKS: { key: NetworkKey; icon: 'instagram' | 'x-twitter' | 'youtube' | 'snapchat'; bg: string; color: string; url: (h: string) => string }[] = [
  { key: 'instagram', icon: 'instagram', bg: '#DD2A7B', color: colors.white, url: (h) => `https://instagram.com/${h}` },
  { key: 'x', icon: 'x-twitter', bg: colors.black, color: colors.white, url: (h) => `https://x.com/${h}` },
  { key: 'youtube', icon: 'youtube', bg: '#FF0000', color: colors.white, url: (h) => `https://youtube.com/@${h}` },
  { key: 'snapchat', icon: 'snapchat', bg: '#FFFC00', color: colors.black, url: (h) => `https://snapchat.com/add/${h}` },
];

type Props = { user: User };

/** Instagram / X / YouTube / Snapchat circles (only the networks the user has) + share button. */
export function SocialIconRow({ user }: Props) {
  const toast = useToast();

  const open = async (target: string) => {
    haptic.light();
    try {
      await Linking.openURL(target);
    } catch {
      toast('Could not open link', 'error');
    }
  };

  const share = () => {
    haptic.light();
    shareContent({
      title: user.displayName,
      message: `Check out ${user.displayName} on Nest Event`,
      url: `https://nest.app/u/${user.id}`,
    });
  };

  return (
    <View style={styles.row}>
      {NETWORKS.map((n) => {
        const handle = user.socials[n.key];
        if (handle == null) return null;
        const target = /^https?:\/\//.test(handle) ? handle : n.url(handle);
        return (
          <Pressable
            key={n.key}
            onPress={() => open(target)}
            accessibilityRole="link"
            accessibilityLabel={n.key}
            style={({ pressed }) => [styles.circle, { backgroundColor: n.bg }, pressed && styles.pressed]}>
            {n.key === 'instagram' ? (
              <LinearGradient
                colors={['#F58529', '#DD2A7B', '#8134AF']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, styles.gradient]}
              />
            ) : null}
            <BrandIcon name={n.icon} size={18} color={n.color} />
          </Pressable>
        );
      })}
      <Pressable
        onPress={share}
        accessibilityRole="button"
        accessibilityLabel="Share profile"
        style={({ pressed }) => [styles.circle, styles.share, pressed && styles.pressed]}>
        <Icon name="arrow-redo-outline" size={18} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  circle: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  gradient: { borderRadius: SIZE / 2 },
  share: { backgroundColor: colors.surface },
  pressed: { opacity: 0.75 },
});
