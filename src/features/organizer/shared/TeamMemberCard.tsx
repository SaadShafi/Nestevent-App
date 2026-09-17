import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, Icon } from '@/components/ui';
import type { TeamMember } from '@/data/types';
import { colors, radius } from '@/theme';

type Props = { member: TeamMember; onDelete: () => void; onPress?: () => void };

/** Team list card: avatar, name, role, red Delete, phone + email rows. */
export function TeamMemberCard({ member, onDelete, onPress }: Props) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}>
      <View style={styles.top}>
        <Avatar uri={member.avatar} size={44} />
        <View style={styles.flex}>
          <AppText variant="title">{member.name}</AppText>
          <AppText variant="caption" secondary>
            {member.role}
          </AppText>
        </View>
        <Pressable onPress={onDelete} hitSlop={10} style={styles.delete} accessibilityLabel="Delete team member">
          <Icon name="trash-outline" size={15} color={colors.danger} />
          <AppText variant="captionMedium" color={colors.danger}>
            Delete
          </AppText>
        </Pressable>
      </View>
      <View style={styles.contact}>
        <View style={styles.contactItem}>
          <Icon name="call" size={13} color={colors.primary} />
          <AppText variant="caption">{member.phone}</AppText>
        </View>
        <View style={styles.contactItem}>
          <Icon name="mail" size={13} color={colors.primary} />
          <AppText variant="caption" numberOfLines={1} style={styles.flex}>
            {member.email}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, marginBottom: 12 },
  pressed: { opacity: 0.9 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  delete: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contact: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
});
