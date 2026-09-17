import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

export async function pickImages(opts: { multiple?: boolean; camera?: boolean; videos?: boolean } = {}) {
  if (opts.camera) {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return [];
    const res = await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: false });
    return res.canceled ? [] : res.assets.map((a) => a.uri);
  }
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return [];
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: opts.videos ? ['images', 'videos'] : ['images'],
    allowsMultipleSelection: !!opts.multiple,
    quality: 0.85,
    selectionLimit: opts.multiple ? 10 : 1,
  });
  return res.canceled ? [] : res.assets.map((a) => a.uri);
}

type Props = {
  value: string | null;
  onChange: (uri: string | null) => void;
  size?: number;
  /** Show the dashed "Photos Guideline" tile beside the picker */
  guideline?: boolean;
  onGuidelinePress?: () => void;
  circle?: boolean;
};

/** Profile photo tile with Remove badge + dashed "Photos Guideline" tile (Profile Setup / Edit Profile / Create Organization). */
export function ProfilePhotoPicker({ value, onChange, size = 84, guideline = true, onGuidelinePress, circle }: Props) {
  const toast = useToast();
  const pick = async () => {
    haptic.light();
    const [uri] = await pickImages();
    if (uri) onChange(uri);
  };
  const r = circle ? size / 2 : radius.lg;
  return (
    <View style={styles.row}>
      <Pressable onPress={pick} style={[styles.tile, { width: size, height: size, borderRadius: r }]}>
        {value ? (
          <>
            <Image source={{ uri: value }} style={[StyleSheet.absoluteFill, { borderRadius: r }]} contentFit="cover" />
            <Pressable
              onPress={() => onChange(null)}
              style={styles.remove}
              hitSlop={6}
              accessibilityLabel="Remove photo">
              <View style={styles.removeDot}>
                <Icon name="close" size={9} color={colors.white} />
              </View>
              <AppText variant="caption">Remove</AppText>
            </Pressable>
          </>
        ) : (
          <Icon name="camera-outline" size={26} color={colors.textSecondary} />
        )}
      </Pressable>
      {guideline ? (
        <Pressable
          onPress={onGuidelinePress ?? (() => toast('Use a clear, well-lit photo of yourself. No logos or text.', 'info'))}
          style={[styles.guide, { width: size, height: size, borderRadius: r }]}>
          <View style={styles.guideIcon}>
            <Icon name="alert" size={14} color={colors.text} />
          </View>
          <AppText variant="caption" center>
            Photos Guideline
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Dashed upload dropzone (Create Organization cover / Create Event photo / Social Upload). */
export function UploadDropzone({
  title,
  subtitle,
  cta = 'Upload',
  onPick,
  height = 150,
  large,
}: {
  title: string;
  subtitle?: string;
  cta?: string;
  onPick: () => void;
  height?: number;
  large?: boolean;
}) {
  return (
    <Pressable onPress={onPick} style={[styles.drop, { height }, large && styles.dropLarge]}>
      <View style={styles.dropIcon}>
        <Icon name="add" size={large ? 22 : 18} color={colors.text} />
      </View>
      <AppText variant={large ? 'h2' : 'title'} center>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="caption" muted center>
          {subtitle}
        </AppText>
      ) : null}
      {cta ? (
        <View style={styles.cta}>
          <AppText variant="label" color={colors.primary}>
            {cta}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  tile: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  remove: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  removeDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
  guide: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#4A4A4A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 6,
  },
  guideIcon: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  drop: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#4A4A4A',
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
    backgroundColor: colors.bgElevated,
  },
  dropLarge: { borderColor: colors.primary, backgroundColor: colors.surface },
  dropIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  cta: { marginTop: 8, backgroundColor: 'rgba(255,107,0,0.12)', paddingHorizontal: 40, paddingVertical: 8, borderRadius: radius.pill },
});
