import { useEffect, useState } from 'react';

import { PageFooter } from '@amsterdam/design-system-react';

// https://github.com/import-js/eslint-plugin-import/issues/2876
// eslint-disable-next-line import/order
import type { CobrowseWidget } from './lib/cobrowse-widget';

import './lib/cobrowse-widget.css';
import { isEnabled } from '../../../config/feature-toggles';
import { REDACTED_CLASS, useCobrowseStore } from '../../../helpers/cobrowse';

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
  const setIsScreensharing = useCobrowseStore(
    (state) => state.setIsScreensharing
  );
  const isCobrowseEnabled = isEnabled('cobrowse');
  useEffect(() => {
    if (!isCobrowseEnabled || !licenseKey || cobrowseWidget) {
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
