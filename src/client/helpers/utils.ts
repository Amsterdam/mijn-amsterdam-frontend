import { KeyboardEvent, MouseEvent } from 'react';

import { FeatureToggle } from '../../universal/config/feature-toggles';
import { myThemasMenuItems } from '../config/thema';
import { ThemaMenuItem } from '../config/thema-types';

// Repeating conditions for accessible keyboard event
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function withKeyPress<T>(fn: Function, keyName: string = 'enter') {
  return (event: KeyboardEvent<T> | MouseEvent<T>) => {
    if (!('key' in event) || event.key.toLowerCase() === keyName) {
      fn(event);
    }
  };
}

/**
 * Sloppy determination if given url points to a page of the application
 * @param url string
 */
export function isInteralUrl(url: string) {
  return (
    url.includes('mijn.amsterdam.nl') ||
    url.startsWith('/') ||
    !url.startsWith('http')
  );
}

export function isExternalUrl(url: string) {
  return !isInteralUrl(url);
}

const POLL_INTERVAL_MS = 10;
const FAIL_TIMEOUT_MS = 1000;
export function getElementOnPageAsync(
  query: string,
  timeout: number = FAIL_TIMEOUT_MS,
  interval: number = POLL_INTERVAL_MS
): Promise<Element | null> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    function checkIfElementIsInDOM() {
      const elem = document?.querySelector(query);
      if (elem) {
        resolve(elem); // Found the element
      } else if (Date.now() - startTime > timeout) {
        resolve(null); // Give up eventually
      } else {
        setTimeout(checkIfElementIsInDOM, interval); // check again every interval ms
      }
    }
    checkIfElementIsInDOM(); // Initial check
  });
}

export const REDACTED_CLASS = FeatureToggle.cobrowseIsActive
  ? 'cobrowse-redacted'
  : '';
export const isRedactedClass = (
  themaId: string,
  scope: Required<ThemaMenuItem>['redactedScope']
) => {
  if (!FeatureToggle.cobrowseIsActive) {
    return false;
  }
  const redactedScope = myThemasMenuItems.find(
    (item) => item.id === themaId
  )?.redactedScope;
  if (redactedScope === 'full') {
    return true;
  }
  if (redactedScope === 'content' && scope === 'content') {
    return true;
  }
  return false;
};
export const getRedactedClass = (
  themaId: string | null,
  scope: Required<ThemaMenuItem>['redactedScope'] = 'full'
) => (themaId && isRedactedClass(themaId, scope) ? REDACTED_CLASS : '');
