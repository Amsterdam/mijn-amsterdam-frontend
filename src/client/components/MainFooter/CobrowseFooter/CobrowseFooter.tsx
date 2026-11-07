import { useEffect, useState } from 'react';

import { PageFooter } from '@amsterdam/design-system-react';
import { usePiwik } from '@amsterdam/piwik-tracker-react';

// https://github.com/import-js/eslint-plugin-import/issues/2876
import type { CobrowseWidget } from './lib/cobrowse-widget.d.ts';

import './lib/cobrowse-widget.css';
import { isEnabled } from '../../../apps/bob/config/feature-toggles.ts';
import { REDACTED_CLASS, useCobrowseStore } from '../../../helpers/cobrowse.ts';

export const LABEL_HULP_SCHERMDELEN = 'Hulp via schermdelen';
declare global {
  interface Window {
    CobrowseWidget?: unknown;
  }
}

export function CobrowseFooter() {
  const { trackVisibility } = usePiwik();
  const licenseKey = import.meta.env.REACT_APP_COBROWSE_LICENSE_KEY;
  const [cobrowseWidget, setCobrowseWidget] = useState<CobrowseWidget | null>(
    null
  );
  const setIsScreensharing = useCobrowseStore(
    (state) => state.setIsScreensharing
  );
  const isCobrowseEnabled = isEnabled('cobrowse');
  // biome-ignore lint/correctness/useExhaustiveDependencies: Preserve the existing hook dependency exclusion.
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
        setIsScreensharing: (isScreensharing) => {
          const wasScreensharing = useCobrowseStore.getState().isScreensharing;
          setIsScreensharing(isScreensharing);
          if (isScreensharing !== wasScreensharing) {
            trackVisibility({
              action: isScreensharing ? 'getoond' : 'verborgen',
              nameOfElementBecameVisible: 'cobrowse',
            });
          }
        },
      });
      setCobrowseWidget(widget);
    });
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
