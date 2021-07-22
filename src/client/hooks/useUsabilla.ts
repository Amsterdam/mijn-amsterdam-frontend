import { IS_AP } from '../../universal/config';
import { useScript } from './useScript';
import * as Sentry from '@sentry/react';
import { useEffect } from 'react';

const MAX_WAIT_FOR_USABILA_LIVE_MS = 5000; // 5 seconds

export function waitForUsabillaLiveInWindow() {
  let polling: any = null;
  let timeoutReached = false;
  return new Promise(function (resolve, reject) {
    (function waitForFoo() {
      if ((window as any).usabilla_live) {
        return resolve(true);
      }
      if (!timeoutReached) {
        polling = setTimeout(waitForFoo, 30);
      }
    })();
    setTimeout(() => {
      window.clearTimeout(polling);
      timeoutReached = true;
      reject();
    }, MAX_WAIT_FOR_USABILA_LIVE_MS);
  });
}

export function useUsabilla() {
  const [isUsabillaLoaded] = useScript('/js/usabilla.js', false, true, IS_AP);

  useEffect(() => {
    if (isUsabillaLoaded) {
      waitForUsabillaLiveInWindow()
        .then(() => {
          (window as any).usabilla_live('data', {
            custom: {
              MatomoVisitorId: (
                window as any
              ).Matomo?.getTracker().getVisitorId(),
            },
          });
        })
        .catch((error) => {
          Sentry.captureException(error, {
            extra: {
              waitForTimeout: true,
            },
          });
        });
    }
  }, [isUsabillaLoaded]);
}
