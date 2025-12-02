import { useCallback, useEffect, useState } from 'react';

import { Unshaped } from '../../universal/types/App.types';
import { captureException } from '../helpers/monitoring';

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
  defaultValue: any = null,
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

  const [value, setValue] = useState(getValueFromLocalStorage());

  const set = useCallback(
    (newValue: any) => {
      setValue(newValue);
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
    [key, saveValueToLocalStorage]
  );

  function onStorageEvent(e: StorageEvent) {
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
        setValue(e.newValue);
      }
    }
  }

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
  });

  const handler: LocalStorageHandler = {
    value: value === null ? defaultValue : value,
    set,
    remove,
  };

  return handler;
}

export function useStorage<T>(
  key: string,
  initialValue: T,
  adapter: Storage | MemoryAdapter = localStorage
) {
  let val = null;
  try {
    val = initialValue !== null ? JSON.stringify(initialValue) : initialValue;
  } catch (_) {
    console.error('Error getting localStorage');
  }

  const { value: item, set: setValue } = useWindowStorage(key, val, adapter);
  const setItem = useCallback(
    (newValue: string | null) => {
      try {
        setValue(newValue !== null ? JSON.stringify(newValue) : null);
      } catch (_) {
        console.error('Error setting localStorage');
      }
    },
    [setValue]
  );

  try {
    return [item !== null ? JSON.parse(item) : item, setItem];
  } catch (e) {
    return [null, setItem];
  }
}

export function useLocalStorage<Value>(
  key: string,
  value: Value | null = null
) {
  let adapter: MemoryAdapter | Storage = memoryHandler;
  try {
    adapter = localStorage || memoryHandler;
  } catch (_) {
    console.error('Error getting localStorage');
  }

  return useStorage(key, value, adapter);
}

export function useSessionStorage<Value>(
  key: string,
  value: Value | null = null
) {
  let adapter: MemoryAdapter | Storage = memoryHandler;
  try {
    adapter = sessionStorage || memoryHandler;
  } catch (_) {
    console.error('Error getting sessionStorage');
  }

  return useStorage(key, value, adapter);
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
