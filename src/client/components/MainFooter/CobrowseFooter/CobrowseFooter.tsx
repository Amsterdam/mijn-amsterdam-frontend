import { useEffect, useState } from 'react';

import { PageFooter } from '@amsterdam/design-system-react';

import { FeatureToggle } from '../../../../universal/config/feature-toggles';
import { useScript } from '../../../hooks/useScript';

const MAX_WAIT_FOR_COBROWSE_LIVE_MS = 5000;
declare global {
  interface Window {
    CobrowseWidget?: unknown;
  }
}
function waitForCobrowseLiveInWindow(window: Window & typeof globalThis) {
  let polling: NodeJS.Timeout | undefined = undefined;
  let timeoutReached = false;
  return new Promise(function (resolve, reject) {
    (function waitForFoo() {
      if (window.CobrowseWidget) {
        return resolve(true);
      }
      const timeoutMs = 50;
      if (!timeoutReached) {
        polling = setTimeout(waitForFoo, timeoutMs);
      }
    })();
    setTimeout(() => {
      window.clearTimeout(polling);
      timeoutReached = true;
      reject();
    }, MAX_WAIT_FOR_COBROWSE_LIVE_MS);
  });
}

export function CobrowseFooter() {
  if (MA_APP_MODE === 'unittest' || !FeatureToggle.cobrowseIsActive) {
    return;
  }

  // Load the external script when it is not loaded from the tagmanager
  const [isCobrowseLoaded] = useScript({
    src: '/js/cobrowse-widget-2025-08-14.bundle.js',
    defer: true,
    async: false,
    isEnabled: true,
  });
  const [showCobrowseFooter, setShowCobrowseFooter] = useState(false);
  useEffect(() => {
    waitForCobrowseLiveInWindow(window)
      .then(() => {
        setShowCobrowseFooter(true);
      })
      .catch((e) => {
        // ignore reject
      });
  }, [isCobrowseLoaded]);
  useEffect(() => {
    if (!showCobrowseFooter) {
      return;
    }
    const head = document.head;
    const link = document.createElement('link');

    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = '/css/cobrowse-widget-2025-08-14.css';

    head.appendChild(link);

    return () => {
      head.removeChild(link);
    };
  }, [showCobrowseFooter]);

  // MIJN-11933
  // Setting the id to startCobrowseButton8 (script add eventHandler) is not stable in an SPA
  // The external script also listens for the Shift+6 keydown event to display the modal
  const shift6keysDown = new KeyboardEvent('keydown', {
    key: '6',
    code: 'Digit6',
    shiftKey: true,
    keyCode: 54,
    which: 54,
    bubbles: true,
    cancelable: true,
  });
  return (
    showCobrowseFooter && (
      <PageFooter.MenuLink
        key="footer-cobrowse"
        id="startCobrowseButton"
        onClick={() => document.dispatchEvent(shift6keysDown)}
        href="#"
      >
        Hulp via schermdelen
      </PageFooter.MenuLink>
    )
  );
}
