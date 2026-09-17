import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { pickImages } from '@/components/PhotoPicker';
import { Button, Header, Icon, Screen, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useSocialStore } from '@/store';
import { colors, radius } from '@/theme';

import { PostMetaFields } from '../components/PostMetaFields';
import { useCreatePostStore } from '../store/createPost.store';

const CARD_W = 240;
const CARD_H = 340;

/** Step 3 of Create Post: caption, location, visibility and media carousel, then Confirm & Upload. */
export function PostDetailsScreen() {
  const router = useRouter();
  const toast = useToast();
  const draft = useCreatePostStore();
  const addPost = useSocialStore((s) => s.addPost);

  const addMore = async () => {
    haptic.light();
    const uris = await pickImages({ multiple: true, videos: true });
    if (uris.length) draft.addMedia(uris);
  };

  const remove = (uri: string) => {
    haptic.medium();
    draft.removeMedia(uri);
    toast('Photo removed', 'info');
  };

  const confirm = () => {
    if (draft.media.length === 0) return;
    addPost({
      authorId: 'me',
      media: draft.media,
      caption: draft.caption.trim(),
      location: draft.location || undefined,
      isPublic: draft.isPublic,
    });
    haptic.success();
    draft.reset();
    router.replace('/create-post/success');
  };

  return (
    <Screen
      scroll
      keyboard
      glow
      padded={false}
      footer={<Button title="Confirm & Upload" variant="white" disabled={draft.media.length === 0} onPress={confirm} />}>
      <View style={styles.padded}>
        <Header title="Create Post" />
        <PostMetaFields />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_W + 16}
        contentContainerStyle={styles.carousel}>
        {draft.media.map((uri) => (
          <Pressable
            key={uri}
            onLongPress={() => remove(uri)}
            delayLongPress={400}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            accessibilityHint="Long press to remove">
            <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
          </Pressable>
        ))}
        <View style={styles.addWrap}>
          <Pressable onPress={addMore} style={({ pressed }) => [styles.add, pressed && styles.pressed]} accessibilityLabel="Add media">
            <Icon name="add" size={26} color={colors.white} />
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

export default PostDetailsScreen;

const styles = StyleSheet.create({
  padded: { paddingHorizontal: 16 },
  carousel: { paddingHorizontal: 16, gap: 16, alignItems: 'center', paddingBottom: 8 },
  card: { width: CARD_W, height: CARD_H, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.surface },
  pressed: { opacity: 0.85 },
  addWrap: { height: CARD_H, justifyContent: 'center' },
  add: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
