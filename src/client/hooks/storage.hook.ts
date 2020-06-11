import * as Cookies from 'js-cookie';
import * as Sentry from '@sentry/browser';

import { useCallback, useEffect, useState } from 'react';

import { Unshaped } from '../../universal/types';
import { getOtapEnvItem } from '../../universal/config';

interface LocalStorageHandler {
  value: string | null;
  set: (newValue: string) => void;
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
      Sentry.captureException(error);
    }
    return null;
  }, [adapter, key]);

  const saveValueToLocalStorage = useCallback(
    (key: string, value: string | null) => {
      return adapter.setItem(key, String(value));
    },
    [adapter]
  );

  const [value, setValue] = useState(getValueFromLocalStorage());

  const set = useCallback(
    (newValue: any) => {
      setValue(newValue);
      // Apparently in some cases IE11 throws a SCRIPT5: access denied error which crashes the app.
      // The catch here prevents the crash and reports the error to Sentry.
      try {
        saveValueToLocalStorage(key, newValue);
      } catch (error) {
        Sentry.captureException(error);
      }
    },
    [key, saveValueToLocalStorage]
  );

  const init = useCallback(() => {
    const valueLoadedFromLocalStorage = getValueFromLocalStorage();
    if (
      valueLoadedFromLocalStorage === null ||
      valueLoadedFromLocalStorage === 'null'
    ) {
      set(defaultValue);
    }
  }, [defaultValue, getValueFromLocalStorage, set]);

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

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (adapter === localStorage) {
      window.addEventListener('storage', onStorageEvent);
      return () => {
        window.removeEventListener('storage', onStorageEvent);
      };
    }
  });

  const handler: LocalStorageHandler = {
    value,
    set,
    remove,
  };

  return handler;
}

export function useStorage(
  key: string,
  initialValue: any,
  adapter: Storage | MemoryAdapter = localStorage
) {
  let val = null;
  try {
    val = JSON.stringify(initialValue);
  } catch (e) {}

  const { value: item, set: setValue } = useWindowStorage(key, val, adapter);
  const setItem = (newValue: string) => {
    try {
      setValue(JSON.stringify(newValue));
    } catch (e) {}
  };

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
  } catch (error) {}

  return useStorage(key, value, adapter);
}

export function useSessionStorage<Value>(
  key: string,
  value: Value | null = null
) {
  let adapter: MemoryAdapter | Storage = memoryHandler;
  try {
    adapter = sessionStorage || memoryHandler;
  } catch (error) {}

  return useStorage(key, value, adapter);
}

export function clearSessionStorage() {
  try {
    sessionStorage.clear();
  } catch (error) {}
}

export function clearLocalStorage() {
  try {
    localStorage.clear();
  } catch (error) {}
}

export function useCookie(
  key: string,
  initialValue: string | object
): [
  string | object,
  (value: string | object, options: Cookies.CookieAttributes) => void
] {
  const [item, setInnerValue] = useState(() => {
    return Cookies.get(key) || initialValue;
  });

  const setValue = useCallback(
    (value: string | object, options: Cookies.CookieAttributes) => {
      setInnerValue(value);
      Cookies.set(key, value, options);
    },
    [setInnerValue, key]
  );

  return [item, setValue];
}
