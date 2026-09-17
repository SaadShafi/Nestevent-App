import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { colors } from '@/theme';

type Props = {
  media: string[];
  height: number;
  onPress?: () => void;
  onLongPress?: () => void;
};

/** Full-bleed, horizontally paged post media with page dots when there is more than one item. */
export function MediaCarousel({ media, height, onPress, onLongPress }: Props) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  if (media.length <= 1) {
    return (
      <Pressable onPress={onPress} onLongPress={onLongPress} delayLongPress={450} style={[styles.fill, { height }]}>
        <Image source={{ uri: media[0] }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      </Pressable>
    );
  }

  return (
    <View style={[styles.fill, { height }]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onEnd}
        style={StyleSheet.absoluteFill}>
        {media.map((uri, i) => (
          <Pressable key={`${uri}-${i}`} onPress={onPress} onLongPress={onLongPress} delayLongPress={450} style={{ width, height }}>
            <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          </Pressable>
        ))}
      </ScrollView>
      <View pointerEvents="none" style={styles.dots}>
        {media.map((_, i) => (
          <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%', backgroundColor: colors.black },
  dots: { position: 'absolute', top: '46%', right: 0, left: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: colors.primary },
});
