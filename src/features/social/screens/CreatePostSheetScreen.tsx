import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomSheet, Icon, OptionCard } from '@/components/ui';
import { colors } from '@/theme';

import { useCreatePostStore, type CreatePostMode } from '../store/createPost.store';

/** "Create Post" chooser sheet rendered inside a transparent modal route. */
export function CreatePostSheetScreen() {
  const router = useRouter();
  const reset = useCreatePostStore((s) => s.reset);
  const [visible, setVisible] = useState(true);
  const [selected, setSelected] = useState<CreatePostMode>('post');

  const close = () => {
    setVisible(false);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const choose = (mode: CreatePostMode) => {
    setSelected(mode);
    reset({ mode });
    router.replace(mode === 'post' ? '/create-post/upload' : '/create-post/verified-event');
  };

  return (
    <View style={styles.root}>
      <BottomSheet visible={visible} onClose={close} title="Create Post" handle={false}>
        <OptionCard
          compact
          filled
          title="Post"
          icon={<Icon name="image-outline" size={22} color={colors.white} />}
          selected={selected === 'post'}
          onPress={() => choose('post')}
        />
        <OptionCard
          compact
          filled
          title="Create verified event post"
          icon={<Icon name="bar-chart-outline" size={22} color={colors.white} />}
          selected={selected === 'verified'}
          onPress={() => choose('verified')}
        />
      </BottomSheet>
    </View>
  );
}

export default CreatePostSheetScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
});
