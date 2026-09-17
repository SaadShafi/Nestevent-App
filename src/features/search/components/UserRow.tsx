import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, Button } from '@/components/ui';
import { colors } from '@/theme';

export type SearchPerson = {
  id: string;
  name: string;
  avatar: string;
  kind: 'people' | 'promoter';
  /** "12 Mutual Friends" or "25k followers" */
  meta: string;
};

/** Avatar + name + orange caption + "View Profile" pill (Users quick filter / Recent Search). */
export function UserRow({ person, onView }: { person: SearchPerson; onView: () => void }) {
  return (
    <View style={styles.row}>
      <Avatar uri={person.avatar} size={48} />
      <View style={styles.flex}>
        <AppText variant="title" numberOfLines={1}>
          {person.name}
        </AppText>
        <AppText variant="captionMedium" color={colors.primary} numberOfLines={1}>
          {person.kind === 'promoter' ? 'Promoter' : 'People'} • {person.meta}
        </AppText>
      </View>
      <Button title="View Profile" variant="white" size="sm" fullWidth={false} onPress={onView} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  flex: { flex: 1 },
});
