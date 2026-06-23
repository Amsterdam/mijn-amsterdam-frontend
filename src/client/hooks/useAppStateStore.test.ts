import { act, renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import {
  createAppStateStoreHook,
  INITIAL_APPSTATE,
  useAppStateGetter,
  useAppStateReady,
  useAppStateStore,
} from './useAppStateStore.ts';

describe('useAppStateStore', () => {
  test('INITIAL_APPSTATE is sealed', () => {
    expect(Object.isSealed(INITIAL_APPSTATE)).toBe(true);
  });

  test('starts with pristine state and isReady=false', () => {
    const store = createAppStateStoreHook();
    const state = store.getState();

    expect(state.isReady).toBe(false);
    expect(state.BRP).toEqual(INITIAL_APPSTATE.BRP);
    expect(state.NOTIFICATIONS).toEqual(INITIAL_APPSTATE.NOTIFICATIONS);
  });

  test('setAppState performs partial update and keeps isReady unless provided', () => {
    const store = createAppStateStoreHook();
    const brpState = {
      status: 'OK',
      content: { firstName: 'Alice' },
    } as any; // use any so we don't have to provide the full AppState type here;
    // Mutate the appstate with a partial update.
    store.getState().setAppState({
      BRP: brpState,
    });

    expect(store.getState().BRP === brpState).toBe(true);

    // Unchanged parts of the state should remain the same.
    const notificationsState = store.getState().NOTIFICATIONS;
    expect(notificationsState === INITIAL_APPSTATE.NOTIFICATIONS).toBe(true);
    expect(store.getState().isReady).toBe(false);

    // Now set isReady to true with an empty update.
    store.getState().setAppState({}, true);
    expect(store.getState().isReady).toBe(true);

    // State is unchanged except for isReady.
    expect(store.getState().BRP === brpState).toBe(true);
    expect(store.getState().NOTIFICATIONS === notificationsState).toBe(true);
  });

  test('setIsAppStateReady updates readiness flag', () => {
    const store = createAppStateStoreHook();

    store.getState().setIsAppStateReady(true);
    expect(store.getState().isReady).toBe(true);

    store.getState().setIsAppStateReady(false);
    expect(store.getState().isReady).toBe(false);
  });

  test('mergeAppState deep merges a single app state for provided key', () => {
    const store = createAppStateStoreHook();

    store.getState().setAppState({
      FOO: 'bar',
      BRP: {
        status: 'OK',
        content: {
          nested: {
            city: 'Amsterdam',
            zipcode: '1000AA',
          },
          keepMe: true,
        },
      },
    } as any);

    store.getState().mergeAppState('BRP', {
      content: {
        nested: {
          zipcode: '1011AB',
        },
      } as any,
    });

    expect(store.getState().BRP).toEqual({
      status: 'OK',
      content: {
        nested: {
          city: 'Amsterdam',
          zipcode: '1011AB',
        },
        keepMe: true,
      },
    });
    expect((store.getState() as any).FOO).toBe('bar');
  });

  test('createAppStateStoreHook creates isolated store instances', () => {
    const storeA = createAppStateStoreHook();
    const storeB = createAppStateStoreHook();

    storeA.getState().setIsAppStateReady(true);

    expect(storeA.getState().isReady).toBe(true);
    expect(storeB.getState().isReady).toBe(false);
  });

  test('useAppStateGetter returns current singleton store state', () => {
    useAppStateStore.getState().setIsAppStateReady(true);

    expect(useAppStateGetter().isReady).toBe(true);
  });

  test('useAppStateReady selects and updates isReady from singleton store', () => {
    const { result } = renderHook(() => useAppStateReady());

    expect(result.current).toBe(false);

    act(() => {
      useAppStateStore.getState().setIsAppStateReady(true);
    });

    expect(result.current).toBe(true);
  });
});
