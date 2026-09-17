import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LocationPicker } from '@/components/LocationPicker';
import { ProfilePhotoPicker } from '@/components/PhotoPicker';
import { SocialLinksEditor, type Socials } from '@/components/SocialLinksEditor';
import { Button, COUNTRY_CODES, Header, Input, PhoneInput, Screen, useToast } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { isEmail, isPhone, isZip, required } from '@/lib/validation';
import { useAuthStore } from '@/store';

function splitPhone(phone: string): { code: string; number: string } {
  const match = COUNTRY_CODES.map((c) => c.code)
    .sort((a, b) => b.length - a.length)
    .find((code) => phone.startsWith(code));
  if (!match) return { code: '+1', number: phone };
  return { code: match, number: phone.slice(match.length).trim() };
}

/** Edit Profile form, prefilled from the auth store. */
export function EditProfileScreen() {
  const router = useRouter();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const initialPhone = splitPhone(user.phone);
  const [avatar, setAvatar] = useState<string | null>(user.avatar || null);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [countryCode, setCountryCode] = useState(initialPhone.code);
  const [phone, setPhone] = useState(initialPhone.number);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [socials, setSocials] = useState<Socials>(user.socials);
  const [country, setCountry] = useState(user.country ?? '');
  const [city, setCity] = useState(user.city ?? '');
  const [location, setLocation] = useState(user.location);
  const [zipcode, setZipcode] = useState(user.zipcode ?? '');
  const [errors, setErrors] = useState<
    Partial<Record<'firstName' | 'lastName' | 'email' | 'phone' | 'displayName' | 'zipcode', string>>
  >({});
  const clear = (k: keyof typeof errors) => {
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const save = () => {
    const next: typeof errors = {};
    if (!required(firstName)) next.firstName = 'First name is required';
    if (!required(lastName)) next.lastName = 'Last name is required';
    if (!required(email)) next.email = 'Email is required';
    else if (!isEmail(email)) next.email = 'Enter a valid email address';
    if (!required(phone)) next.phone = 'Phone number is required';
    else if (!isPhone(phone)) next.phone = 'Enter a valid phone number';
    if (!required(displayName)) next.displayName = 'Display name is required';
    if (zipcode.trim() && !isZip(zipcode)) next.zipcode = 'Enter a valid zipcode';
    setErrors(next);
    if (Object.keys(next).length) {
      haptic.error();
      return;
    }
    const first = firstName.trim();
    const last = lastName.trim();
    updateUser({
      avatar: avatar ?? user.avatar,
      firstName: first,
      lastName: last,
      displayName: displayName.trim() || `${first} ${last}`.trim(),
      email: email.trim(),
      phone: `${countryCode} ${phone.trim()}`,
      bio: bio.trim(),
      socials,
      country: country.trim() || undefined,
      city: city.trim() || undefined,
      location: location.trim(),
      zipcode: zipcode.trim() || undefined,
    });
    haptic.success();
    toast('Profile updated', 'success');
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <Screen scroll keyboard edges={['top']} footer={<Button variant="white" title="Save & Continue" onPress={save} />}>
      <Header title="Edit Profile" />

      <ProfilePhotoPicker value={avatar} onChange={setAvatar} />

      <View style={styles.row}>
        <Input
          label="First Name"
          placeholder="Enter"
          value={firstName}
          onChangeText={(t) => {
            setFirstName(t);
            clear('firstName');
          }}
          error={errors.firstName}
          autoCapitalize="words"
          containerStyle={styles.half}
        />
        <Input
          label="Last Name"
          placeholder="Enter"
          value={lastName}
          onChangeText={(t) => {
            setLastName(t);
            clear('lastName');
          }}
          error={errors.lastName}
          autoCapitalize="words"
          containerStyle={styles.half}
        />
      </View>

      <Input
        label="Email Address"
        placeholder="Enter Your Email"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          clear('email');
        }}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
      />

      <PhoneInput
        label="Phone Number"
        value={phone}
        onChangeText={(t) => {
          setPhone(t);
          clear('phone');
        }}
        error={errors.phone}
        countryCode={countryCode}
        onCountryChange={setCountryCode}
      />

      <Input
        label="Display Name"
        placeholder="Enter"
        value={displayName}
        onChangeText={(t) => {
          setDisplayName(t);
          clear('displayName');
        }}
        error={errors.displayName}
        autoCapitalize="words"
      />

      <Input label="Bio" placeholder="Write A Bio" value={bio} onChangeText={setBio} multiline maxLength={200} showCounter />

      <SocialLinksEditor value={socials} onChange={setSocials} />

      <View style={styles.row}>
        <Input label="Country" placeholder="Country" value={country} onChangeText={setCountry} autoCapitalize="words" containerStyle={styles.half} />
        <Input label="City" placeholder="City" value={city} onChangeText={setCity} autoCapitalize="words" containerStyle={styles.half} />
      </View>

      <LocationPicker label="Location" value={location} onChangeText={setLocation} />

      <Input
        label="Zipcode"
        placeholder="Enter"
        value={zipcode}
        onChangeText={(t) => {
          setZipcode(t);
          clear('zipcode');
        }}
        error={errors.zipcode}
        keyboardType="number-pad"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
});

export default EditProfileScreen;
