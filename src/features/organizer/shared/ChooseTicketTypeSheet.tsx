import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomSheet, Button, Stepper } from '@/components/ui';
import type { TicketType } from '@/data/types';

import { TicketTypeCard } from './TicketTypeCard';

type Props = {
  visible: boolean;
  onClose: () => void;
  ticketTypes: TicketType[];
  onSend: (ticket: TicketType, qty: number) => void;
  loading?: boolean;
};

/** "Choose Ticket Type" sheet (complimentary tickets): selectable cards with a stepper on the active one. */
export function ChooseTicketTypeSheet({ visible, onClose, ticketTypes, onSend, loading }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(ticketTypes[0]?.id ?? null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (visible) {
      setSelectedId(ticketTypes[0]?.id ?? null);
      setQty(1);
    }
  }, [visible, ticketTypes]);

  const selected = ticketTypes.find((t) => t.id === selectedId);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Choose Ticket Type" scroll>
      {ticketTypes.map((t) => {
        const active = t.id === selectedId;
        return (
          <TicketTypeCard
            key={t.id}
            ticket={t}
            selected={active}
            onPress={() => {
              setSelectedId(t.id);
              setQty(1);
            }}
            right={active ? <Stepper value={qty} min={1} max={Math.max(1, t.maxPerOrder)} onChange={setQty} /> : undefined}
          />
        );
      })}
      <View style={styles.footer}>
        <Button title="Send Ticket" variant="white" loading={loading} disabled={!selected} onPress={() => selected && onSend(selected, qty)} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  footer: { marginTop: 4 },
});
