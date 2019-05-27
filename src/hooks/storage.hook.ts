import React from 'react';

let lsBus = {};
let ssBus = {};

/**
 * Redraw all components that have a hook to localStorage with the given key.
 * @param {string} key
 * @param {*} newValue
 */
const notifyLSBus = (key, newValue) => {
  if (!lsBus || !lsBus[key]) {
    return;
  }
  Object.values(lsBus[key]).forEach(u => u(newValue));
};

/**
 * Redraw all components that have a hook to sessionStorage with the given key.
 * @param {string} key
 * @param {*} newValue
 */
const notifySSBus = (key, newValue) => {
  if (!ssBus || !ssBus[key]) {
    return;
  }
  Object.values(ssBus[key]).forEach(u => u(newValue));
};

/**
 * Hooks into localStorage. The value will be taken from localStorage, if the key exists there.
 * If not, the value will use the `initialValue` data. Use the setFunction to update the value inside
 * localStorage _and_ notify all components that use the same hook that the value behind the key has changed.
 *
 * You can pass whatever is JSON encodable to the setFunction - it will take care of storing it correctly.
 * @param {string} key
 * @param {*} [initialValue=null]
 * @returns {Array} [value, setFunction]
 */
export const useLocalStorage = (key, initialValue = null) => {
  let defaultValue;
  try {
    defaultValue = localStorage.getItem(key)
      ? JSON.parse(localStorage.getItem(key))
      : initialValue;
  } catch (e) {
    defaultValue = initialValue;
  }
  const [value, setValue] = React.useState(defaultValue);
  const componentId = React.useState(Math.random().toString())[0];

  React.useEffect(() => {
    lsBus[key] = lsBus[key] || {};
    lsBus[key][componentId] = setValue;
    return () => delete lsBus[componentId];
  });

  return [
    value,
    newValue => {
      localStorage.setItem(key, JSON.stringify(newValue));
      notifyLSBus(key, newValue);
    },
  ];
};

/**
 * Hooks into sessionStorage. The value will be taken from sessionStorage, if the key exists there.
 * If not, the value will use the `initialValue` data. Use the setFunction to update the value inside
 * sessionStorage _and_ notify all components that use the same hook that the value behind the key has changed.
 *
 * You can pass whatever is JSON encodable to the setFunction - it will take care of storing it correctly.
 * @param {string} key
 * @param {*} initialValue
 * @returns {Array} [value, setFunction]
 */
export const useSessionStorage = (key, initialValue) => {
  let defaultValue;
  try {
    defaultValue = sessionStorage.getItem(key)
      ? JSON.parse(sessionStorage.getItem(key))
      : initialValue;
  } catch (e) {
    defaultValue = initialValue;
  }
  const [value, setValue] = React.useState(defaultValue);
  const componentId = React.useState(Math.random().toString())[0];

  React.useEffect(() => {
    ssBus[key] = ssBus[key] || {};
    ssBus[key][componentId] = setValue;
    return () => delete ssBus[componentId];
  });

  return [
    value,
    newValue => {
      sessionStorage.setItem(key, JSON.stringify(newValue));
      notifySSBus(key, newValue);
    },
  ];
};
