import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageContent, PageHeading, TextPage } from '../../components';

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    Sentry.captureMessage('404  Not Found', {
      extra: {
        url: location.pathname,
      },
    });
  }, [location.pathname]);

  return (
    <TextPage>
      <PageHeading>404 - Pagina niet gevonden</PageHeading>
      <PageContent id="skip-to-id-AppContent">
        <p>Helaas, de pagina waar u naar op zoek was bestaat niet (meer).</p>
      </PageContent>
    </TextPage>
  );
}
