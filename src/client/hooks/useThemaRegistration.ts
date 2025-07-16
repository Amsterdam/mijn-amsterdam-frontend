import { useEffect } from 'react';

import { useSWRConfig } from 'swr';

import type { ThemaRenderRouteConfig } from '../config/thema-types';

type EventKey = string | symbol;
type EventHandler<T = any> = (payload: T) => void;
type EventMap = Record<EventKey, EventHandler>;
type Bus<E> = Record<keyof E, E[keyof E][]>;
type Queue<E> = Record<keyof E, any[]>;

interface EventBus<T extends EventMap> {
  on<Key extends keyof T>(key: Key, handler: T[Key]): () => void;
  off<Key extends keyof T>(key: Key, handler: T[Key]): void;
  once<Key extends keyof T>(key: Key, handler: T[Key]): void;
  emit<Key extends keyof T>(key: Key, ...payload: Parameters<T[Key]>): void;
}

interface EventBusConfig {
  onError: (...params: any[]) => void;
}

export function eventbus<E extends EventMap>(
  config?: EventBusConfig
): EventBus<E> {
  const bus: Partial<Bus<E>> = {};
  const queue: Partial<Queue<E>> = {};

  const on: EventBus<E>['on'] = (key, handler) => {
    if (bus[key] === undefined) {
      bus[key] = [];
    }
    bus[key]?.push(handler);

    // If there are queued events for this key, process them now
    // and then clear the queue for this key.
    // This ensures that any events emitted before the handler was registered
    // are processed immediately.
    if (Array.isArray(queue?.[key])) {
      while (queue[key].length > 0) {
        const payload = queue[key].shift();
        // eslint-disable-next-line no-console
        console.info('Processing queued event for %s', payload.id, payload);
        try {
          handler(payload);
        } catch (e) {
          config?.onError(e);
        }
      }
      delete queue[key];
    }

    return () => {
      off(key, handler);
    };
  };

  const off: EventBus<E>['off'] = (key, handler) => {
    const index = bus[key]?.indexOf(handler) ?? -1;
    bus[key]?.splice(index >>> 0, 1);
  };

  const once: EventBus<E>['once'] = (key, handler) => {
    const handleOnce = (payload: Parameters<typeof handler>) => {
      handler(payload);
      // TODO: find out a better way to type `handleOnce`
      off(key, handleOnce as typeof handler);
    };

    on(key, handleOnce as typeof handler);
  };

  const emit: EventBus<E>['emit'] = (key, payload) => {
    if (!bus[key]) {
      // eslint-disable-next-line no-console
      console.warn(
        `No handlers registered for event: ${String(key)}, adding to queue.`
      );
      if (!queue[key]) {
        queue[key] = [];
      }
      queue[key].push(payload);
      return;
    }
    bus[key]?.forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        config?.onError(e);
      }
    });
  };

  return { on, off, once, emit };
}

const KEY = 'thema-registration';

type ThemaConfigRegistration = {
  routes: Readonly<ThemaRenderRouteConfig[]>;
  id: string;
};

type ThemConfigRegistry = Record<
  ThemaConfigRegistration['id'],
  ThemaConfigRegistration
>;

export function useThemaRegistration() {
  const { refreshInterval, cache, mutate } = useSWRConfig();
  const boundCache = cache.get(KEY) ?? {};
  const registry: ThemConfigRegistry = boundCache.data ?? null;

  function registerThema(themaID: string, config: ThemaConfigRegistration) {
    mutate(KEY, (currentThemeConfig: ThemConfigRegistry = {}) => {
      return {
        ...currentThemeConfig,
        [themaID]: config,
      };
    });
  }

  useEffect(() => {
    const unsubscribe = themaRegistrationEventChannel.on(
      'register',
      (payload) => {
        console.info('Registering thema %s', payload.id, payload);
        registerThema(payload.id, payload);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    routes: registry
      ? Object.values(registry)
          .map((thema) => thema.routes)
          .flat()
      : [],
    registry,
  };
}

export const themaRegistrationEventChannel = eventbus<{
  register: (payload: ThemaConfigRegistration) => void;
}>();
