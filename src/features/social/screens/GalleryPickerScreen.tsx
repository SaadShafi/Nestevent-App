import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppText, Button, Header, Icon, Screen, useToast } from '@/components/ui';
import { IMG } from '@/data/images';
import { haptic } from '@/lib/haptics';
import { colors, layout, radius } from '@/theme';

import { useCreatePostStore } from '../store/createPost.store';

const CAMERA = '__camera__';
const GAP = 8;

/** Step 2 of Create Post: preview + 3-column gallery grid with single / multiple selection. */
export function GalleryPickerScreen() {
  const router = useRouter();
  const toast = useToast();
  const { width } = useWindowDimensions();
  const draftMedia = useCreatePostStore((s) => s.media);
  const setDraft = useCreatePostStore((s) => s.set);
  const [selected, setSelected] = useState<string[]>(draftMedia);
  const [multi, setMulti] = useState(draftMedia.length > 1);

  const items = useMemo(() => {
    const merged = [...draftMedia, ...IMG.gallery.filter((g) => !draftMedia.includes(g))];
    return [CAMERA, ...merged];
  }, [draftMedia]);

  const tile = (width - layout.screenPadding * 2 - GAP * 2) / 3;
  const preview = selected[0] ?? draftMedia[0] ?? IMG.gallery[0];

  const toggle = (uri: string) => {
    haptic.selection();
    setSelected((cur) => {
      if (!multi) return [uri];
      return cur.includes(uri) ? cur.filter((u) => u !== uri) : [...cur, uri];
    });
  };

  const next = () => {
    const media = selected.length > 0 ? selected : [preview];
    if (media.length === 0) return toast('Select at least one photo', 'error');
    setDraft({ media });
    router.push('/create-post/details');
  };

  return (
    <Screen glow>
      <Header
        left="close"
        title="Upload Photo"
        right={<Button title="Next" variant="outlinePrimary" size="sm" fullWidth={false} onPress={next} />}
      />
      <FlatList
        data={items}
        keyExtractor={(u, i) => `${u}-${i}`}
        numColumns={3}
        columnWrapperStyle={styles.column}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
        ListHeaderComponent={
          <>
            <Image source={{ uri: preview }} style={styles.preview} contentFit="cover" transition={200} />
            <View style={styles.galleryRow}>
              <AppText variant="h2" muted>
                Gallery
              </AppText>
              <Pressable
                onPress={() => {
                  haptic.selection();
                  setMulti((m) => {
                    if (m) setSelected((cur) => cur.slice(0, 1));
                    return !m;
                  });
                }}
                style={[styles.multiPill, !multi && styles.multiOff]}
                accessibilityRole="button">
                <Icon name="images" size={16} color={colors.white} />
                <AppText variant="label">Multiple Images</AppText>
              </Pressable>
            </View>
          </>
        }
        renderItem={({ item }) => {
          if (item === CAMERA) {
            return (
              <Pressable
                onPress={() => router.push('/create-post/camera')}
                style={[styles.tile, styles.cameraTile, { width: tile, height: tile }]}
                accessibilityLabel="Open camera">
                <Icon name="camera" size={28} color={colors.text} />
                <AppText variant="caption" secondary>
                  Camera
                </AppText>
              </Pressable>
            );
          }
          const isSel = selected.includes(item);
          return (
            <Pressable onPress={() => toggle(item)} style={[styles.tile, { width: tile, height: tile }]}>
              <Image source={{ uri: item }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
              {isSel ? (
                <View style={styles.check}>
                  <Icon name="checkmark" size={14} color={colors.white} />
                </View>
              ) : null}
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

export default GalleryPickerScreen;

const styles = StyleSheet.create({
  grid: { paddingBottom: 32 },
  column: { gap: GAP, marginBottom: GAP },
  preview: { width: '100%', height: 250, borderRadius: radius.xl, backgroundColor: colors.surface },
  galleryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, marginBottom: 14 },
  multiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    height: 34,
    borderRadius: radius.pill,
  },
  multiOff: { backgroundColor: colors.surfaceHigh },
  tile: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface },
  cameraTile: { alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 1, borderColor: colors.border },
  check: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
