import React from 'react';
import { TextPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import { LinkdInline } from 'components/Button/Button';

export default () => {
  return (
    <TextPage>
      <PageHeading>Toegankelijkheidsverklaring</PageHeading>
      <PageContent>
        <p>
          Mijn Amsterdam is toegankelijk
          <LinkdInline
            external={true}
            href={'/toegankelijkheidsverklaring-mijn-amsterdam-20200520.html'}
          >
            Toegankelijkheidsverklaring
          </LinkdInline>
        </p>
      </PageContent>
    </TextPage>
  );
};
