import { CameraView, useCameraPermissions, type CameraType, type FlashMode } from 'expo-camera';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Icon, IconButton, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, fonts } from '@/theme';

import { useCreatePostStore } from '../store/createPost.store';

const MODES = ['CINEMATIC', 'VIDEO', 'PHOTO', 'PORTRAIT', 'PANO'];
const YELLOW = '#FFD60A';

/** Full-screen camera (expo-camera). Captures a photo into the draft and continues to Post Details. */
export function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const media = useCreatePostStore((s) => s.media);
  const addMedia = useCreatePostStore((s) => s.addMedia);
  const lastShot = media[media.length - 1];

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/create-post/upload');
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capture = async () => {
    if (!ready || busy || !cameraRef.current) return;
    setBusy(true);
    haptic.medium();
    try {
      const pic = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (pic?.uri) {
        addMedia([pic.uri]);
        router.replace('/create-post/details');
      }
    } catch {
      toast('Could not take a photo', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!permission) {
    return <View style={styles.root} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <StatusBar style="light" />
        <IconButton name="close" onPress={close} style={[styles.closeBtn, { top: insets.top + 8 }]} accessibilityLabel="Close camera" />
        <Icon name="camera-outline" size={48} color={colors.primary} />
        <AppText variant="h2" center style={styles.permTitle}>
          Camera access needed
        </AppText>
        <AppText center secondary style={styles.permMsg}>
          Nest needs your camera to take photos for your post.
        </AppText>
        <Button title="Grant permission" onPress={() => requestPermission()} style={styles.permBtn} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        onCameraReady={() => setReady(true)}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <IconButton name="close" backgroundColor="rgba(0,0,0,0.5)" onPress={close} accessibilityLabel="Close camera" size={40} iconSize={18} />
        <View style={styles.topCenter}>
          <Pressable
            onPress={() => {
              haptic.selection();
              setFlash((f) => (f === 'off' ? 'on' : 'off'));
            }}
            hitSlop={10}
            style={styles.glyph}
            accessibilityLabel="Toggle flash">
            <Icon name={flash === 'on' ? 'flash' : 'flash-off'} size={18} color={flash === 'on' ? YELLOW : colors.white} />
          </Pressable>
          <Pressable onPress={() => toast('More camera controls coming soon', 'info')} hitSlop={10} style={styles.glyph} accessibilityLabel="More controls">
            <Icon name="chevron-up" size={18} color={colors.white} />
          </Pressable>
        </View>
        <Pressable
          onPress={() => {
            haptic.selection();
            setFacing((f) => (f === 'back' ? 'front' : 'back'));
          }}
          hitSlop={10}
          style={styles.glyph}
          accessibilityLabel="Flip camera">
          <Icon name="camera-reverse" size={20} color={colors.white} />
        </Pressable>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.modes}>
          {MODES.map((m) => (
            <AppText key={m} style={[styles.mode, m === 'PHOTO' && styles.modeActive]}>
              {m}
            </AppText>
          ))}
        </View>
        <View style={styles.shutterRow}>
          <Pressable
            onPress={() => lastShot && router.replace('/create-post/details')}
            style={styles.thumbWrap}
            accessibilityLabel="Last photo">
            {lastShot ? <Image source={{ uri: lastShot }} style={styles.thumb} contentFit="cover" /> : <View style={styles.thumbEmpty} />}
          </Pressable>
          <Pressable
            onPress={capture}
            disabled={!ready || busy}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
            style={({ pressed }) => [styles.shutter, (pressed || busy) && styles.shutterPressed]}>
            <View style={styles.shutterInner} />
          </Pressable>
          <View style={styles.thumbWrap} />
        </View>
      </View>
    </View>
  );
}

export default CameraScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.black },
  center: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  closeBtn: { position: 'absolute', left: 16 },
  permTitle: { marginTop: 16 },
  permMsg: { marginTop: 8, marginBottom: 24 },
  permBtn: { alignSelf: 'stretch' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  topCenter: { flexDirection: 'row', alignItems: 'center', gap: 60 },
  glyph: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', paddingTop: 16 },
  modes: { flexDirection: 'row', justifyContent: 'center', gap: 26, marginBottom: 18 },
  mode: { fontFamily: fonts.semibold, fontSize: 13, letterSpacing: 1, color: colors.textSecondary },
  modeActive: { color: YELLOW },
  shutterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24 },
  thumbWrap: { width: 60, height: 60 },
  thumb: { width: 60, height: 60, borderRadius: 8 },
  thumbEmpty: { width: 60, height: 60, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)' },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterPressed: { opacity: 0.7 },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.white },
});
