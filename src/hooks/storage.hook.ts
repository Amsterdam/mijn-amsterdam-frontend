import * as Sentry from '@sentry/browser';
import * as Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { Unshaped } from '../App.types';

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
  const [value, setValue] = useState(getValueFromLocalStorage());

  function init() {
    const valueLoadedFromLocalStorage = getValueFromLocalStorage();
    if (
      valueLoadedFromLocalStorage === null ||
      valueLoadedFromLocalStorage === 'null'
    ) {
      set(defaultValue);
    }
  }

  function getValueFromLocalStorage() {
    try {
      return adapter.getItem(key);
    } catch (e) {}
    return null;
  }

  function saveValueToLocalStorage(key: string, value: string | null) {
    try {
      return adapter.setItem(key, String(value));
    } catch (e) {}
    return null;
  }

  function set(newValue: any) {
    setValue(newValue);
    // Apparently in some cases IE11 throws a SCRIPT5: access denied error which crashes the app.
    // The catch here prevents the crash and reports the error to Sentry.
    try {
      saveValueToLocalStorage(key, newValue);
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  function listen(e: StorageEvent) {
    let storageAllowed = true;
    try {
      localStorage.key(0);
      sessionStorage.key(0);
    } catch (error) {
      storageAllowed = false;
    }

    if (storageAllowed && e.storageArea === adapter && e.key === key) {
      setValue(e.newValue);
    }
  }

  function remove() {
    set(null);
    if (typeof adapter === 'undefined') {
      return false;
    }
    adapter.removeItem(key);
  }

  //initialize
  useEffect(() => {
    init();
  }, []);

  if (adapter === localStorage) {
    // check for changes across windows
    useEffect(() => {
      window.addEventListener('storage', listen);
      return () => {
        window.removeEventListener('storage', listen);
      };
    });
  }

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
  const { value: item, set: setValue } = useWindowStorage(
    key,
    JSON.stringify(initialValue),
    adapter
  );

  const setItem = (newValue: string) => {
    setValue(JSON.stringify(newValue));
  };

  return [item !== null ? JSON.parse(item) : item, setItem];
}

export function useLocalStorage<Value>(
  key: string,
  value: Value | null = null
) {
  let adapter: MemoryAdapter | Storage = memoryHandler;
  try {
    adapter = localStorage;
  } catch (error) {}

  return useStorage(key, value, adapter);
}

export function useSessionStorage(key: string, value: any) {
  let adapter: MemoryAdapter | Storage = memoryHandler;
  try {
    adapter = sessionStorage;
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

  const setValue = (
    value: string | object,
    options: Cookies.CookieAttributes
  ) => {
    setInnerValue(value);
    Cookies.set(key, value, options);
  };

  return [item, setValue];
}
