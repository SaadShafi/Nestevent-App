import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';

export type WalkthroughSlide = { key: string; image: string; title: string; body: string };

type Props = { slide: WalkthroughSlide; width: number; height: number; bottomInset: number };

/** One full-bleed page of the walkthrough carousel: image + bottom dark gradient + copy. */
export function WalkthroughPage({ slide, width, height, bottomInset }: Props) {
  return (
    <View style={{ width, height }}>
      <Image source={{ uri: slide.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.92)']}
        locations={[0.35, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.copy, { paddingBottom: bottomInset + 96 }]}>
        <AppText variant="display" style={styles.title}>
          {slide.title}
        </AppText>
        <AppText secondary style={styles.body}>
          {slide.body}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 20 },
  title: { fontSize: 36, lineHeight: 42, marginBottom: 14 },
  body: { maxWidth: 250, lineHeight: 21 },
});
