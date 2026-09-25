import { BlurView } from 'expo-blur';
import { useEffect, useRef, type ReactNode } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, radius } from '@/theme';

import { AppText } from './AppText';
import { IconButton } from './IconButton';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Show the small drag handle */
  handle?: boolean;
  /** Show the X close button in the header */
  closeButton?: boolean;
  /** Make the sheet scrollable and cap height */
  scroll?: boolean;
  maxHeight?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

const SCREEN_H = Dimensions.get('window').height;

/**
 * Lightweight bottom sheet built on Modal + Animated — matches the Figma sheets
 * (Create Post, Choose Ticket Type, Report, Logout...). iOS gets a blurred backdrop,
 * Android a dimmed backdrop (blur is expensive there).
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  handle = true,
  closeButton = !!title,
  scroll = false,
  maxHeight = SCREEN_H * 0.88,
  style,
  contentStyle,
}: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }),
        Animated.timing(backdrop, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      translateY.setValue(SCREEN_H);
      backdrop.setValue(0);
    }
  }, [visible, translateY, backdrop]);

  const close = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_H, duration: 220, useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || g.vy > 1.2) close();
        else Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  const Body = scroll ? ScrollView : View;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      {/* Sheets with inputs (report reason, ticket code…) ride above the keyboard. Android's modal
          window already resizes for the keyboard, so only iOS needs the padding. */}
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined} enabled={Platform.OS === 'ios'}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdrop }]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null}
          <Pressable style={[StyleSheet.absoluteFill, styles.dim]} onPress={close} />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            { maxHeight, paddingBottom: Math.max(insets.bottom, 16) + 8, transform: [{ translateY }] },
            style,
          ]}>
          <View {...pan.panHandlers} style={styles.grabArea}>
            {handle ? <View style={styles.handle} /> : null}
            {title || closeButton ? (
              <View style={styles.header}>
                {title ? <AppText variant="h2">{title}</AppText> : <View />}
                {closeButton ? (
                  <IconButton name="close" size={34} iconSize={16} backgroundColor={colors.white} color={colors.black} onPress={close} />
                ) : null}
              </View>
            ) : null}
          </View>
          <Body
            style={scroll ? styles.scroll : undefined}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={scroll ? [styles.content, contentStyle] : undefined}>
            {scroll ? children : <View style={[styles.content, contentStyle]}>{children}</View>}
          </Body>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  dim: { backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    // Lets scrollable sheets shrink instead of overflowing the top when the keyboard is up.
    flexShrink: 1,
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingTop: 8,
  },
  grabArea: { paddingHorizontal: layout.screenPadding },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: '#3A3A3A', marginVertical: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  scroll: { flexGrow: 0 },
  content: { paddingHorizontal: layout.screenPadding, paddingTop: 8 },
});
