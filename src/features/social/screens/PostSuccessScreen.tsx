import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { SuccessScreen } from '@/components/SuccessScreen';
import { useAuthStore } from '@/store';

/** "Post successfully!" — auto-returns to the feed after a short delay. */
export function PostSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      const r = router as typeof router & { dismissAll?: () => void };
      if (typeof r.dismissAll === 'function') {
        r.dismissAll();
      } else {
        const role = useAuthStore.getState().role;
        router.replace(role === 'organizer' ? '/(organizer)/(tabs)/social' : '/(guest)/(tabs)/social');
      }
    }, 1600);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <SuccessScreen
      title="Post successfully!"
      message="Enjoy Events picked based on your interests and location"
      showBack
    />
  );
}

export default PostSuccessScreen;
