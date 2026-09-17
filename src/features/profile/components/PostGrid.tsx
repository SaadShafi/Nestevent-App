import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { IMG } from '@/data/images';
import { formatCompact } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useSocialStore } from '@/store';
import { colors, layout, radius } from '@/theme';

const GAP = 6;
const COLUMNS = 3;

type Props = {
  /** Images to render; defaults to the placeholder grid. */
  images?: readonly string[];
  /** Horizontal padding of the parent container (used to compute tile width). */
  horizontalPadding?: number;
};

/** 3-column grid of post tiles with the "▶ 5k" play caption; tapping opens the post. */
export function PostGrid({ images = IMG.grid, horizontalPadding = layout.screenPadding }: Props) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const posts = useSocialStore((s) => s.posts);

  const tile = Math.floor((width - horizontalPadding * 2 - GAP * (COLUMNS - 1)) / COLUMNS);
  const tileH = Math.round(tile * 1.2);

  const open = (index: number) => {
    haptic.light();
    const post = posts.length ? posts[index % posts.length] : undefined;
    if (post) router.push(`/post/${post.id}` as never);
  };

  return (
    <View style={styles.grid}>
      {images.map((uri, i) => {
        const post = posts.length ? posts[i % posts.length] : undefined;
        const views = post ? post.likes : 5000;
        return (
          <Pressable
            key={`${uri}-${i}`}
            onPress={() => open(i)}
            accessibilityRole="imagebutton"
            style={({ pressed }) => [styles.tile, { width: tile, height: tileH }, pressed && styles.pressed]}>
            <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} cachePolicy="memory-disk" />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={styles.shade} />
            <View style={styles.caption}>
              <Icon name="play-outline" size={12} color={colors.white} />
              <AppText variant="captionMedium">{formatCompact(Math.min(views, 5000))}</AppText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, marginTop: 20 },
  tile: { borderRadius: radius.sm + 2, overflow: 'hidden', backgroundColor: colors.surface },
  pressed: { opacity: 0.85 },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 70 },
  caption: { position: 'absolute', left: 8, bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
});
