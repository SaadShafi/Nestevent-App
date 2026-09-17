import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useAppDrawer } from '@/components/navigation/AppDrawer';
import { AppText, Avatar, BottomSheet, Button, EmptyState, Icon, IconButton, Screen, useToast } from '@/components/ui';
import { IMG } from '@/data/images';
import { haptic } from '@/lib/haptics';
import { isLocationError, locate, openLocationSettings } from '@/lib/location';
import { useAuthStore, useChatStore } from '@/store';
import { colors, radius } from '@/theme';

import { PostGrid } from '../components/PostGrid';
import { ProfileHero } from '../components/ProfileHero';
import { SocialIconRow } from '../components/SocialIconRow';
import { StatsRow } from '../components/StatsRow';

const CITIES = [
  'Indio, California, USA',
  'Los Angeles, California, USA',
  'Houston, Texas, USA',
  'New York, New York, USA',
  'Las Vegas, Nevada, USA',
  'Miami, Florida, USA',
];

const GLASS = { bg: 'rgba(0,0,0,0.35)', border: 'rgba(255,255,255,0.25)' };

/** Own profile tab (guest + organizer). Cover under the status bar, curved sheet with stats + post grid. */
export function ProfileScreen() {
  const router = useRouter();
  const toast = useToast();
  const { openDrawer, drawer } = useAppDrawer();

  const user = useAuthStore((s) => s.user);
  const locationLabel = useAuthStore((s) => s.locationLabel);
  const setLocation = useAuthStore((s) => s.setLocation);
  const browseMode = useAuthStore((s) => s.browseMode);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasUnread = useChatStore((s) => s.notifications.some((n) => !n.read));

  const [locOpen, setLocOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  const useCurrent = async () => {
    setLocating(true);
    const res = await locate();
    setLocating(false);
    if (isLocationError(res)) {
      haptic.error();
      if (res.error === 'denied') {
        setLocOpen(false);
        toast('Location permission is required', 'error', { label: 'Open Settings', onPress: openLocationSettings });
      } else {
        toast('Could not get your location. Try again.', 'error');
      }
      return;
    }
    haptic.success();
    setLocation(res.label, res.coords);
    setLocOpen(false);
  };

  const pickCity = (city: string) => {
    haptic.selection();
    setLocation(city, null);
    setLocOpen(false);
  };

  const openFriends = (tab: 'followers' | 'following' | 'requests') =>
    router.push({ pathname: '/profile/friends', params: { tab } });

  const overlay = (
    <>
      <IconButton
        name="menu-outline"
        onPress={openDrawer}
        backgroundColor={GLASS.bg}
        borderColor={GLASS.border}
        accessibilityLabel="Open menu"
      />
      <Pressable
        onPress={() => {
          haptic.light();
          setLocOpen(true);
        }}
        style={styles.locationBtn}
        accessibilityRole="button"
        accessibilityLabel="Change location">
        <View style={styles.locationCaption}>
          <Icon name="location-outline" size={12} color={colors.white} />
          <AppText variant="caption" color={colors.white} style={styles.shadowText}>
            You location
          </AppText>
        </View>
        <View style={styles.locationRow}>
          <AppText variant="title" color={colors.white} numberOfLines={1} style={[styles.locationText, styles.shadowText]}>
            {locationLabel}
          </AppText>
          <Icon name="chevron-down" size={16} color={colors.white} />
        </View>
      </Pressable>
      <IconButton
        name="notifications-outline"
        onPress={() => router.push('/notifications' as never)}
        backgroundColor={GLASS.bg}
        borderColor={GLASS.border}
        badge={hasUnread}
        accessibilityLabel="Notifications"
      />
    </>
  );

  if (browseMode && !isAuthenticated) {
    return (
      <Screen withTabBar>
        <View style={styles.guestHeader}>
          <IconButton name="menu-outline" onPress={openDrawer} accessibilityLabel="Open menu" />
        </View>
        <View style={styles.guestBody}>
          <EmptyState
            icon="person-circle-outline"
            title="Create an account to build your profile"
            message="Sign in to follow friends, share posts and keep your tickets in one place."
          />
          <Button title="Sign in / Register" variant="primary" onPress={() => router.push('/(auth)/login')} />
        </View>
        {drawer}
      </Screen>
    );
  }

  return (
    <Screen padded={false} withTabBar scroll edges={[]}>
      <ProfileHero cover={user.cover ?? IMG.coverVan} height={250} overlay={overlay}>
        <View style={styles.identity}>
          <Avatar uri={user.avatar} size={72} />
          <View style={styles.identityText}>
            <AppText variant="h1" numberOfLines={1}>
              {user.displayName}
            </AppText>
            <View style={styles.pinRow}>
              <Icon name="location-sharp" size={14} color={colors.primary} />
              <AppText variant="caption" numberOfLines={1}>
                {user.location}
              </AppText>
            </View>
          </View>
          <Button
            variant="ghost"
            size="sm"
            fullWidth={false}
            title="Edit Profile"
            left={<Icon name="pencil" size={14} color={colors.text} />}
            onPress={() => router.push('/profile/edit')}
            style={styles.editBtn}
          />
        </View>

        {user.bio ? (
          <AppText secondary style={styles.bio}>
            {user.bio}
          </AppText>
        ) : null}

        <SocialIconRow user={user} />

        <StatsRow
          posts={user.posts}
          followers={user.followers}
          following={user.following}
          onPressFollowers={() => openFriends('followers')}
          onPressFollowing={() => openFriends('following')}
          action={
            <Button
              title="Friend list"
              size="md"
              fullWidth={false}
              onPress={() => openFriends('followers')}
              style={styles.friendBtn}
            />
          }
        />

        <PostGrid />
      </ProfileHero>

      <BottomSheet visible={locOpen} onClose={() => setLocOpen(false)} title="Your location">
        <Pressable onPress={useCurrent} disabled={locating} style={({ pressed }) => [styles.sheetRow, styles.currentRow, pressed && styles.pressed]}>
          <View style={styles.currentIcon}>
            {locating ? <ActivityIndicator color={colors.primary} /> : <Icon name="locate-outline" size={18} color={colors.primary} />}
          </View>
          <AppText variant="title">Use current location</AppText>
        </Pressable>
        {CITIES.map((c) => {
          const active = c === locationLabel;
          return (
            <Pressable key={c} onPress={() => pickCity(c)} style={({ pressed }) => [styles.sheetRow, pressed && styles.pressed]}>
              <Icon name="location-outline" size={18} color={active ? colors.primary : colors.textSecondary} />
              <AppText style={styles.sheetLabel} color={active ? colors.primary : colors.text}>
                {c}
              </AppText>
              {active ? <Icon name="checkmark-circle" size={20} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </BottomSheet>

      {drawer}
    </Screen>
  );
}

const styles = StyleSheet.create({
  locationBtn: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  locationCaption: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { flexShrink: 1 },
  shadowText: { textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  identityText: { flex: 1, gap: 4 },
  pinRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtn: { paddingHorizontal: 6 },
  bio: { marginTop: 18, lineHeight: 21 },
  friendBtn: { paddingHorizontal: 26 },
  guestHeader: { height: 56, justifyContent: 'center' },
  guestBody: { flex: 1, justifyContent: 'center' },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  currentRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  currentIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  sheetLabel: { flex: 1 },
  pressed: { opacity: 0.75 },
});

export default ProfileScreen;
