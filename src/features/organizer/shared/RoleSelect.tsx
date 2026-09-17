import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon, type IoniconName } from '@/components/ui';
import type { TeamMember } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { colors, radius } from '@/theme';

export type TeamRole = TeamMember['role'];

export const ROLES: { role: TeamRole; description: string; icon: IoniconName }[] = [
  { role: 'Event Manager', description: 'Events · Guests · Marketing', icon: 'person' },
  { role: 'Door Manager', description: 'Guest list · Scanner', icon: 'scan' },
];

export const roleDescription = (role: TeamRole) => ROLES.find((r) => r.role === role)?.description ?? '';

type Props = { value: TeamRole; onChange: (role: TeamRole) => void; error?: string };

/** "Select Their Role" — Event Manager (orange when selected) / Door Manager pill cards. */
export function RoleSelect({ value, onChange, error }: Props) {
  return (
    <View style={styles.wrap}>
      <AppText variant="label" style={styles.label}>
        Select Their Role
      </AppText>
      {ROLES.map((r) => {
        const active = r.role === value;
        return (
          <Pressable
            key={r.role}
            onPress={() => {
              haptic.selection();
              onChange(r.role);
            }}
            style={({ pressed }) => [styles.card, active && styles.active, pressed && styles.pressed]}>
            <View style={[styles.icon, active && styles.iconActive]}>
              <Icon name={r.icon} size={20} color={colors.white} />
            </View>
            <View style={styles.flex}>
              <AppText variant="title">{r.role}</AppText>
              <AppText variant="caption" color={active ? 'rgba(255,255,255,0.85)' : colors.textSecondary}>
                {r.description}
              </AppText>
            </View>
            {active ? <Icon name="chevron-forward" size={18} color={colors.white} /> : null}
          </Pressable>
        );
      })}
      {error ? (
        <AppText variant="caption" color={colors.danger} style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  label: { marginBottom: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  active: { backgroundColor: colors.primary },
  pressed: { opacity: 0.9 },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: 'rgba(255,255,255,0.22)' },
  flex: { flex: 1 },
  error: { marginTop: -4, marginBottom: 8, marginLeft: 6 },
});
