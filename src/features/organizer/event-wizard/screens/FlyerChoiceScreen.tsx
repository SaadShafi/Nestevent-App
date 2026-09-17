import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { pickImages } from '@/components/PhotoPicker';
import { BottomSheet, Icon, OptionCard, Screen } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useOrganizerStore } from '@/store';
import { colors } from '@/theme';

/** "Event Media & Flyer" — sheet-like step: upload a flyer or use the AI assistant. */
export function FlyerChoiceScreen() {
  const router = useRouter();
  const draft = useOrganizerStore((s) => s.draft);
  const setDraft = useOrganizerStore((s) => s.setDraft);
  const [visible, setVisible] = useState(true);
  const [choice, setChoice] = useState<'keep' | 'upload' | 'ai'>(draft.flyer ? 'keep' : draft.flyerMode === 'ai' ? 'ai' : 'upload');
  const bg = draft.flyer ?? draft.photos[0];

  // Edit flow (or coming back to this step): the draft already has a flyer, so let it through untouched.
  const keep = () => {
    setChoice('keep');
    haptic.light();
    router.replace('/organizer/create-event/visibility');
  };

  const upload = async () => {
    setChoice('upload');
    const [uri] = await pickImages();
    if (!uri) return;
    setDraft({ flyer: uri, flyerMode: 'upload' });
    haptic.success();
    router.replace('/organizer/create-event/visibility');
  };

  const ai = () => {
    setChoice('ai');
    router.replace('/organizer/create-event/ai-flyer');
  };

  return (
    <Screen padded={false} edges={[]}>
      {bg ? <Image source={{ uri: bg }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={30} /> : null}
      <View style={[StyleSheet.absoluteFill, styles.dim]} />
      <BottomSheet
        visible={visible}
        onClose={() => {
          setVisible(false);
          router.back();
        }}
        title="Event Media & Flyer">
        {draft.flyer ? (
          <OptionCard
            compact
            filled
            title="Keep current flyer"
            icon={<Icon name="checkmark-circle-outline" size={20} color={colors.white} />}
            selected={choice === 'keep'}
            onPress={keep}
          />
        ) : null}
        <OptionCard
          compact
          filled
          title="Upload flyer"
          icon={<Icon name="image-outline" size={20} color={colors.white} />}
          selected={choice === 'upload'}
          onPress={upload}
        />
        <OptionCard
          compact
          filled
          title="Use AI assistant"
          icon={<Icon name="bar-chart-outline" size={20} color={colors.white} />}
          selected={choice === 'ai'}
          onPress={ai}
        />
      </BottomSheet>
    </Screen>
  );
}

export default FlyerChoiceScreen;

const styles = StyleSheet.create({
  dim: { backgroundColor: 'rgba(0,0,0,0.6)' },
});
