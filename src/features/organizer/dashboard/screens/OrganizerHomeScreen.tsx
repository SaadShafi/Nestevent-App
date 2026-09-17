import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EventCard } from '@/components/EventCard';
import { useAppDrawer } from '@/components/navigation/AppDrawer';
import { Button, ConfirmDialog, EmptyState, Icon, Screen, SegmentTabs, useToast } from '@/components/ui';
import { useMyEvents, useMyOrganizations } from '@/features/organizer/hooks';
import { haptic } from '@/lib/haptics';
import { useOrganizerStore } from '@/store';
import { colors, layout } from '@/theme';

import { AnalyticsTab } from '../components/AnalyticsTab';
import { DashboardHeader } from '../components/DashboardHeader';
import { MarketingHubTab } from '../components/MarketingHubTab';
import { CreateOrganizationTile, OrganizationTile } from '../components/OrganizationTile';
import { TeamCard } from '../components/TeamCard';

type Tab = 'events' | 'organizations' | 'team' | 'analytics' | 'marketing';

const TABS: { key: Tab; label: string }[] = [
  { key: 'events', label: 'Events' },
  { key: 'organizations', label: 'Organizations' },
  { key: 'team', label: 'Team' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'marketing', label: 'Marketing Hub' },
];

const isTab = (v: unknown): v is Tab => TABS.some((t) => t.key === v);

/** Organizer Home tab: gradient dashboard header + Events / Organizations / Team / Analytics / Marketing Hub. */
export function OrganizerHomeScreen() {
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { drawer } = useAppDrawer();

  const events = useMyEvents();
  const organizations = useMyOrganizations();
  const team = useOrganizerStore((s) => s.team);
  const removeTeamMember = useOrganizerStore((s) => s.removeTeamMember);

  const [tab, setTab] = useState<Tab>(isTab(params.tab) ? params.tab : 'events');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isTab(params.tab)) setTab(params.tab);
  }, [params.tab]);

  const pendingDelete = team.find((m) => m.id === deleteId);

  return (
    <Screen padded={false} withTabBar scroll edges={[]} header={<DashboardHeader />}>

      <SegmentTabs variant="orange" scrollable items={TABS} value={tab} onChange={setTab} style={styles.tabs} />

      <View style={styles.body}>
        {tab === 'events' ? (
          events.length === 0 ? (
            <EmptyState icon="calendar-outline" title="No events yet" message="Tap + to create your first event." />
          ) : (
            events.map((e) => (
              <EventCard key={e.id} event={e} favoritable={false} onPress={() => router.push(`/organizer/event/${e.id}`)} />
            ))
          )
        ) : null}

        {tab === 'organizations' ? (
          <>
            {organizations.map((o) => (
              <OrganizationTile
                key={o.id}
                org={o}
                onPress={() => router.push(`/organizer/organization/${o.id}`)}
                onEdit={() => router.push(`/organizer/create-organization?id=${o.id}`)}
              />
            ))}
            <CreateOrganizationTile onPress={() => router.push('/organizer/create-organization')} />
          </>
        ) : null}

        {tab === 'team' ? (
          <>
            {team.length === 0 ? (
              <EmptyState icon="people-outline" title="No team members" message="Add door managers and event managers." />
            ) : (
              team.map((m) => (
                <TeamCard
                  key={m.id}
                  member={m}
                  onEdit={() => router.push(`/organizer/team/add?id=${m.id}`)}
                  onDelete={() => setDeleteId(m.id)}
                />
              ))
            )}
            <Button
              title="Add team member"
              variant="outlinePrimary"
              left={<Icon name="add" size={20} color={colors.primary} />}
              onPress={() => router.push('/organizer/team/add')}
              style={styles.addTeam}
            />
          </>
        ) : null}

        {tab === 'analytics' ? <AnalyticsTab /> : null}
        {tab === 'marketing' ? <MarketingHubTab /> : null}
      </View>

      <ConfirmDialog
        visible={!!pendingDelete}
        onClose={() => setDeleteId(null)}
        title="Remove team member"
        message={pendingDelete ? `Remove ${pendingDelete.name} from your team? They will lose access to your events.` : undefined}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={() => {
          if (!pendingDelete) return;
          removeTeamMember(pendingDelete.id);
          haptic.success();
          toast('Team member removed', 'success');
        }}
      />
      {drawer}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { paddingHorizontal: layout.screenPadding, paddingVertical: 16 },
  body: { paddingHorizontal: layout.screenPadding },
  addTeam: { marginTop: 4 },
});
