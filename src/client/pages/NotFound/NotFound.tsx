import { PageContent, PageHeading, TextPage } from '../../components';

import React from 'react';

export default function NotFound() {
  return (
    <TextPage>
      <PageHeading>404 - Pagina niet gevonden</PageHeading>
      <PageContent id="skip-to-id-AppContent">
        <p>Helaas, de pagina waar u naar op zoek was bestaat niet (meer).</p>
      </PageContent>
    </TextPage>
  );
}
