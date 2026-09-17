import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Icon } from '@/components/ui';
import { IMG } from '@/data/images';
import { haptic } from '@/lib/haptics';
import { useAuthStore } from '@/store';
import { colors, radius } from '@/theme';

import { WalkthroughPage, type WalkthroughSlide } from '../components/WalkthroughPage';

const BODY =
  'Harmonia brings you closer to the music you love — from intimate gigs to the biggest festival stages.';

const SLIDES: WalkthroughSlide[] = [
  { key: '1', image: IMG.walkthrough1, title: 'Welcome to\nNest Event', body: BODY },
  { key: '2', image: IMG.walkthrough2, title: 'Search and\nDiscover', body: BODY },
  { key: '3', image: IMG.walkthrough3, title: 'People Connect\nhere on Nest', body: BODY },
];

export function WalkthroughScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<WalkthroughSlide>>(null);
  const [index, setIndex] = useState(0);
  const setWalkthroughSeen = useAuthStore((s) => s.setWalkthroughSeen);

  const finish = () => {
    haptic.medium();
    setWalkthroughSeen();
    router.replace('/(auth)/login');
  };

  const next = () => {
    if (index >= SLIDES.length - 1) return finish();
    haptic.light();
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(Math.min(Math.max(i, 0), SLIDES.length - 1));
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <WalkthroughPage slide={item} width={width} height={height} bottomInset={insets.bottom} />
        )}
      />

      <Pressable
        onPress={finish}
        hitSlop={8}
        accessibilityRole="button"
        style={({ pressed }) => [styles.skip, { top: insets.top + 8 }, pressed && styles.pressed]}>
        <AppText variant="label">Skip</AppText>
      </Pressable>

      <View style={[styles.footer, { bottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={styles.dashes}>
          {SLIDES.map((s, i) => (
            <View key={s.key} style={[styles.dash, i === index && styles.dashActive]} />
          ))}
        </View>
        <Pressable
          onPress={next}
          accessibilityRole="button"
          accessibilityLabel={index === SLIDES.length - 1 ? 'Finish' : 'Next'}
          style={({ pressed }) => [styles.next, pressed && styles.pressed]}>
          <Icon name="arrow-forward" size={22} color={colors.white} style={styles.nextIcon} />
        </Pressable>
      </View>
    </View>
  );
}

export default WalkthroughScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  skip: {
    position: 'absolute',
    right: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 22,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  footer: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  dashes: { flexDirection: 'row', gap: 6, paddingBottom: 6 },
  dash: { width: 22, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)' },
  dashActive: { width: 44, backgroundColor: colors.primary },
  next: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextIcon: { transform: [{ rotate: '-45deg' }] },
});
