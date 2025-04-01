import { useEffect } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';
import { Navigate, useLocation } from 'react-router';

import { AppRoutes } from '../../../universal/config/routes';
import {
  PageContentCell,
  PageContentV2,
  TextPageV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { isPrivateRoute } from '../../config/routes';
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

export function RedirectPrivateRoutesToLanding() {
  const location = useLocation();
  const pathname = location.pathname;

  if (isPrivateRoute(pathname)) {
    // Private routes are redirected to Home
    return <Navigate to={AppRoutes.HOME} />;
  }

  // All other routes are presented with a 404 page
  return <NotFound />;
}
