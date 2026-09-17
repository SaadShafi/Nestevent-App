import { forwardRef, useState } from 'react';
import { ActivityIndicator, Pressable, type TextInput } from 'react-native';

import { Icon, Input, type InputProps, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { isLocationError, locate, openLocationSettings, reverseGeocode, type Coords } from '@/lib/location';
import { colors } from '@/theme';

type Props = Omit<InputProps, 'right'> & {
  onLocated?: (coords: Coords, label: string) => void;
};

/**
 * "Enter Location" input with a crosshair button that fills the field from GPS
 * (expo-location, highest accuracy + reverse geocode to a full street address).
 * Used by Profile Setup, Edit Profile, Add Delivery Address, Filter, Create Event.
 */
export const LocationPicker = forwardRef<TextInput, Props>(function LocationPicker({ onLocated, onChangeText, ...rest }, ref) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const locateMe = async () => {
    if (busy) return;
    setBusy(true);
    haptic.light();
    const res = await locate();
    if (isLocationError(res)) {
      haptic.error();
      if (res.error === 'denied') {
        toast('Location permission is required', 'error', { label: 'Open Settings', onPress: openLocationSettings });
      } else {
        toast('Could not get your location. Try again.', 'error');
      }
      setBusy(false);
      return;
    }
    const full = (await reverseGeocode(res.coords)) ?? res.label;
    onChangeText?.(full);
    onLocated?.(res.coords, full);
    haptic.success();
    setBusy(false);
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
          <Pressable onPress={locateMe} hitSlop={10} accessibilityRole="button" accessibilityLabel="Use current location">
            <Icon name="locate-outline" size={20} color={colors.text} />
          </Pressable>
        )
      }
      {...rest}
    />
  );
});
