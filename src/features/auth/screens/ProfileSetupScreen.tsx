import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { LocationPicker } from '@/components/LocationPicker';
import { ProfilePhotoPicker } from '@/components/PhotoPicker';
import { SocialLinksEditor, type Socials } from '@/components/SocialLinksEditor';
import { AppText, Button, Header, Input, Screen } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { required } from '@/lib/validation';
import { useAuthStore } from '@/store';

export function ProfileSetupScreen() {
  const router = useRouter();
  const { user, updateUser, setLocation } = useAuthStore();

  const [avatar, setAvatar] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(user.displayName ?? '');
  const [bio, setBio] = useState('');
  const [socials, setSocials] = useState<Socials>({});
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocationText] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [zipcode, setZipcode] = useState('');
  const [errors, setErrors] = useState<{ displayName?: string }>({});

  const bioRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const zipRef = useRef<TextInput>(null);

  const save = () => {
    if (!required(displayName)) {
      setErrors({ displayName: 'Display name is required' });
      haptic.error();
      return;
    }
    haptic.success();
    updateUser({
      displayName: displayName.trim(),
      bio: bio.trim(),
      socials,
      country: country.trim() || undefined,
      city: city.trim() || undefined,
      location: location.trim(),
      zipcode: zipcode.trim() || undefined,
      ...(avatar ? { avatar } : {}),
    });
    if (location.trim()) setLocation(location.trim(), coords);
    router.push('/(auth)/permissions');
  };

  return (
    <Screen
      scroll
      keyboard
      edges={['top', 'bottom']}
      footer={<Button variant="white" title="Save & Continue" onPress={save} />}>
      <Header />
      <AppText variant="display" style={styles.title}>
        Profile Setup
      </AppText>
      <AppText secondary style={styles.subtitle}>
        Add your photo or Short Videos that recognize identity
      </AppText>

      <ProfilePhotoPicker value={avatar} onChange={setAvatar} />

      <Input
        label="Display Name"
        placeholder="Enter"
        value={displayName}
        onChangeText={(t) => {
          setDisplayName(t);
          if (errors.displayName) setErrors({});
        }}
        error={errors.displayName}
        autoComplete="name"
        textContentType="name"
        autoCapitalize="words"
        returnKeyType="next"
        onSubmitEditing={() => bioRef.current?.focus()}
      />
      <Input
        ref={bioRef}
        label="Bio"
        placeholder="Write A Bio"
        value={bio}
        onChangeText={setBio}
        multiline
        maxLength={200}
        showCounter
      />

      <SocialLinksEditor value={socials} onChange={setSocials} />

      <View style={styles.row}>
        <Input
          label="Country"
          placeholder="Country"
          value={country}
          onChangeText={setCountry}
          autoComplete="country"
          textContentType="countryName"
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => cityRef.current?.focus()}
          containerStyle={styles.half}
        />
        <Input
          ref={cityRef}
          label="City"
          placeholder="City"
          value={city}
          onChangeText={setCity}
          textContentType="addressCity"
          autoCapitalize="words"
          returnKeyType="done"
          containerStyle={styles.half}
        />
      </View>

      <LocationPicker
        label="Location"
        value={location}
        onChangeText={setLocationText}
        onLocated={(c, label) => {
          setCoords(c);
          setLocationText(label);
        }}
        textContentType="fullStreetAddress"
        returnKeyType="next"
        onSubmitEditing={() => zipRef.current?.focus()}
      />

      <Input
        ref={zipRef}
        label="Zipcode"
        placeholder="Enter"
        value={zipcode}
        onChangeText={setZipcode}
        keyboardType="number-pad"
        autoComplete="postal-code"
        textContentType="postalCode"
        returnKeyType="done"
        onSubmitEditing={save}
      />
    </Screen>
  );
}

export default ProfileSetupScreen;

const styles = StyleSheet.create({
  title: { marginTop: 8, marginBottom: 8 },
  subtitle: { marginBottom: 20, maxWidth: 300 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
});
