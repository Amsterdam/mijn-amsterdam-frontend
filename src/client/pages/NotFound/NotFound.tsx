import { useEffect } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';
import { useLocation } from 'react-router';

import {
  PageContentCell,
  PageContentV2,
  TextPageV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { captureMessage } from '../../helpers/monitoring';

export function NotFound() {
  const location = useLocation();

  useEffect(() => {
    captureMessage('404  Not Found', {
      properties: {
        url: location.pathname,
      },
    });
  }, [location.pathname]);

  return (
    <TextPageV2>
      <PageContentV2 id="skip-to-id-AppContent">
        <PageHeadingV2>404 - Pagina niet gevonden</PageHeadingV2>
        <PageContentCell>
          <Paragraph className="ams-mb--xl">
            Helaas, de pagina waar u naar op zoek was bestaat niet (meer).
          </Paragraph>
        </PageContentCell>
      </PageContentV2>
    </TextPageV2>
  );
}
