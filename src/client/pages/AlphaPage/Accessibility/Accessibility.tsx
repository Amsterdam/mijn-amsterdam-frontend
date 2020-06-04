import React from 'react';
import {
  TextPage,
  PageHeading,
  PageContent,
  LinkdInline,
} from '../../../components';

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
