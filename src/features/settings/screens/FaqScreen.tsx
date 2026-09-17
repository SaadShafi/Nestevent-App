import { useState } from 'react';

import { Header, Screen } from '@/components/ui';
import { FAQS } from '@/data/mock';

import { FaqItem } from '../components/FaqItem';

/** FAQ accordion; the first item is open by default. */
export function FaqScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <Screen scroll>
      <Header title="FAQ's" />
      {FAQS.map((f, i) => (
        <FaqItem key={f.q} question={f.q} answer={f.a} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
      ))}
    </Screen>
  );
}

export default FaqScreen;
