import { BlurTargetView } from 'expo-blur';
import { createContext, useContext, useRef, type ReactNode, type RefObject } from 'react';
import { StyleSheet, type View } from 'react-native';

const BlurTargetContext = createContext<RefObject<View | null> | null>(null);

/**
 * Wraps the app so overlays (dialogs, sheets) can blur what's behind them on Android, where
 * expo-blur needs an explicit BlurTargetView. On iOS it's a plain View.
 */
export function BlurTargetRoot({ children }: { children: ReactNode }) {
  const ref = useRef<View>(null);
  return (
    <BlurTargetContext.Provider value={ref}>
      <BlurTargetView ref={ref} style={styles.flex}>
        {children}
      </BlurTargetView>
    </BlurTargetContext.Provider>
  );
}

/** Ref to pass as `blurTarget` to an Android BlurView. */
export function useBlurTarget() {
  return useContext(BlurTargetContext);
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
