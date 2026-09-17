import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AppText, Button, Header, Screen, useToast } from '@/components/ui';
import { avatar } from '@/data/images';
import { haptic } from '@/lib/haptics';
import { useAuthStore, useOrganizerStore } from '@/store';

import { roleDescription } from '../../shared/RoleSelect';
import { TeamMemberCard } from '../../shared/TeamMemberCard';
import { emptyMemberForm, hasErrors, TeamMemberForm, validateMemberForm, type TeamMemberFormErrors, type TeamMemberFormValue } from '../../shared/TeamMemberForm';
import { WizardHeading } from '../../shared/WizardHeading';

/** Team & Roles — onboarding step after Create Organization. */
export function TeamRolesScreen() {
  const router = useRouter();
  const toast = useToast();
  const team = useOrganizerStore((s) => s.team);
  const addTeamMember = useOrganizerStore((s) => s.addTeamMember);
  const removeTeamMember = useOrganizerStore((s) => s.removeTeamMember);
  const setOrganizationDone = useAuthStore((s) => s.setOrganizationDone);

  const [form, setForm] = useState<TeamMemberFormValue>(emptyMemberForm);
  const [errors, setErrors] = useState<TeamMemberFormErrors>({});
  const patch = (p: Partial<TeamMemberFormValue>) => {
    setForm((f) => ({ ...f, ...p }));
    setErrors((e) => {
      const next = { ...e };
      (Object.keys(p) as (keyof TeamMemberFormValue)[]).forEach((k) => {
        if (k in next) delete next[k as keyof TeamMemberFormErrors];
      });
      return next;
    });
  };

  const addMember = () => {
    const err = validateMemberForm(form);
    setErrors(err);
    if (hasErrors(err)) {
      haptic.error();
      toast('Please fix the highlighted fields', 'error');
      return false;
    }
    addTeamMember({
      name: form.name.trim(),
      avatar: form.photo ?? avatar(30 + team.length),
      role: form.role,
      roleDescription: roleDescription(form.role),
      phone: form.phone ? `${form.countryCode} ${form.phone}` : '—',
      email: form.email.trim() || '—',
    });
    haptic.success();
    toast(`${form.name.trim()} added to your team`, 'success');
    setForm(emptyMemberForm());
    return true;
  };

  const finish = () => {
    setOrganizationDone(true);
    router.push('/organizer/organization-success');
  };

  const isDirty = () => !!(form.name.trim() || form.email.trim() || form.phone.trim() || form.photo);

  const saveAndContinue = () => {
    // If the form has an unsaved member, add it first (blocked until it validates).
    if (isDirty() && !addMember()) return;
    finish();
  };

  return (
    <Screen scroll keyboard footer={<Button title="Save & Continue" variant="white" onPress={saveAndContinue} />}>
      <Header left="back" right={<Button title="Skip" variant="outlinePrimary" size="sm" fullWidth={false} onPress={finish} />} />
      <WizardHeading title="Team & Roles" subtitle="Point of contact and team assignment." />

      <TeamMemberForm value={form} onChange={patch} errors={errors} submitLabel="+ Add team member" onSubmit={addMember} />

      <AppText variant="label" style={styles.listLabel}>
        Team list
      </AppText>
      {team.length === 0 ? (
        <AppText secondary style={styles.empty}>
          No team members yet. Add a point of contact above.
        </AppText>
      ) : (
        team.map((m) => (
          <TeamMemberCard
            key={m.id}
            member={m}
            onPress={() => router.push({ pathname: '/organizer/team/add', params: { id: m.id } })}
            onDelete={() => {
              haptic.medium();
              removeTeamMember(m.id);
            }}
          />
        ))
      )}
    </Screen>
  );
}

export default TeamRolesScreen;

const styles = StyleSheet.create({
  listLabel: { marginBottom: 10 },
  empty: { marginBottom: 16 },
});
