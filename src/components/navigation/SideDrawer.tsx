import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Icon, IconButton, NestLogo, type IoniconName } from '@/components/ui';
import { useAuthStore } from '@/store';
import { colors, radius } from '@/theme';

type Item = { label: string; icon: IoniconName; href: string };

/** Drawer entries; Dashboard / Profile resolve to the current role's tab group. */
function menuItems(role: string | null): Item[] {
  const tabs = role === 'organizer' ? '/(organizer)/(tabs)' : '/(guest)/(tabs)';
  return [
    { label: 'Dashboard', icon: 'grid-outline', href: `${tabs}/home` },
    { label: 'Support', icon: 'headset-outline', href: '/settings/support' },
    { label: 'Setting', icon: 'settings-outline', href: '/settings' },
    { label: 'Terms & Condition', icon: 'document-text-outline', href: '/settings/terms' },
    { label: 'Privacy Policy', icon: 'shield-checkmark-outline', href: '/settings/privacy' },
    { label: "FAQ's", icon: 'help-circle-outline', href: '/settings/faq' },
    { label: 'Profile', icon: 'person-outline', href: `${tabs}/profile` },
  ];
}

const W = Dimensions.get('window').width;
const DRAWER_W = Math.min(W * 0.62, 280);

type Props = { visible: boolean; onClose: () => void; onLogout: () => void };

/** Slide-in side menu from the Figma "Welcome To Inspired" drawer. */
export function SideDrawer({ visible, onClose, onLogout }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const role = useAuthStore((s) => s.role);
  const items = menuItems(role);
  const x = useRef(new Animated.Value(-DRAWER_W)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(x, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
        Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      x.setValue(-DRAWER_W);
      fade.setValue(0);
    }
  }, [visible, x, fade]);

  const close = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(x, { toValue: -DRAWER_W, duration: 200, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      onClose();
      cb?.();
    });
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => close()} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, styles.dim, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => close()} />
      </Animated.View>
      <Animated.View style={[styles.drawer, { width: DRAWER_W, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16, transform: [{ translateX: x }] }]}>
        <IconButton name="close" onPress={() => close()} accessibilityLabel="Close menu" />
        <NestLogo size={40} style={styles.logo} />
        <AppText variant="displaySm" style={styles.welcome}>
          Welcome{'\n'}To Inspired
        </AppText>
        <View style={styles.items}>
          {items.map((it) => (
            <Pressable
              key={it.label}
              onPress={() => close(() => router.push(it.href as never))}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
              <Icon name={it.icon} size={18} color={colors.text} />
              <AppText variant="bodyMedium">{it.label}</AppText>
            </Pressable>
          ))}
        </View>
        <View style={styles.flex} />
        <Button
          title="Logout"
          variant="danger"
          size="md"
          left={<Icon name="log-out-outline" size={18} color={colors.danger} />}
          onPress={() => close(onLogout)}
          style={styles.logout}
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: { backgroundColor: 'rgba(0,0,0,0.55)' },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    borderTopRightRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  logo: { marginTop: 24 },
  welcome: { marginTop: 8, marginBottom: 24, fontSize: 26, lineHeight: 32 },
  items: { gap: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  pressed: { opacity: 0.7 },
  flex: { flex: 1 },
  logout: { alignSelf: 'stretch' },
});
