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
  timeoutAfterMS: number = FAIL_TIMEOUT_MS,
  interval: number = POLL_INTERVAL_MS
): { promise: Promise<Element | null>; cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let resolve_: (result: Element | null) => void = () => {};

  function resolve(result: Element | null) {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    return resolve_(result);
  }

  const startTime = Date.now();

  return {
    promise: new Promise((resolve) => {
      resolve_ = resolve;

      function checkIfElementIsInDOM() {
        const doc = globalThis.document;
        if (!doc) {
          resolve(null);
          return;
        }

        const elem = doc.querySelector(query);
        if (elem) {
          return resolve(elem);
        }

        const timeElapsed = Date.now() - startTime;
        if (timeElapsed > timeoutAfterMS) {
          return resolve(null);
        }

        timeout = setTimeout(checkIfElementIsInDOM, interval);
      }

      checkIfElementIsInDOM();
    }),
    cancel: () => {
      resolve(null);
    },
  };
}
