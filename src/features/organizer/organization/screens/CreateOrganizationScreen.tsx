import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { pickImages, ProfilePhotoPicker, UploadDropzone } from '@/components/PhotoPicker';
import { SocialLinksEditor, type Socials } from '@/components/SocialLinksEditor';
import { AppText, Button, Chip, Header, Icon, Input, PhoneInput, Screen, Select, useToast } from '@/components/ui';
import { IMG } from '@/data/images';
import { ORG_CATEGORIES, ORG_TYPES } from '@/data/mock';
import type { Organization } from '@/data/types';
import { uid } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useOrganization } from '@/hooks/useEvent';
import { isEmail, isPhone, required } from '@/lib/validation';
import { useAuthStore, useEventsStore } from '@/store';
import { colors, radius } from '@/theme';

import { EventLocationPicker } from '../../shared/EventLocationPicker';
import { WizardHeading } from '../../shared/WizardHeading';

const TYPE_OPTIONS = ORG_TYPES.map((t) => ({ value: t, label: t }));

/** Create Organization (organizer onboarding) — also edits an existing org via ?id=. */
export function CreateOrganizationScreen() {
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useOrganization(id);
  const editing = !!existing;

  const user = useAuthStore((s) => s.user);
  const setOrganizationDone = useAuthStore((s) => s.setOrganizationDone);
  const upsertOrganization = useEventsStore((s) => s.upsertOrganization);

  const [cover, setCover] = useState<string | null>(existing?.cover ?? null);
  const [photo, setPhoto] = useState<string | null>(existing?.logo ?? null);
  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<string | null>(existing?.type ?? null);
  const [description, setDescription] = useState(existing?.description ?? '');
  const [categories, setCategories] = useState<string[]>(existing?.categories ?? ['Promoter']);
  const [email, setEmail] = useState(existing?.email ?? '');
  // Stored phones are "+1 555 123 4567"; split the dial code back out so saving doesn't double it.
  const [phone, setPhone] = useState(existing?.phone.replace(/^\+\d+\s*/, '') ?? '');
  const [countryCode, setCountryCode] = useState(existing?.phone.match(/^\+\d+/)?.[0] ?? '+1');
  const [socials, setSocials] = useState<Socials>(existing?.socials ?? {});
  const [country, setCountry] = useState(existing?.country ?? '');
  const [city, setCity] = useState(existing?.city ?? '');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [zipcode, setZipcode] = useState(existing?.zipcode ?? '');
  const [errors, setErrors] = useState<{ name?: string; type?: string; email?: string; phone?: string }>({});
  const clearError = (key: keyof typeof errors) => setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));

  const pickCover = async () => {
    haptic.light();
    const [uri] = await pickImages();
    if (uri) setCover(uri);
  };

  const toggleCategory = (c: string) =>
    setCategories((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));

  const skip = () => {
    setOrganizationDone(true);
    router.replace('/(organizer)/(tabs)/home');
  };

  const save = () => {
    const next: typeof errors = {};
    if (!required(name)) next.name = 'Organization name is required';
    if (!type) next.type = 'Select an organization type';
    if (!required(email)) next.email = 'Email address is required';
    else if (!isEmail(email)) next.email = 'Enter a valid email';
    if (!required(phone)) next.phone = 'Phone number is required';
    else if (!isPhone(phone)) next.phone = 'Enter a valid phone number';
    setErrors(next);
    if (Object.keys(next).length) {
      haptic.error();
      return;
    }
    const org: Organization = {
      id: existing?.id ?? uid('org'),
      name: name.trim(),
      logo: photo ?? existing?.logo ?? user.avatar,
      cover: cover ?? existing?.cover ?? IMG.orgTulips,
      type: type ?? 'Promoter',
      category: categories[0] ?? existing?.category ?? 'Music',
      description: description.trim(),
      followers: existing?.followers ?? 0,
      rating: existing?.rating ?? 0,
      ratingCount: existing?.ratingCount ?? 0,
      verified: existing?.verified ?? false,
      categories,
      email: email.trim(),
      phone: phone ? `${countryCode} ${phone}` : '',
      socials,
      country,
      city,
      location,
      zipcode,
      ownerId: 'me',
    };
    upsertOrganization(org);
    haptic.success();
    if (editing) {
      toast('Organization updated', 'success');
      router.back();
      return;
    }
    router.push('/organizer/team-roles');
  };

  return (
    <Screen
      scroll
      keyboard
      footer={<Button title="Save & Continue" variant="white" onPress={save} />}>
      <Header
        left="back"
        right={editing ? undefined : <Button title="Skip" variant="outlinePrimary" size="sm" fullWidth={false} onPress={skip} />}
      />
      <WizardHeading
        title={editing ? 'Edit Organization' : 'Create Organization'}
        subtitle={editing ? 'Update your organization details.' : 'Start organization inside existing account.'}
      />

      {cover ? (
        <View style={styles.coverWrap}>
          <Image source={{ uri: cover }} style={styles.cover} contentFit="cover" />
          <Pressable onPress={() => setCover(null)} style={styles.remove} hitSlop={6} accessibilityLabel="Remove cover">
            <View style={styles.removeDot}>
              <Icon name="close" size={9} color={colors.white} />
            </View>
            <AppText variant="caption">Remove</AppText>
          </Pressable>
        </View>
      ) : (
        <UploadDropzone title="Upload Files" subtitle="Upload profile Cover" cta="Upload" onPick={pickCover} />
      )}

      <AppText variant="label" style={styles.label}>
        Profile Picture
      </AppText>
      <ProfilePhotoPicker value={photo} onChange={setPhoto} />

      <Input label="Organization Name" placeholder="NightBloom" value={name}
        onChangeText={(t) => {
          setName(t);
          clearError('name');
        }}
        error={errors.name} autoCapitalize="words" />
      <Select label="Organization Type" options={TYPE_OPTIONS}
        value={type}
        onChange={(v) => {
          setType(v);
          clearError('type');
        }}
        error={errors.type} sheetTitle="Organization Type" />
      <Input
        label="Description"
        placeholder="Brand Bio And Purpose"
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={200}
      />

      <AppText variant="label" style={styles.label}>
        Categories
      </AppText>
      <View style={styles.chips}>
        {ORG_CATEGORIES.map((c) => (
          <Chip key={c} label={c} selected={categories.includes(c)} removable onPress={() => toggleCategory(c)} />
        ))}
      </View>

      <Input
        label="Email Address"
        placeholder="Enter Your Email"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          clearError('email');
        }}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <PhoneInput
        label="Phone Number"
        value={phone}
        onChangeText={(t) => {
          setPhone(t);
          clearError('phone');
        }}
        countryCode={countryCode}
        onCountryChange={setCountryCode}
        error={errors.phone}
      />

      <SocialLinksEditor value={socials} onChange={setSocials} />

      <View style={styles.row}>
        <Input label="Country" placeholder="Country" value={country} onChangeText={setCountry} containerStyle={styles.flex} />
        <Input label="City" placeholder="City" value={city} onChangeText={setCity} containerStyle={styles.flex} />
      </View>
      <EventLocationPicker
        label="Location"
        value={location}
        onChangeText={setLocation}
        onLocated={(a) => {
          setLocation(a.label);
          if (a.city) setCity(a.city);
          if (a.country) setCountry(a.country);
          if (a.zipcode) setZipcode(a.zipcode);
        }}
      />
      <Input label="Zipcode" placeholder="Enter" value={zipcode} onChangeText={setZipcode} keyboardType="number-pad" />
    </Screen>
  );
}

export default CreateOrganizationScreen;

const styles = StyleSheet.create({
  label: { marginBottom: 10 },
  coverWrap: { height: 150, borderRadius: radius.xl, overflow: 'hidden', marginBottom: 16, backgroundColor: colors.surface },
  cover: { ...StyleSheet.absoluteFill },
  remove: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  removeDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});
