import { PageContent, PageHeading, TextPage } from '../../components';

import React from 'react';

export default () => {
  return (
    <TextPage>
      <PageHeading>404 - Pagina niet gevonden</PageHeading>
      <PageContent>
        <p>Helaas, de pagina waar u naar op zoek was bestaat niet (meer).</p>
      </PageContent>
    </TextPage>
  );
};
