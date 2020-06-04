import React from 'react';
import { TextPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import { LinkdInline } from 'components/Button/Button';
import { ExternalUrls } from '../../config/App.constants';

export default () => {
  const complaintsFormUrl = ExternalUrls.AMSTERDAM_COMPLAINTS_FROM;
  const privacyPageUrl = ExternalUrls.AMSTERDAM_PRIVACY_PAGE;

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
