import { StyleSheet, View } from 'react-native';

import { ProfilePhotoPicker } from '@/components/PhotoPicker';
import { Button, Input, PhoneInput, Select } from '@/components/ui';
import { isEmail, isPhone, required } from '@/lib/validation';

import { RoleSelect, type TeamRole } from './RoleSelect';

export type TeamMemberFormValue = {
  photo: string | null;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  role: TeamRole;
  eventId: string | null;
};

export type TeamMemberFormErrors = { name?: string; email?: string; phone?: string; role?: string };

export const emptyMemberForm = (): TeamMemberFormValue => ({
  photo: null,
  name: '',
  email: '',
  phone: '',
  countryCode: '+1',
  role: 'Event Manager',
  eventId: null,
});

/** Field-level validation. Returns an empty object when the form is valid. */
export function validateMemberForm(v: TeamMemberFormValue): TeamMemberFormErrors {
  const e: TeamMemberFormErrors = {};
  if (!required(v.name)) e.name = 'Enter the point of contact name';
  if (!required(v.email)) e.email = 'Email address is required';
  else if (!isEmail(v.email)) e.email = 'Enter a valid email address';
  if (!required(v.phone)) e.phone = 'Phone number is required';
  else if (!isPhone(v.phone)) e.phone = 'Enter a valid phone number';
  if (!v.role) e.role = 'Select a role';
  return e;
}

export const hasErrors = (e: TeamMemberFormErrors) => Object.keys(e).length > 0;

type Props = {
  value: TeamMemberFormValue;
  onChange: (patch: Partial<TeamMemberFormValue>) => void;
  errors?: TeamMemberFormErrors;
  /** Event picker options (Add Team screen). Omitted on onboarding. */
  events?: { value: string; label: string }[];
  submitLabel: string;
  onSubmit: () => void;
  photoFirst?: boolean;
};

/** Shared form body for Team & Roles (onboarding) and Add New Team & Roles. */
export function TeamMemberForm({ value, onChange, errors = {}, events, submitLabel, onSubmit, photoFirst }: Props) {
  const photo = <ProfilePhotoPicker value={value.photo} onChange={(uri) => onChange({ photo: uri })} />;
  return (
    <View>
      {photoFirst ? photo : null}
      <Input
        label="Point Of Contact"
        placeholder="Alex Morgan"
        value={value.name}
        onChangeText={(t) => onChange({ name: t })}
        autoCapitalize="words"
        error={errors.name}
      />
      <Input
        label="Email Address"
        placeholder="Enter Your Email"
        value={value.email}
        onChangeText={(t) => onChange({ email: t })}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email}
      />
      <PhoneInput
        label="Phone Number"
        value={value.phone}
        onChangeText={(t) => onChange({ phone: t })}
        countryCode={value.countryCode}
        onCountryChange={(code) => onChange({ countryCode: code })}
        error={errors.phone}
      />
      {events ? <Select label="Select Event" options={events} value={value.eventId} onChange={(id) => onChange({ eventId: id })} sheetTitle="Select Event" /> : null}
      <RoleSelect value={value.role} onChange={(role) => onChange({ role })} error={errors.role} />
      {!photoFirst ? photo : null}
      <Button title={submitLabel} variant="outlinePrimary" onPress={onSubmit} style={styles.add} />
    </View>
  );
}

const styles = StyleSheet.create({
  add: { marginBottom: 20 },
});
