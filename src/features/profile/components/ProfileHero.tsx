import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WAVE_H, WaveEdge } from '@/components/WaveEdge';
import { colors, layout } from '@/theme';

type Props = {
  cover: string;
  height?: number;
  /** Controls laid over the cover, pinned to the safe-area top (hamburger / back / bell). */
  overlay?: ReactNode;
  /** Content of the curved dark sheet that overlaps the cover. */
  children: ReactNode;
  /** Figma "Details" hill: the sheet's top edge is a wave instead of rounded corners. */
  wave?: boolean;
};

const CURVE = 40;

/** Full-bleed cover image with a curved dark sheet overlapping its bottom edge (Profile / User Details). */
export function ProfileHero({ cover, height = 250, overlay, children, wave }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View>
      <View style={{ height }}>
        <Image source={{ uri: cover }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} cachePolicy="memory-disk" />
        <LinearGradient colors={['rgba(0,0,0,0.45)', 'transparent']} style={styles.topShade} />
        {overlay ? <View style={[styles.overlay, { top: insets.top + 8 }]}>{overlay}</View> : null}
      </View>
      {wave ? (
        <View style={styles.waveWrap}>
          <WaveEdge />
          <View style={styles.waveSheet}>{children}</View>
        </View>
      ) : (
        <View style={styles.sheet}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topShade: { position: 'absolute', left: 0, right: 0, top: 0, height: 140 },
  overlay: { position: 'absolute', left: layout.screenPadding, right: layout.screenPadding, flexDirection: 'row', alignItems: 'center' },
  sheet: {
    marginTop: -CURVE,
    backgroundColor: colors.bg,
    borderTopLeftRadius: CURVE,
    borderTopRightRadius: CURVE,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 28,
  },
  waveWrap: { marginTop: -WAVE_H },
  waveSheet: { backgroundColor: colors.bg, paddingHorizontal: layout.screenPadding, paddingTop: 16 },
});
