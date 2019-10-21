import React from 'react';
import { TextPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';

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
