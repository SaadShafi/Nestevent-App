import * as Location from 'expo-location';
import { forwardRef, useState } from 'react';
import { ActivityIndicator, Pressable, type TextInput } from 'react-native';

import { Icon, Input, type InputProps, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { reverseGeocode, type Coords } from '@/lib/location';
import { colors } from '@/theme';

export type LocatedAddress = {
  coords: Coords;
  /** Full street address ("12 Main St, Indio, California, 92201, United States"). */
  label: string;
  city?: string;
  country?: string;
  zipcode?: string;
};

type Props = Omit<InputProps, 'right'> & {
  onLocated?: (address: LocatedAddress) => void;
};

/**
 * Create Event "Location" input. The crosshair fetches an *exact* GPS fix
 * (expo-location `Accuracy.Highest`), reverse-geocodes it and reports coords + address parts
 * so the Review map pin lands on the venue. Denied permission → error toast.
 */
export const EventLocationPicker = forwardRef<TextInput, Props>(function EventLocationPicker({ onLocated, onChangeText, ...rest }, ref) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const locate = async () => {
    if (busy) return;
    haptic.light();
    setBusy(true);
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        ({ status } = await Location.requestForegroundPermissionsAsync());
      }
      if (status !== 'granted') {
        haptic.error();
        toast('Location permission is required to use your current location', 'error');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const coords: Coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };

      let city: string | undefined;
      let country: string | undefined;
      let zipcode: string | undefined;
      let label: string | null = null;
      try {
        const [addr] = await Location.reverseGeocodeAsync(coords);
        if (addr) {
          city = addr.city ?? addr.subregion ?? undefined;
          country = addr.country ?? undefined;
          zipcode = addr.postalCode ?? undefined;
          label = [addr.streetNumber, addr.street, addr.city, addr.region, addr.postalCode, addr.country].filter(Boolean).join(', ');
        }
      } catch {
        label = await reverseGeocode(coords);
      }
      if (!label) label = `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`;

      onChangeText?.(label);
      onLocated?.({ coords, label, city, country, zipcode });
      haptic.success();
    } catch {
      haptic.error();
      toast('Could not get your location. Check that GPS is enabled.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Input
      ref={ref}
      placeholder="Enter Location"
      onChangeText={onChangeText}
      right={
        busy ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Pressable onPress={locate} hitSlop={10} accessibilityRole="button" accessibilityLabel="Use current location">
            <Icon name="locate-outline" size={20} color={colors.text} />
          </Pressable>
        )
      }
      {...rest}
    />
  );
});
