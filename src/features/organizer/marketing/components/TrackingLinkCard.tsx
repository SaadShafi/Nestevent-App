import { StyleSheet, View } from 'react-native';

import { AppText, Button, IconButton } from '@/components/ui';
import type { TrackingLink } from '@/data/types';
import { formatCurrency, formatNumericDate } from '@/lib/format';
import { colors, radius } from '@/theme';

import { formatNumber } from '../../utils';

type Props = { link: TrackingLink; onCopy: () => void; onMore: () => void };

/** Tracking link card: initials badge, campaign + url + created, Copy link / more, 4-column stats. */
export function TrackingLinkCard({ link, onCopy, onMore }: Props) {
  const initials = link.campaign.replace(/^DJ-/i, '').slice(0, 2).toUpperCase();
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.badge}>
          <AppText variant="h3" color={colors.primary}>
            {initials}
          </AppText>
        </View>
        <View style={styles.flex}>
          <AppText variant="h3" numberOfLines={1}>
            {link.campaign}
          </AppText>
          <AppText variant="caption" secondary numberOfLines={1}>
            {link.url}
          </AppText>
          <AppText variant="caption" muted>
            Created: {formatNumericDate(link.createdAt)}
          </AppText>
        </View>
        <Button title="Copy link" variant="white" size="sm" fullWidth={false} onPress={onCopy} />
        <IconButton name="ellipsis-horizontal" size={32} iconSize={18} backgroundColor="transparent" onPress={onMore} accessibilityLabel="More" />
      </View>
      <View style={styles.stats}>
        <Stat value={formatNumber(link.clicks)} label="Clicks" />
        <View style={styles.sep} />
        <Stat value={formatNumber(link.sales)} label="Sales" />
        <View style={styles.sep} />
        <Stat value={formatCurrency(link.revenue)} label="Revenue" />
        <View style={styles.sep} />
        <Stat value={`${link.conversion.toFixed(1)}%`} label="Conversion" />
      </View>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" muted>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, marginBottom: 12, gap: 16 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1, gap: 2 },
  badge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,107,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, gap: 2 },
  sep: { width: StyleSheet.hairlineWidth, height: 30, backgroundColor: colors.border, marginRight: 12 },
});
