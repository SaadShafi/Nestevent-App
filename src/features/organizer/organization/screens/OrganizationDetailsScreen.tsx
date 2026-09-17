import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, BrandIcon, Button, ConfirmDialog, EmptyState, Header, Icon, IconButton, Screen, StatCard, useToast } from '@/components/ui';
import { useOrganization } from '@/hooks/useEvent';
import { formatCompact } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { shareContent } from '@/lib/share';
import { useEventsStore, useOrganizerStore } from '@/store';
import { colors, layout, radius } from '@/theme';

import { StatIcon } from '../../components/StatsRow';
import { TeamCard } from '../../dashboard/components/TeamCard';
import { useMyEvents } from '../../hooks';

const HERO_H = 240;
const GLASS = 'rgba(0,0,0,0.45)';

const SOCIALS: { key: 'instagram' | 'x' | 'youtube' | 'snapchat'; icon: 'instagram' | 'x-twitter' | 'youtube' | 'snapchat'; bg: string; fg: string; base: string }[] = [
  { key: 'instagram', icon: 'instagram', bg: '#D6249F', fg: '#fff', base: 'https://instagram.com/' },
  { key: 'x', icon: 'x-twitter', bg: '#000', fg: '#fff', base: 'https://x.com/' },
  { key: 'youtube', icon: 'youtube', bg: '#FF0000', fg: '#fff', base: 'https://youtube.com/@' },
  { key: 'snapchat', icon: 'snapchat', bg: '#FFFC00', fg: '#000', base: 'https://snapchat.com/add/' },
];

/**
 * Organizer-facing organization "Details" page (Figma 72:18548): cover, logo, Edit Profile, bio,
 * contact row, stat tiles, social handles, team list, add member, view refunds.
 */
