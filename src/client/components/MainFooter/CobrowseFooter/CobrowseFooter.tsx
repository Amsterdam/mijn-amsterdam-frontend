import { useEffect, useState } from 'react';

import { PageFooter } from '@amsterdam/design-system-react';

import { IS_AP } from '../../../../universal/config/env';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';
import { useScript } from '../../../hooks/useScript';

const MAX_WAIT_FOR_COBROWSE_LIVE_MS = 1500;

export function CobrowseFooter() {
  if (!FeatureToggle.cobrowseIsActive) {
    return;
  }

  // Load the external script when it is not loaded from the tagmanager
  const [isCobrowseLoaded] = useScript({
    src: 'https://omnichanneliv--gat2.sandbox.my.site.com/staticvforcesite/resource/Cobrowse/cobrowseAppNL.bundle.js?v=002',
    defer: false,
    async: true,
    isEnabled: !IS_AP,
  });
  const [showCobrowseFooter, setShowCobrowseFooter] = useState(true);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!(window as any).CobrowseIO) {
        setShowCobrowseFooter(false);
      }
    }, MAX_WAIT_FOR_COBROWSE_LIVE_MS);

    const head = document.head;
    const link = document.createElement('link');

    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = '/css/cobrowse.css';

    head.appendChild(link);

    return () => {
      head.removeChild(link);
      clearTimeout(timeout);
    };
  }, [isCobrowseLoaded]);

  // MIJN-11933
  // Setting the id to startCobrowseButton8 (script add eventHandler) is not stable in an SPA
  // The external script also listens for the Shift+6 keydown event to display the modal
  const shift6keysDown = new KeyboardEvent('keydown', {
    key: '^',
    code: 'Digit6',
    shiftKey: true,
    bubbles: true,
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
