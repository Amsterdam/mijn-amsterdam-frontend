import { useEffect } from 'react';

import { useSmallScreen } from './media.hook';
import { useScript } from './useScript';
import { IS_AP } from '../../universal/config/env';
import { captureException } from '../helpers/monitoring';
import { getElementOnPageAsync } from '../helpers/utils';

const MAX_WAIT_FOR_USABILA_LIVE_MS = 5000; // 5 seconds
const USABILLA_ID_MOBILE = '9fd5da44aa5b';
const USABILLA_ID_DESKTOP = 'e8b4abda34ab';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    usabilla_live?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lightningjs?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Piwik?: any;
  }
}
export function waitForUsabillaLiveInWindow() {
  let polling: NodeJS.Timeout | undefined = undefined;
  let timeoutReached = false;
  return new Promise(function (resolve, reject) {
    (function waitForFoo() {
      if (window.usabilla_live) {
        return resolve(true);
      }
      const timeoutMs = 20;
      if (!timeoutReached) {
        polling = setTimeout(waitForFoo, timeoutMs);
      }
    })();
    setTimeout(() => {
      window.clearTimeout(polling);
      timeoutReached = true;
      reject();
    }, MAX_WAIT_FOR_USABILA_LIVE_MS);
  });
}

export function useUsabilla(profileType?: ProfileType) {
  const isPhoneScreen = useSmallScreen();
  const [isUsabillaLoaded] = useScript({
    src: '/js/usabilla-2021-10-05.js',
    defer: false,
    async: true,
    isEnabled: IS_AP,
  });
  useEffect(() => {
    if (isUsabillaLoaded) {
      const lightningjs = window.lightningjs;
      if (lightningjs) {
        const usabillaID = isPhoneScreen
          ? USABILLA_ID_MOBILE
          : USABILLA_ID_DESKTOP;
        window.usabilla_live = lightningjs.require(
          'usabilla_live',
          `https://w.usabilla.com/${usabillaID}.js`
        );
      }
      waitForUsabillaLiveInWindow()
        .then(() => {
          const MatomoVisitorId = window.Piwik?.getTracker().getVisitorId();

          window.usabilla_live('data', {
            custom: {
              MatomoVisitorId,
              profileType: profileType ?? 'unknown',
            },
          });
        })
        .catch((error) => {
          captureException(error, {
            properties: {
              waitForTimeout: true,
            },
          });
        });

      getElementOnPageAsync('iframe.usabilla-live-button').then((iframe) => {
        // The usabilla script uses a relative href to the image.
        // Because of csp we do not allow the iframe to set the base href to their domain
        // The absolute url to a local replacement image is injected
        (iframe as HTMLObjectElement)?.contentDocument
          ?.querySelector?.('img')
          ?.setAttribute(
            'src',
            '/resources/buttons/feedback_button_gemamsterdam_desktop_right_new.png'
          );
      });
    }
  }, [isUsabillaLoaded, isPhoneScreen, profileType]);
}
