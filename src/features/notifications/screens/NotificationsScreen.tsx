import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, BottomSheet, EmptyState, Header, Icon, Screen } from '@/components/ui';
import { timeAgo } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useChatStore } from '@/store';
import { colors, radius } from '@/theme';

type Sort = 'Latest' | 'Oldest';

export function NotificationsScreen() {
  const notifications = useChatStore((s) => s.notifications);
  const markAllNotificationsRead = useChatStore((s) => s.markAllNotificationsRead);
  const markNotificationRead = useChatStore((s) => s.markNotificationRead);
  const [sort, setSort] = useState<Sort>('Latest');
  const [sheet, setSheet] = useState(false);

  const sorted = useMemo(() => {
    const list = [...notifications].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return sort === 'Latest' ? list : list.reverse();
  }, [notifications, sort]);

  const unread = notifications.some((n) => !n.read);

  return (
    <Screen scroll>
      <Header title="Notifications" />
      <View style={styles.panel}>
        <View style={styles.toolbar}>
          <Pressable
            onPress={() => {
              haptic.light();
              setSheet(true);
            }}
            style={styles.sortPill}>
            <AppText variant="captionMedium">{sort}</AppText>
            <Icon name="chevron-down" size={14} color={colors.white} />
          </Pressable>
          <Pressable
            onPress={() => {
              haptic.selection();
              markAllNotificationsRead();
            }}
            disabled={!unread}
            hitSlop={8}>
            <AppText variant="caption" color={unread ? colors.text : colors.textMuted}>
              Mark all as read
            </AppText>
          </Pressable>
        </View>

        {sorted.length === 0 ? (
          <EmptyState icon="notifications-off-outline" title="No notifications" message="You're all caught up." />
        ) : (
          sorted.map((n) => {
            const fg = n.read ? colors.text : colors.black;
            const fgSoft = n.read ? colors.textSecondary : 'rgba(0,0,0,0.75)';
            return (
              <Pressable
                key={n.id}
                onPress={() => {
                  if (!n.read) {
                    haptic.selection();
                    markNotificationRead(n.id);
                  }
                }}
                style={({ pressed }) => [styles.card, !n.read && styles.unread, pressed && styles.pressed]}>
                <View style={styles.titleRow}>
                  {!n.read ? <View style={styles.dot} /> : null}
                  <AppText variant="title" color={fg} numberOfLines={1} style={styles.title}>
                    {n.title}
                  </AppText>
                  <AppText variant="caption" color={fgSoft}>
                    {timeAgo(n.at)}
                  </AppText>
                </View>
                <AppText variant="caption" color={fgSoft} style={styles.body}>
                  {n.body}
                </AppText>
              </Pressable>
            );
          })
        )}
      </View>

      <BottomSheet visible={sheet} onClose={() => setSheet(false)} title="Sort by">
        {(['Latest', 'Oldest'] as Sort[]).map((s) => (
          <Pressable
            key={s}
            onPress={() => {
              haptic.selection();
              setSort(s);
              setSheet(false);
            }}
            style={[styles.sortRow, sort === s && styles.sortActive]}>
            <AppText variant="title" style={styles.flex}>
              {s}
            </AppText>
            {sort === s ? <Icon name="checkmark-circle" size={20} color={colors.primary} /> : null}
          </Pressable>
        ))}
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  panel: { backgroundColor: colors.bgElevated, borderRadius: radius.xl, padding: 8, paddingTop: 12 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 12 },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    height: 28,
    borderRadius: radius.pill,
  },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, marginBottom: 8 },
  unread: { backgroundColor: colors.primary },
  pressed: { opacity: 0.85 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.black },
  title: { flex: 1 },
  body: { marginTop: 6, lineHeight: 17 },
  sortRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 8, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: 'transparent' },
  sortActive: { borderColor: colors.primary },
});
