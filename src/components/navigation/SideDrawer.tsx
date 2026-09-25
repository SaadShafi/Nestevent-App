import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AppText,
  Button,
  Icon,
  IconButton,
  NestLogo,
} from "@/components/ui";
import { useAuthStore } from "@/store";
import { colors, fonts, radius } from "@/theme";

import { DrawerIcon, type DrawerIconName } from "./DrawerIcon";

type Item = { label: string; icon: DrawerIconName; href: string };

/** Drawer entries; Dashboard / Profile resolve to the current role's tab group. */
function menuItems(role: string | null): Item[] {
  const tabs = role === "organizer" ? "/(organizer)/(tabs)" : "/(guest)/(tabs)";
  return [
    { label: "Dashboard", icon: "dashboard", href: `${tabs}/home` },
    { label: "Support", icon: "support", href: "/settings/support" },
    { label: "Setting", icon: "setting", href: "/settings" },
    { label: "Terms & Condition", icon: "terms", href: "/settings/terms" },
    { label: "Privacy Policy", icon: "privacy", href: "/settings/privacy" },
    { label: "FAQ's", icon: "faq", href: "/settings/faq" },
    { label: "Profile", icon: "profile", href: `${tabs}/profile` },
  ];
}

const W = Dimensions.get("window").width;
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
        Animated.spring(x, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      x.setValue(-DRAWER_W);
      fade.setValue(0);
    }
  }, [visible, x, fade]);

  const close = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(x, {
        toValue: -DRAWER_W,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      cb?.();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => close()}
      statusBarTranslucent
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.dim, { opacity: fade }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => close()} />
      </Animated.View>
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_W,
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 16,
            transform: [{ translateX: x }],
          },
        ]}
      >
        <IconButton
          name="close"
          onPress={() => close()}
          accessibilityLabel="Close menu"
        />
        <NestLogo size={80} style={styles.logo} />
        <AppText style={styles.welcome}>Welcome{"\n"}To Inspired</AppText>
        <View style={styles.items}>
          {items.map((it) => (
            <Pressable
              key={it.label}
              onPress={() => close(() => router.push(it.href as never))}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <DrawerIcon name={it.icon} size={20} />
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
  dim: { backgroundColor: "rgba(0,0,0,0.55)" },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    borderTopRightRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  logo: { marginTop: 24 },
  // Figma: Gilroy Regular 30/38, #FCFCFC. Gilroy isn't bundled — Outfit is the app's closest geometric match.
  welcome: {
    marginTop: 8,
    marginBottom: 24,
    fontFamily: fonts.regular,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: 0,
    color: "#FCFCFC",
  },
  items: { gap: 4 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  pressed: { opacity: 0.7 },
  flex: { flex: 1 },
  logout: { alignSelf: "stretch" },
});
