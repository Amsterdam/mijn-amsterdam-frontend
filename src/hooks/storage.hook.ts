import * as Sentry from '@sentry/browser';
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
    if (typeof adapter === 'undefined') {
      return null;
    }
    return adapter.getItem(key);
  }

  function saveValueToLocalStorage(key: string, value: string | null) {
    if (typeof adapter === 'undefined') {
      return null;
    }
    return adapter.setItem(key, String(value));
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
    if (e.storageArea === adapter && e.key === key) {
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

export function useLocalStorage(key: string, value: any) {
  return useStorage(key, value, localStorage);
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
