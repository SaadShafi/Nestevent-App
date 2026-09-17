import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GradientHeader } from '@/components/GradientHeader';
import { HeaderGlassButton, HomeHeaderBar } from '@/components/HomeHeaderBar';
import { FigmaIcon } from '@/components/icons/FigmaIcon';
import { Icon, StatCard } from '@/components/ui';
import { LocationSheet } from '@/features/home/components/LocationSheet';
import { useMyEvents } from '@/features/organizer/hooks';
import { formatCompact, formatCurrency } from '@/lib/format';
import { useAuthStore, useChatStore, useOrganizerStore } from '@/store';
import { colors } from '@/theme';

import { StatIcon } from '../../components/StatsRow';

/** Orange gradient header: white logo, location, "+" / chat actions and the three glass stat tiles. */
export function DashboardHeader() {
  const router = useRouter();
  const locationLabel = useAuthStore((s) => s.locationLabel);
  const resetDraft = useOrganizerStore((s) => s.resetDraft);
  const hasUnreadChats = useChatStore((s) => s.conversations.some((c) => c.unread > 0));
  const events = useMyEvents();
  const [locationOpen, setLocationOpen] = useState(false);

  const stats = useMemo(() => {
    const tickets = events.reduce((n, e) => n + (e.stats?.ticketsSold ?? 0), 0);
    const earnings = events.reduce((n, e) => n + (e.stats?.revenue ?? 0), 0);
    return {
      events: formatCompact(events.length),
      tickets: formatCompact(tickets),
      earnings: formatCurrency(earnings, { compact: true }),
    };
  }, [events]);

  return (
    <GradientHeader>
      <HomeHeaderBar
        caption="Your location"
        location={locationLabel}
        onLocationPress={() => setLocationOpen(true)}
        right={
          <>
            <HeaderGlassButton
              onPress={() => {
                resetDraft();
                router.push('/organizer/create-event');
              }}
              accessibilityLabel="Create event">
              <Icon name="add" size={24} color={colors.white} />
            </HeaderGlassButton>
            <HeaderGlassButton onPress={() => router.push('/messages')} accessibilityLabel="Messages" badge={hasUnreadChats}>
              <FigmaIcon name="message" size={24} color={colors.white} />
            </HeaderGlassButton>
          </>
        }
      />

      <View style={styles.stats}>
        <StatCard
          variant="glass"
          value={stats.events}
          label="Events"
          icon={
            <StatIcon circle>
              <Icon name="calendar-outline" size={13} color={colors.primary} />
            </StatIcon>
          }
        />
        <StatCard
          variant="glass"
          value={stats.tickets}
          label="Tickets Sold"
          icon={
            <StatIcon circle>
              <Icon name="ticket-outline" size={13} color={colors.primary} />
            </StatIcon>
          }
        />
        <StatCard
          variant="glass"
          value={stats.earnings}
          label="Earnings"
          icon={
            <StatIcon circle>
              <Icon name="logo-usd" size={13} color={colors.primary} />
            </StatIcon>
          }
        />
      </View>

      <LocationSheet visible={locationOpen} onClose={() => setLocationOpen(false)} />
    </GradientHeader>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 10, marginTop: 18 },
});
