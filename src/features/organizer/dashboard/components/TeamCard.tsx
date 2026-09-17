import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Icon } from '@/components/ui';
import type { TeamMember } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

type Props = { member: TeamMember; onEdit: () => void; onDelete: () => void };

/** Team member card: avatar + name/role, Edit / Delete actions, phone + email row. */
export function TeamCard({ member, onEdit, onDelete }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Avatar uri={member.avatar} size={48} />
        <View style={styles.flex}>
          <AppText variant="h3" numberOfLines={1}>
            {member.name}
          </AppText>
          <AppText variant="caption" secondary numberOfLines={1}>
            {member.roleDescription}
          </AppText>
        </View>
        <Pressable
          onPress={() => {
            haptic.light();
            onEdit();
          }}
          hitSlop={8}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <Icon name="pencil-outline" size={14} color={colors.white} />
          <AppText variant="captionMedium">Edit</AppText>
        </Pressable>
        <Pressable
          onPress={() => {
            haptic.light();
            onDelete();
          }}
          hitSlop={8}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <Icon name="trash-outline" size={14} color={colors.danger} />
          <AppText variant="captionMedium" color={colors.danger}>
            Delete
          </AppText>
        </Pressable>
      </View>
      <View style={styles.contact}>
        <View style={styles.contactItem}>
          <Icon name="call" size={14} color={colors.primary} />
          <AppText variant="caption" numberOfLines={1}>
            {member.phone}
          </AppText>
        </View>
        <View style={[styles.contactItem, styles.flex]}>
          <Icon name="mail" size={14} color={colors.primary} />
          <AppText variant="caption" numberOfLines={1} style={styles.flex}>
            {member.email}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, marginBottom: 14, gap: 14 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  pressed: { opacity: 0.7 },
  contact: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
