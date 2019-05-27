import React from 'react';

// TODO: Implement tab syncing via storage events

export function useStorage(
  key: string,
  initialValue: any,
  adapter: Storage = localStorage
) {
  const [item, setValue] = React.useState(() => {
    const storedValue = adapter.getItem(key);
    return typeof storedValue === 'string'
      ? JSON.parse(storedValue)
      : initialValue;
  });

  const setItem = (newValue: string) => {
    const stringifiedValue =
      typeof newValue !== 'undefined' ? JSON.stringify(newValue) : '';
    adapter.setItem(key, stringifiedValue);
    setValue(stringifiedValue);
  };

  return [item, setItem];
}

export function useLocalStorage(key: string, value: any) {
  return useStorage(key, value, localStorage);
}

export function useSessionStorage(key: string, value: any) {
  return useStorage(key, value, localStorage);
}
