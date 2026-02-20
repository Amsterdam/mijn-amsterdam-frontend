import { useCallback, useEffect } from 'react';

import { create } from 'zustand/react';

import { Unshaped } from '../../universal/types/App.types';
import { captureException } from '../helpers/monitoring';

type WindowStateStore = {
  set: (
    storageType: 'localStorage' | 'sessionStorage',
    key: string,
    state: unknown
  ) => void;
  get: (storageType: 'localStorage' | 'sessionStorage', key: string) => unknown;
  has: (storageType: 'localStorage' | 'sessionStorage', key: string) => boolean;
  data: {
    localStorage: Record<string, unknown>;
    sessionStorage: Record<string, unknown>;
  };
};

const useWindowStateStore = create<WindowStateStore>((set, get) => ({
  data: {
    localStorage: {},
    sessionStorage: {},
  },
  set: (
    storageType: 'localStorage' | 'sessionStorage',
    key: string,
    state: unknown
  ) =>
    set({
      data: {
        ...get().data,
        [storageType]: { ...get().data[storageType], [key]: state },
      },
    }),
  get: (storageType: 'localStorage' | 'sessionStorage', key: string) => {
    const state = get();
    const x = state.data[storageType][key];
    return x;
  },
  has: (storageType: 'localStorage' | 'sessionStorage', key: string) =>
    key in get().data[storageType],
}));

interface LocalStorageHandler {
  value: string | null;
  set: (newValue: string | null) => void;
  remove: () => void;
}

interface MemoryAdapter extends Storage {
  data: Unshaped;
}

// Basic implementation of local/session storage like database interface.
const memoryHandler: MemoryAdapter = {
  data: {},
  setItem(key: string, value: string) {
    memoryHandler.data[key] = value;
  },
  getItem(key: string) {
    return memoryHandler.data[key];
  },
  removeItem(key: string) {
    delete memoryHandler.data[key];
  },
  clear() {
    memoryHandler.data = {};
  },
  get length() {
    return Object.keys(memoryHandler.data).length;
  },
  key(index: number) {
    const keys = Object.keys(memoryHandler.data);
    return memoryHandler.data[keys[index]] || null;
  },
};

/**
 * useLocalStorage hook
 *
 * @param {string} key - Key of the localStorage object
 * @param {string} defaultValue - Default initial value
 */
function useWindowStorage(
  key: string,
  defaultValue: string | null = null,
  adapter: Storage
) {
  const getValueFromLocalStorage = useCallback(() => {
    try {
      return adapter.getItem(key);
    } catch (error) {
      captureException(error, {
        properties: {
          module: 'storage',
          method: 'get',
          key,
        },
      });
    }
    return null;
  }, [adapter, key]);

  const saveValueToLocalStorage = useCallback(
    (key: string, value: string | null) => {
      if (value === null) {
        return adapter.removeItem(key);
      }
      return adapter.setItem(key, value);
    },
    [adapter]
  );

  // const [value, setValue] = useState(getValueFromLocalStorage());
  const { set: setValue, data } = useWindowStateStore();
  const storageType =
    adapter === localStorage ? 'localStorage' : 'sessionStorage';

  useEffect(() => {
    console.log('Initializing storage with key', key);
    const value = getValueFromLocalStorage();
    setValue(storageType, key, value);
  }, []);

  const set = useCallback(
    (newValue: string | null) => {
      setValue(storageType, key, newValue);
      // Apparently in some cases IE11 throws a SCRIPT5: access denied error which crashes the app.
      // The catch here prevents the crash and reports the error to Monitoring.
      try {
        saveValueToLocalStorage(key, newValue);
      } catch (error) {
        captureException(error, {
          properties: {
            module: 'storage',
            method: 'set',
            key,
          },
        });
      }
    },
    [key, saveValueToLocalStorage, setValue]
  );

  const onStorageEvent = useCallback(
    (e: StorageEvent) => {
      let storageAllowed = true;
      // Check if we can handle the storage event
      try {
        localStorage.key(0);
        sessionStorage.key(0);
      } catch (error) {
        storageAllowed = false;
      }

      if (storageAllowed) {
        if (e.storageArea === adapter && e.key === key) {
          setValue(storageType, key, e.newValue);
        }
      }
    },
    [adapter, key, setValue, storageType]
  );

  function remove() {
    set(null);
    if (typeof adapter === 'undefined') {
      return false;
    }
    adapter.removeItem(key);
  }

  let hasLocalStorage = false;

  try {
    hasLocalStorage = adapter === localStorage;
  } catch (_) {
    console.error('Error checking for localStorage');
  }

  useEffect(() => {
    if (hasLocalStorage) {
      window.addEventListener('storage', onStorageEvent);
      return () => {
        window.removeEventListener('storage', onStorageEvent);
      };
    }
  }, [hasLocalStorage, onStorageEvent]);

  const stateStoreValue = data[storageType][key];

  const handler: LocalStorageHandler = {
    value: typeof stateStoreValue === 'string' ? stateStoreValue : defaultValue,
    set,
    remove,
  };

  return handler;
}

function useStorage<T>(
  key: string,
  initialValue: T,
  adapter: Storage | MemoryAdapter = localStorage
): [T, (newValue: T) => void] {
  let val = null;
  try {
    val = JSON.stringify(initialValue);
  } catch (_) {
    console.error('Error getting localStorage');
  }

  const { value: item, set: setValue } = useWindowStorage(key, val, adapter);
  const setItem = useCallback(
    (newValue: T) => {
      try {
        setValue(JSON.stringify(newValue));
      } catch (_) {
        console.error('Error setting localStorage');
      }
    },
    [setValue]
  );

  try {
    return [item !== null ? JSON.parse(item) : initialValue, setItem];
  } catch (e) {
    return [initialValue, setItem];
  }
}

export function useLocalStorage<Value>(key: string, initialValue: Value) {
  let adapter: MemoryAdapter | Storage = memoryHandler;
  try {
    adapter = localStorage || memoryHandler;
  } catch (_) {
    console.error('Error getting localStorage');
  }

  return useStorage(key, initialValue, adapter);
}

export function useSessionStorage<Value>(key: string, initialValue: Value) {
  let adapter: MemoryAdapter | Storage = memoryHandler;
  try {
    adapter = sessionStorage || memoryHandler;
  } catch (_) {
    console.error('Error getting sessionStorage');
  }

  return useStorage(key, initialValue, adapter);
}

export function clearSessionStorage() {
  try {
    sessionStorage.clear();
  } catch (_) {
    console.error('Error clearing sessionStorage');
  }
}

export function clearLocalStorage() {
  try {
    localStorage.clear();
  } catch (_) {
    console.error('Error clearing localStorage');
  }
}

export function removeLocalStorageKey(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (_) {
    console.error('Error removing localStorage key');
  }
}
