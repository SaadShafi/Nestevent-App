import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { AppText, Button, Header, Screen, useToast } from '@/components/ui';
import { avatar } from '@/data/images';
import { useMyEvents } from '@/features/organizer/hooks';
import { haptic } from '@/lib/haptics';
import { useOrganizerStore } from '@/store';

import { roleDescription } from '../../shared/RoleSelect';
import { TeamMemberCard } from '../../shared/TeamMemberCard';
import { emptyMemberForm, hasErrors, TeamMemberForm, validateMemberForm, type TeamMemberFormErrors, type TeamMemberFormValue } from '../../shared/TeamMemberForm';

/** Add New Team & Roles — add or edit (?id=) a team member. */
export function AddTeamMemberScreen() {
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const team = useOrganizerStore((s) => s.team);
  const addTeamMember = useOrganizerStore((s) => s.addTeamMember);
  const updateTeamMember = useOrganizerStore((s) => s.updateTeamMember);
  const removeTeamMember = useOrganizerStore((s) => s.removeTeamMember);
  const events = useMyEvents();
  const eventOptions = useMemo(() => events.map((e) => ({ value: e.id, label: e.title })), [events]);

  const editing = team.find((m) => m.id === id);
  const [form, setForm] = useState<TeamMemberFormValue>(() =>
    editing
      ? {
          photo: editing.avatar,
          name: editing.name,
          email: editing.email === '—' ? '' : editing.email,
          phone: editing.phone.replace(/^\+\d+\s/, ''),
          countryCode: '+1',
          role: editing.role,
          eventId: editing.eventId ?? null,
        }
      : emptyMemberForm(),
  );
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

  const submit = () => {
    const err = validateMemberForm(form);
    setErrors(err);
    if (hasErrors(err)) {
      haptic.error();
      toast('Please fix the highlighted fields', 'error');
      return false;
    }
    const base = {
      name: form.name.trim(),
      avatar: form.photo ?? editing?.avatar ?? avatar(30 + team.length),
      role: form.role,
      roleDescription: roleDescription(form.role),
      phone: form.phone ? `${form.countryCode} ${form.phone}` : '—',
      email: form.email.trim() || '—',
      eventId: form.eventId ?? undefined,
    };
    if (editing) {
      updateTeamMember({ ...base, id: editing.id });
      haptic.success();
      toast('Team member updated', 'success');
      router.back();
      return true;
    }
    addTeamMember(base);
    haptic.success();
    toast(`${base.name} added to your team`, 'success');
    setForm(emptyMemberForm());
    return true;
  };

  const isDirty = () => !!(form.name.trim() || form.email.trim() || form.phone.trim() || form.photo);

  const saveAndContinue = () => {
    if (editing) {
      submit();
      return;
    }
    if (isDirty() && !submit()) return;
    router.back();
  };

  return (
    <Screen scroll keyboard footer={<Button title="Save & Continue" variant="white" onPress={saveAndContinue} />}>
      <Header title={editing ? 'Edit Team Member' : 'Add New Team & Roles'} />
      <TeamMemberForm
        photoFirst
        value={form}
        onChange={patch}
        errors={errors}
        events={eventOptions}
        submitLabel={editing ? 'Update team member' : '+ Add team member'}
        onSubmit={submit}
      />

      <AppText variant="label" style={styles.listLabel}>
        Team List
      </AppText>
      {team.length === 0 ? (
        <AppText secondary style={styles.empty}>
          No team members yet.
        </AppText>
      ) : (
        team.map((m) => (
          <TeamMemberCard
            key={m.id}
            member={m}
            onPress={m.id === id ? undefined : () => router.setParams({ id: m.id })}
            onDelete={() => {
              haptic.medium();
              removeTeamMember(m.id);
              if (m.id === id) router.back();
            }}
          />
        ))
      )}
    </Screen>
  );
}

export default AddTeamMemberScreen;

const styles = StyleSheet.create({
  listLabel: { marginBottom: 10 },
  empty: { marginBottom: 16 },
});
