import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { pickImages } from '@/components/PhotoPicker';
import { AppText, Button, Header, Icon, Screen, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

import { useCreatePostStore } from '../store/createPost.store';

/** Step 1 of Create Post: big "Add Media" dropzone + Open Camera / Continue. */
export function SocialUploadScreen() {
  const router = useRouter();
  const toast = useToast();
  const { height } = useWindowDimensions();
  const media = useCreatePostStore((s) => s.media);
  const setDraft = useCreatePostStore((s) => s.set);

  const pick = async () => {
    haptic.light();
    const uris = await pickImages({ multiple: true, videos: true });
    if (uris.length === 0) {
      if (media.length === 0) toast('No media selected', 'info');
      return;
    }
    setDraft({ media: uris });
    router.push('/create-post/gallery');
  };

  return (
    <Screen
      glow
      footer={
        <View style={styles.footer}>
          <Button
            title="Open Camera"
            variant="outline"
            left={<Icon name="camera" size={18} color={colors.white} />}
            onPress={() => router.push('/create-post/camera')}
          />
          <Button title="Continue" variant="white" disabled={media.length === 0} onPress={() => router.push('/create-post/details')} />
        </View>
      }>
      <Header title="Social Upload" />
      <AppText variant="display">Create Post</AppText>
      <AppText secondary style={styles.subtitle}>
        reader will be distracted by the readable content
      </AppText>
      <Pressable onPress={pick} style={({ pressed }) => [styles.drop, { height: height * 0.55 }, pressed && styles.pressed]}>
        <View style={styles.plus}>
          <Icon name="add" size={18} color={colors.black} />
        </View>
        <AppText variant="h2" center>
          {media.length > 0 ? `${media.length} selected` : 'Add Media'}
        </AppText>
        <AppText muted center>
          {media.length > 0 ? 'Tap to change selection' : 'Photos & Videos'}
        </AppText>
      </Pressable>
    </Screen>
  );
}

export default SocialUploadScreen;

const styles = StyleSheet.create({
  subtitle: { marginTop: 6, marginBottom: 16, maxWidth: 300 },
  drop: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pressed: { opacity: 0.9 },
  plus: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  footer: { gap: 12 },
});
