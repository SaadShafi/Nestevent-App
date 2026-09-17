import { useRouter } from 'expo-router';

import { Button, EmptyState, Header, Screen } from '@/components/ui';
import { useOrganizerStore } from '@/store';

import { PromoCard } from '../components/PromoCard';

/** Marketing Hub → Promo codes list. */
export function PromoCodesScreen() {
  const router = useRouter();
  const promos = useOrganizerStore((s) => s.promoCodes);

  return (
    <Screen
      scroll
      footer={<Button title="Create promo" variant="white" onPress={() => router.push('/organizer/marketing/promo-codes/create')} />}>
      <Header title="Promo codes" />
      {promos.length === 0 ? (
        <EmptyState icon="pricetag-outline" title="No promo codes" message="Create a discount campaign to boost sales." />
      ) : (
        promos.map((p) => <PromoCard key={p.id} promo={p} onPress={() => router.push(`/organizer/marketing/promo-codes/${p.id}`)} />)
      )}
    </Screen>
  );
}