export function OrganizationDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const org = useOrganization(id);
  const events = useMyEvents();
  const team = useOrganizerStore((s) => s.team);
  const removeTeamMember = useOrganizerStore((s) => s.removeTeamMember);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!org) {
    return (
      <Screen>
        <Header title="Details" />
        <EmptyState icon="business-outline" title="Organization not found" />
      </Screen>
    );
  }

  const orgEvents = events.filter((e) => e.organizationId === org.id);
  const ticketsSold = orgEvents.reduce((n, e) => n + (e.stats?.ticketsSold ?? 0), 0);
  const earnings = orgEvents.reduce((n, e) => n + (e.stats?.revenue ?? 0), 0);
  const socials = SOCIALS.filter((s) => org.socials[s.key]);
  const pendingDelete = team.find((m) => m.id === deleteId);
  const liveEvent = orgEvents.find((e) => e.status === 'live') ?? orgEvents[0];

  const onShare = () => shareContent({ title: org.name, message: `Check out ${org.name} on Nest`, url: `https://nest.app/o/${org.id}` });

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}>
        <View style={styles.hero}>
          <Image source={{ uri: org.cover }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(11,11,11,0.9)']} style={StyleSheet.absoluteFill} />
          <View style={[styles.header, { top: insets.top }]}>
            <Header overlay title="Details" right={<IconButton name="share-social-outline" backgroundColor={GLASS} onPress={onShare} accessibilityLabel="Share" />} />
          </View>
        </View>

        <View style={styles.sheet}>
          <View style={styles.topRow}>
            <View style={styles.logoRing}>
              <Image source={{ uri: org.logo }} style={styles.logo} contentFit="cover" />
            </View>
            <View style={styles.flex}>
              <View style={styles.nameRow}>
                <AppText variant="h1" numberOfLines={1} style={styles.name}>
                  {org.name}
                </AppText>
                <Icon name="checkmark-circle" size={20} color={colors.primary} />
              </View>
              <AppText variant="caption" secondary>
                {org.categories[0] ?? org.type}
              </AppText>
              <View style={styles.locRow}>
                <Icon name="location" size={12} color={colors.primary} />
                <AppText variant="caption" secondary numberOfLines={1}>
                  {org.city ? `${org.city}${org.country ? `, ${org.country}` : ''}` : org.location ?? "Huston's Texas"}
                </AppText>
              </View>
            </View>
            <Button
              title="Edit Profile"
              variant="surface"
              size="sm"
              fullWidth={false}
              left={<Icon name="pencil" size={13} color={colors.white} />}
              onPress={() => router.push(`/organizer/create-organization?id=${org.id}`)}
            />
          </View>

          {org.description ? (
            <AppText secondary style={styles.description}>
              {org.description}
            </AppText>
          ) : null}

          <View style={styles.contact}>
            {org.phone ? (
              <Pressable onPress={() => Linking.openURL(`tel:${org.phone}`)} style={styles.contactItem}>
                <Icon name="call" size={14} color={colors.primary} />
                <AppText variant="caption">{org.phone}</AppText>
              </Pressable>
            ) : null}
            {org.email ? (
              <Pressable onPress={() => Linking.openURL(`mailto:${org.email}`)} style={[styles.contactItem, styles.flex]}>
                <Icon name="mail" size={14} color={colors.primary} />
                <AppText variant="caption" numberOfLines={1} style={styles.flex}>
                  {org.email}
                </AppText>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.stats}>
            <StatCard
              value={orgEvents.length ? formatCompact(orgEvents.length) : '211'}
              label="Events"
              icon={
                <StatIcon circle>
                  <Icon name="star-outline" size={13} color={colors.primary} />
                </StatIcon>
              }
            />
            <StatCard
              value={ticketsSold ? formatCompact(ticketsSold) : '2.3k'}
              label="Tickets Sold"
              icon={
                <StatIcon circle>
                  <Icon name="star-outline" size={13} color={colors.primary} />
                </StatIcon>
              }
            />
            <StatCard
              value={earnings ? formatCompact(earnings) : '211k'}
              label="Earnings"
              icon={
                <StatIcon circle>
                  <Icon name="logo-usd" size={13} color={colors.primary} />
                </StatIcon>
              }
            />
          </View>

          {socials.length ? (
            <>
              <AppText variant="h3" style={styles.sectionTitle}>
                Social Media
              </AppText>
              <View style={styles.socials}>
                {socials.map((s) => {
                  const handle = org.socials[s.key] ?? '';
                  return (
                    <Pressable
                      key={s.key}
                      onPress={() => Linking.openURL(handle.startsWith('http') ? handle : `${s.base}${handle.replace(/^@/, '')}`).catch(() => toast('Could not open link', 'error'))}
                      style={styles.social}
                      accessibilityLabel={`Open ${s.key}`}>
                      <View style={[styles.socialIcon, { backgroundColor: s.bg }]}>
                        <BrandIcon name={s.icon} size={16} color={s.fg} />
                      </View>
                      <AppText variant="caption" numberOfLines={1}>
                        @{handle.replace(/^@/, '').replace(/^https?:\/\/[^/]+\//, '')}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          <AppText variant="h3" style={styles.sectionTitle}>
            Team List
          </AppText>
          {team.length ? (
            team.map((m) => (
              <TeamCard key={m.id} member={m} onEdit={() => router.push(`/organizer/team/add?id=${m.id}`)} onDelete={() => setDeleteId(m.id)} />
            ))
          ) : (
            <EmptyState icon="people-outline" title="No team members yet" />
          )}

          <Button
            title="+ Add team member"
            variant="outlinePrimary"
            onPress={() => router.push('/organizer/team/add')}
            style={styles.addTeam}
          />
          <Button
            title="View Refunds Request"
            variant="white"
            onPress={() => {
              if (liveEvent) router.push(`/organizer/event/${liveEvent.id}/refunds`);
              else toast('Create an event to see refund requests', 'info');
            }}
          />
        </View>
      </ScrollView>


      <ConfirmDialog
        visible={!!pendingDelete}
        onClose={() => setDeleteId(null)}
        title="Remove team member"
        message={pendingDelete ? `Remove ${pendingDelete.name} from your team?` : undefined}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={() => {
          if (!pendingDelete) return;
          removeTeamMember(pendingDelete.id);
          haptic.success();
          toast('Team member removed', 'success');
        }}
      />
    </View>
  );
}

export default OrganizationDetailsScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  hero: { height: HERO_H, backgroundColor: colors.surface },
  sheet: {
    marginTop: -32,
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 20,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoRing: { width: 76, height: 76, borderRadius: 38, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#5A5A5A', padding: 3 },
  logo: { width: '100%', height: '100%', borderRadius: 34, backgroundColor: colors.surfaceHigh },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  description: { marginTop: 16, lineHeight: 22 },
  contact: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 18 },
  sectionTitle: { marginTop: 22, marginBottom: 12 },
  socials: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  social: { alignItems: 'center', gap: 8, flex: 1 },
  socialIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  addTeam: { marginTop: 4, marginBottom: 12 },
  header: { position: 'absolute', left: layout.screenPadding, right: layout.screenPadding },
});
