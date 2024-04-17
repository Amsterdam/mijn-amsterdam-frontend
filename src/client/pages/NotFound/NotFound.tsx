import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageContent, PageHeading, TextPage } from '../../components';
import { captureMessage } from '../../utils/monitoring';

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    captureMessage('404  Not Found', {
      properties: {
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
