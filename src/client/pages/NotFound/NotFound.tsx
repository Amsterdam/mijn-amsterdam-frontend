import { useEffect } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';
import { Navigate, useLocation } from 'react-router';

import { isPrivateRoute } from '../../App.routes.tsx';
import { MaRouterLink } from '../../components/MaLink/MaLink.tsx';
import { PageContentCell, PageV2 } from '../../components/Page/Page.tsx';
import { captureMessage } from '../../helpers/monitoring.ts';
import { useHTMLDocumentTitle } from '../../hooks/useHTMLDocumentTitle.ts';
import { LandingRoute } from '../Landing/Landing-routes.ts';
import { SearchPageRoute } from '../Search/Search-routes.ts';

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
    <PageV2 heading="Pagina niet gevonden">
      <PageContentCell>
        <Paragraph className="ams-paragraph">
          Sorry, deze pagina bestaat niet (meer).
        </Paragraph>
        <Paragraph className="ams-mb-xl">
          Gebruik de{' '}
          <MaRouterLink href={SearchPageRoute.route}>zoekfunctie </MaRouterLink>
          of ga naar onze{' '}
          <MaRouterLink href={LandingRoute.route}>homepagina</MaRouterLink>.
        </Paragraph>
      </PageContentCell>
    </PageV2>
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
