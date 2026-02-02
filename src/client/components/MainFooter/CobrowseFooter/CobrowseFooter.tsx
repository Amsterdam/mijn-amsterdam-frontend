import { useEffect, useState } from 'react';

import { PageFooter } from '@amsterdam/design-system-react';

// https://github.com/import-js/eslint-plugin-import/issues/2876
// eslint-disable-next-line import/order
import type { CobrowseWidget } from './lib/cobrowse-widget';

import './lib/cobrowse-widget.css';
import { REDACTED_CLASS, useCobrowseStore } from '../../../helpers/cobrowse';
import { useIsBffToggleEnabled } from '../../../helpers/env';
// import { useIsBffToggleEnabled } from '../../../helpers/env';

export const LABEL_HULP_SCHERMDELEN = 'Hulp via schermdelen';
declare global {
  interface Window {
    CobrowseWidget?: unknown;
  }
}

const licenseKey = import.meta.env.REACT_APP_COBROWSE_LICENSE_KEY;

export function isCobrowseScreensharing() {
  return !!document.getElementById('cobrowse-frame');
}

export function useCobrowseScreenshareStatus() {
  const [active, setActive] = useState(isCobrowseScreensharing());

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setActive(isCobrowseScreensharing());
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return active;
}

function useCobrowse() {
  const [cobrowseWidget, setCobrowseWidget] = useState<CobrowseWidget | null>(
    null
  );
  const isCobrowseEnabled = useIsBffToggleEnabled('BFF_COBROWSE_IS_ACTIVE');
  const setIsScreensharing = useCobrowseStore(
    (state) => state.setIsScreensharing
  );

  useEffect(() => {
    if (!isCobrowseEnabled || !licenseKey) {
      return;
    }
    if (cobrowseWidget) {
      return;
    }
    import('./lib/cobrowse-widget.js').then(({ CobrowseWidget }) => {
      const redactedViews = [`.${REDACTED_CLASS}`];
      const widget = new CobrowseWidget({
        licenseKey,
        redactedViews,
        language: 'nl',
        setIsScreensharing,
      });
      setCobrowseWidget(widget);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCobrowseEnabled]);

  return cobrowseWidget;
}

export function CobrowseFooter() {
  const cobrowseWidget = useCobrowse();
  return (
    cobrowseWidget && (
      <PageFooter.MenuLink
        key="footer-cobrowse"
        id="startCobrowseButton"
        onClick={cobrowseWidget?.startSession.bind(cobrowseWidget)}
        href="#"
      >
        {LABEL_HULP_SCHERMDELEN}
      </PageFooter.MenuLink>
    )
  );
}
