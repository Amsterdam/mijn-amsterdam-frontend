import { useEffect, useState } from 'react';

import { PageFooter } from '@amsterdam/design-system-react';

// https://github.com/import-js/eslint-plugin-import/issues/2876
// eslint-disable-next-line import/order
import type { CobrowseWidget } from './lib/cobrowse-widget';

import './lib/cobrowse-widget.css';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';

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
  useEffect(() => {
    if (!FeatureToggle.cobrowseIsActive || !licenseKey) {
      return;
    }
    if (cobrowseWidget) {
      return;
    }
    import('./lib/cobrowse-widget.js').then(({ CobrowseWidget }) => {
      setCobrowseWidget(new CobrowseWidget(licenseKey));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licenseKey]);

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
