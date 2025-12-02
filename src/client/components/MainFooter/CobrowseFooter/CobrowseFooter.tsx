import { useEffect, useState } from 'react';

import { PageFooter } from '@amsterdam/design-system-react';

// https://github.com/import-js/eslint-plugin-import/issues/2876
// eslint-disable-next-line import/order
import type { CobrowseWidget } from './lib/cobrowse-widget';

import './lib/cobrowse-widget.css';
import { REDACTED_CLASS } from '../../../helpers/cobrowse';
import { useIsBffToggleEnabled } from '../../../helpers/env';

export const LABEL_HULP_SCHERMDELEN = 'Hulp via schermdelen';
declare global {
  interface Window {
    CobrowseWidget?: unknown;
  }
}

export function CobrowseFooter() {
  const licenseKey = import.meta.env.REACT_APP_COBROWSE_LICENSE_KEY;
  const [cobrowseWidget, setCobrowseWidget] = useState<CobrowseWidget | null>(
    null
  );
  const isCobrowseActive = useIsBffToggleEnabled('BFF_COBROWSE_IS_ACTIVE');
  useEffect(() => {
    if (!isCobrowseActive || !licenseKey) {
      return;
    }
    if (cobrowseWidget) {
      return;
    }
    import('./lib/cobrowse-widget.js').then(({ CobrowseWidget }) => {
      const redactedViews = [`.${REDACTED_CLASS}`];
      const widget = new CobrowseWidget(licenseKey, redactedViews);
      setCobrowseWidget(widget);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCobrowseActive]);

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
