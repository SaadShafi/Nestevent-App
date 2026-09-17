import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Animated, Platform, Pressable, StyleSheet, ToastAndroid, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

type ToastKind = 'success' | 'error' | 'info';
export type ToastAction = { label: string; onPress: () => void };
type ToastFn = (message: string, kind?: ToastKind, action?: ToastAction) => void;

const ToastContext = createContext<ToastFn>(() => {});

/**
 * Minimal toast. Android uses the platform ToastAndroid (or the in-app banner when an action is
 * attached, since ToastAndroid can't host a button); iOS renders an in-app banner.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<{ message: string; kind: ToastKind; action?: ToastAction } | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setState(null));
  }, [opacity]);

  const show = useCallback<ToastFn>(
    (message, kind = 'info', action) => {
      if (Platform.OS === 'android' && !action) {
        ToastAndroid.show(message, ToastAndroid.SHORT);
        return;
      }
      setState({ message, kind, action });
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(hide, action ? 4500 : 2200);
    },
    [opacity, hide],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      {state ? (
        <Animated.View pointerEvents={state.action ? 'box-none' : 'none'} style={[styles.wrap, { top: insets.top + 8, opacity }]}>
          <View style={styles.toast}>
            <Icon
              name={state.kind === 'success' ? 'checkmark-circle' : state.kind === 'error' ? 'alert-circle' : 'information-circle'}
              size={18}
              color={state.kind === 'success' ? colors.success : state.kind === 'error' ? colors.danger : colors.primary}
            />
            <AppText variant="label" style={styles.text}>
              {state.message}
            </AppText>
            {state.action ? (
              <Pressable
                hitSlop={8}
                accessibilityRole="button"
                onPress={() => {
                  hide();
                  state.action?.onPress();
                }}
                style={styles.action}>
                <AppText variant="label" color={colors.primary}>
                  {state.action.label}
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 1000 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  text: { flexShrink: 1 },
  action: { marginLeft: 4, paddingLeft: 10, borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.border },
});
