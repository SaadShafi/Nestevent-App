import { StyleSheet, View } from 'react-native';

import { AppText, Card, IconButton } from '@/components/ui';
import type { DeliveryAddress } from '@/data/types';
import { colors, radius } from '@/theme';

/** Selected delivery address summary on Checkout (name + label tag, phone, city, zip, address, edit pencil). */
export function AddressCard({ address, onEdit }: { address: DeliveryAddress; onEdit: () => void }) {
  return (
    <Card style={styles.card}>
      <View style={styles.nameRow}>
        <AppText variant="h3" numberOfLines={1} style={styles.name}>
          {address.fullName}
        </AppText>
        <View style={styles.tag}>
          <AppText variant="captionMedium">{address.label}</AppText>
        </View>
      </View>
      <AppText variant="caption" secondary>
        {address.phone}
      </AppText>
      <AppText variant="caption" secondary>
        {address.city}, {address.country}
      </AppText>
      <AppText variant="caption" secondary>
        {address.zipcode}
      </AppText>
      <AppText variant="caption" secondary>
        {address.location}
      </AppText>
      <IconButton
        name="pencil"
        size={32}
        iconSize={15}
        backgroundColor={colors.primary}
        style={styles.edit}
        onPress={onEdit}
        accessibilityLabel="Edit address"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 4, marginBottom: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 40 },
  name: { flexShrink: 1 },
  tag: { backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
  edit: { position: 'absolute', top: 12, right: 12 },
});
