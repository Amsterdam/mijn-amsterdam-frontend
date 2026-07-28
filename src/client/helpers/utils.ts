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
): Promise<Element | null> {
  return new Promise((resolve_) => {
    function resolve(result: Element | null) {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
      return resolve_(result);
    }

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

    let timeout: ReturnType<typeof setTimeout> | null = null;
    const startTime = Date.now();
    checkIfElementIsInDOM();
  });
}
