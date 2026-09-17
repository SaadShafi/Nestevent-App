import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LocationPicker } from '@/components/LocationPicker';
import { AppText, Button, Chip, Header, Icon, Input, PhoneInput, Screen, useToast } from '@/components/ui';
import type { DeliveryAddress } from '@/data/types';
import { uid } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { isPhone, isZip, required } from '@/lib/validation';
import { useCartStore } from '@/store';
import { colors } from '@/theme';

type Errors = Partial<Record<'fullName' | 'phone' | 'country' | 'city' | 'location' | 'zipcode', string>>;

/** Modal route: own SafeAreaProvider so the top inset is right both as an iOS sheet and full-screen (see CartScreen). */
export function DeliveryAddressScreen() {
  return (
    <SafeAreaProvider>
      <DeliveryAddressBody />
    </SafeAreaProvider>
  );
}

function DeliveryAddressBody() {
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useCartStore((s) => s.addresses.find((a) => a.id === id));
  const addAddress = useCartStore((s) => s.addAddress);
  const updateAddress = useCartStore((s) => s.updateAddress);

  const [fullName, setFullName] = useState(existing?.fullName ?? '');
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState(existing?.phone.replace(/^\+\d+\s?/, '') ?? '');
  const [country, setCountry] = useState(existing?.country ?? '');
  const [city, setCity] = useState(existing?.city ?? '');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [zipcode, setZipcode] = useState(existing?.zipcode ?? '');
  const [label, setLabel] = useState<DeliveryAddress['label']>(existing?.label ?? 'Home');
  const [isDefault, setIsDefault] = useState(existing?.isDefault ?? true);
  const [errors, setErrors] = useState<Errors>({});

  const validate = () => {
    const e: Errors = {};
    if (!required(fullName)) e.fullName = 'Full name is required';
    if (!required(phone)) e.phone = 'Phone number is required';
    else if (!isPhone(phone)) e.phone = 'Enter a valid phone number';
    if (!required(country)) e.country = 'Required';
    if (!required(city)) e.city = 'Required';
    if (!required(location)) e.location = 'Location is required';
    if (!required(zipcode)) e.zipcode = 'Zipcode is required';
    else if (!isZip(zipcode)) e.zipcode = 'Zipcode must be numeric';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clear = (k: keyof Errors) => {
    if (errors[k]) setErrors((cur) => ({ ...cur, [k]: undefined }));
  };
  const bind = <T extends keyof Errors>(k: T, set: (v: string) => void) => (v: string) => {
    set(v);
    clear(k);
  };

  const save = () => {
    if (!validate()) {
      haptic.error();
      return;
    }
    const address: DeliveryAddress = {
      id: existing?.id ?? uid('addr'),
      fullName: fullName.trim(),
      phone: `${countryCode} ${phone.trim()}`,
      country: country.trim(),
      city: city.trim(),
      location: location.trim(),
      zipcode: zipcode.trim(),
      label,
      isDefault,
    };
    if (existing) updateAddress(address);
    else addAddress(address);
    haptic.success();
    toast(existing ? 'Address updated' : 'Address saved', 'success');
    router.back();
  };

  return (
    <Screen scroll keyboard footer={<Button title="Save" variant="white" onPress={save} />}>
      <Header title={existing ? 'Edit Delivery Address' : 'Add Delivery Address'} left="close" />
      <Input label="Full Name" placeholder="Enter" value={fullName} onChangeText={bind('fullName', setFullName)} error={errors.fullName} autoCapitalize="words" />
      <PhoneInput
        label="Number"
        value={phone}
        onChangeText={bind('phone', setPhone)}
        countryCode={countryCode}
        onCountryChange={setCountryCode}
        error={errors.phone}
      />
      <View style={styles.row}>
        <Input label="Country" placeholder="Country" value={country} onChangeText={bind('country', setCountry)} error={errors.country} containerStyle={styles.half} autoCapitalize="words" />
        <Input label="City" placeholder="City" value={city} onChangeText={bind('city', setCity)} error={errors.city} containerStyle={styles.half} autoCapitalize="words" />
      </View>
      <LocationPicker label="Location" value={location} onChangeText={bind('location', setLocation)} error={errors.location} />
      <Input label="Zipcode" placeholder="Enter" value={zipcode} onChangeText={bind('zipcode', setZipcode)} error={errors.zipcode} keyboardType="number-pad" />

      <AppText variant="label" style={styles.label}>
        Select A Label For Effective Delivery
      </AppText>
      <View style={styles.chips}>
        <Chip label="Home" selected={label === 'Home'} removable onPress={() => setLabel('Home')} />
        <Chip label="Office" selected={label === 'Office'} removable onPress={() => setLabel('Office')} />
      </View>

      <Pressable
        onPress={() => {
          haptic.selection();
          setIsDefault((v) => !v);
        }}
        style={styles.checkRow}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isDefault }}>
        <View style={[styles.checkbox, isDefault && styles.checkboxOn]}>
          {isDefault ? <Icon name="checkmark" size={14} color={colors.white} /> : null}
        </View>
        <AppText variant="body">Make Default Delivery Address</AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  label: { marginBottom: 12, marginTop: 4 },
  chips: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
});
