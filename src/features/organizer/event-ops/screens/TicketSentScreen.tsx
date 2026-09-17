import { useLocalSearchParams, useRouter } from 'expo-router';

import { SuccessScreen } from '@/components/SuccessScreen';

/** "Ticket Sent Successfully" — after sending a complimentary ticket. */
export function TicketSentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SuccessScreen
      title="Ticket Sent Successfully"
      message="The ticket has been delivered to the guest's account."
      ctaLabel="Back to event"
      showBack={false}
      onCta={() => {
        if (id) router.dismissTo(`/organizer/event/${id}`);
        else router.back();
      }}
    />
  );
}

export default TicketSentScreen;
