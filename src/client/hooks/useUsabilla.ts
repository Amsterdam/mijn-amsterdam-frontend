import { IS_AP } from '../../universal/config';
import { useScript } from './useScript';
import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { usePhoneScreen } from './media.hook';

const MAX_WAIT_FOR_USABILA_LIVE_MS = 5000; // 5 seconds
const USABILLA_ID_MOBILE = '9fd5da44aa5b';
const USABILLA_ID_DESKTOP = 'e8b4abda34ab';

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
  const isPhoneScreen = usePhoneScreen();
  const [isUsabillaLoaded] = useScript({
    src: '/js/usabilla.js',
    defer: false,
    async: true,
    isEnabled: IS_AP,
  });
  useEffect(() => {
    if (isUsabillaLoaded) {
      const lightningjs = (window as any).lightningjs;
      if (lightningjs) {
        const usabillaID = isPhoneScreen
          ? USABILLA_ID_MOBILE
          : USABILLA_ID_DESKTOP;
        (window as any).usabilla_live = lightningjs.require(
          'usabilla_live',
          `https://w.usabilla.com/${usabillaID}.js`
        );
      }
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
  }, [isUsabillaLoaded, isPhoneScreen]);
}
