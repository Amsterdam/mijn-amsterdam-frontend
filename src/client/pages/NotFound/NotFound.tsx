import { useEffect } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';
import { Navigate, useLocation } from 'react-router';

import { BffEndpoints } from '../../../server/routing/bff-routes';
import { isPrivateRoute } from '../../App.routes';
import { MaRouterLink } from '../../components/MaLink/MaLink';
import {
  PageContentCell,
  PageContentV2,
  TextPageV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { captureMessage } from '../../helpers/monitoring';
import { useHTMLDocumentTitle } from '../../hooks/useHTMLDocumentTitle';
import { LandingRoute } from '../Landing/Landing-routes';
import { SearchPageRoute } from '../Search/Search-routes';

export function NotFound() {
  useHTMLDocumentTitle({
    documentTitle: 'Pagina niet gevonden | Mijn Amsterdam',
  });

  const location = useLocation();

  useEffect(() => {
    captureMessage('404 Not Found', {
      properties: {
        url: location.pathname,
      },
    });
  }, [location.pathname]);

  return (
    <TextPageV2>
      <PageContentV2 id="skip-to-id-AppContent">
        <PageHeadingV2>Pagina niet gevonden</PageHeadingV2>
        <PageContentCell>
          <Paragraph className="ams-paragraph">
            Sorry, deze pagina bestaat niet (meer).
          </Paragraph>
          <Paragraph className="ams-mb-xl">
            Gebruik de{' '}
            <MaRouterLink href={SearchPageRoute.route}>
              zoekfunctie{' '}
            </MaRouterLink>
            of ga naar onze{' '}
            <MaRouterLink href={BffEndpoints.ROOT}>homepagina</MaRouterLink>.
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
    return <Navigate to={LandingRoute.route} />;
  }

  // All other routes are presented with a 404 page
  return <NotFound />;
}
