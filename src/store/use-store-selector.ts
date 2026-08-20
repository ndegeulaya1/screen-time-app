'use no memo';

import { useSyncExternalStore } from 'react';

type StoreApi<TState> = {
  getState: () => TState;
  subscribe: (listener: (state: TState, prevState: TState) => void) => () => void;
};

export function useStoreSelector<TState, TSlice>(
  store: StoreApi<TState>,
  selector: (state: TState) => TSlice,
): TSlice {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}
