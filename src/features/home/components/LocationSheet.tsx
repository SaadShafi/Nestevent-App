import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText, BottomSheet, Icon, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { isLocationError, locate, openLocationSettings } from '@/lib/location';
import { useAuthStore } from '@/store';
import { colors, radius } from '@/theme';

const CITIES = [
  'Indio, California, USA',
  'Los Angeles, California, USA',
  'New York, New York, USA',
  'Houston, Texas, USA',
  'Las Vegas, Nevada, USA',
];

type Props = { visible: boolean; onClose: () => void };

/** "You location" picker opened from the Home header chevron. */
export function LocationSheet({ visible, onClose }: Props) {
  const toast = useToast();
  const current = useAuthStore((s) => s.locationLabel);
  const setLocation = useAuthStore((s) => s.setLocation);
  const [busy, setBusy] = useState(false);

  const useCurrent = async () => {
    setBusy(true);
    const res = await locate();
    setBusy(false);
    if (isLocationError(res)) {
      haptic.error();
      if (res.error === 'denied') {
        onClose();
        toast('Location permission is required', 'error', { label: 'Open Settings', onPress: openLocationSettings });
      } else {
        toast('Could not get your location. Try again.', 'error');
      }
      return;
    }
    haptic.success();
    setLocation(res.label, res.coords);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Your location">
      <Pressable onPress={useCurrent} disabled={busy} style={({ pressed }) => [styles.current, pressed && styles.pressed]}>
        <View style={styles.currentIcon}>
          {busy ? <ActivityIndicator color={colors.white} size="small" /> : <Icon name="locate" size={18} color={colors.white} />}
        </View>
        <View style={styles.flex}>
          <AppText variant="title">Use current location</AppText>
          <AppText variant="caption" secondary>
            Find events happening around you
          </AppText>
        </View>
        <Icon name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
      <AppText variant="caption" muted style={styles.label}>
        Popular cities
      </AppText>
      {CITIES.map((city) => {
        const active = city === current;
        return (
          <Pressable
            key={city}
            onPress={() => {
              haptic.selection();
              setLocation(city, null);
              onClose();
            }}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <Icon name="location-outline" size={18} color={active ? colors.primary : colors.textSecondary} />
            <AppText variant={active ? 'title' : 'body'} style={styles.flex}>
              {city}
            </AppText>
            {active ? <Icon name="checkmark-circle" size={20} color={colors.primary} /> : null}
          </Pressable>
        );
      })}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  current: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 16,
  },
  currentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { marginBottom: 6, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 4 },
  pressed: { opacity: 0.7 },
});
