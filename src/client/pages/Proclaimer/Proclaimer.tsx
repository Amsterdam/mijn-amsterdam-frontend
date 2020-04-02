import { PageContent, TextPage } from '../../components/Page/Page';

import { ExternalUrls } from '../../config/App.constants';
import { LinkdInline } from '../../components/Button/Button';
import PageHeading from '../../components/PageHeading/PageHeading';
import React from 'react';

export default () => {
  const complaintsFormUrl = ExternalUrls.AMSTERDAM_COMPLAINTS_FROM;
  const privacyPageUrl = ExternalUrls.AMSTERDAM_PRIVACY_PAGE;

  return (
    <TextPage>
      <PageHeading>Proclaimer</PageHeading>
      <PageContent>
        <p>
          Mijn Amsterdam is een website van de gemeente Amsterdam. Op Mijn
          Amsterdam tonen wij uw persoonlijke informatie uit de verschillende
          systemen die wij beheren. Wij doen ons uiterste best om ervoor te
          zorgen dat uw gegevens kloppen. Is dat niet zo?&nbsp;
          <LinkdInline external={true} href={complaintsFormUrl}>
            Neem dan contact met ons op.
          </LinkdInline>
        </p>
        <p>
          Wij gaan ervan uit dat u verantwoordelijk met uw eigen gegevens
          omgaat. Geef bijvoorbeeld nooit iemand zomaar toegang tot uw
          persoonlijke omgeving. En houd uw gegevens en uw DigiD voor uzelf.
        </p>
        <p>
          Kijk voor de privacyverklaring van de gemeente Amsterdam op&nbsp;
          <LinkdInline external={true} href={privacyPageUrl}>
            amsterdam.nl/privacy
          </LinkdInline>
          .
        </p>
      </PageContent>
    </TextPage>
  );
};
