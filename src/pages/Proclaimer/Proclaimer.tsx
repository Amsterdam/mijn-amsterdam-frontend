import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import styles from './Proclaimer.module.scss';
import { trackLink } from 'hooks/analytics.hook';
import pageContentStyles from 'components/PageContentMain/PageContentMain.module.scss';

export default () => {
  const complaintsFormUrl =
    'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/scKlachtenformulier.aspx/fKlachtenformulier';
  const privacyPageUrl = 'https://www.amsterdam.nl/privacy';

  return (
    <PageContentMain className={pageContentStyles.TextPage}>
      <PageContentMainHeading>Proclaimer</PageContentMainHeading>
      <div className={pageContentStyles.PageContent}>
        <p>
          Mijn Amsterdam is een website van de gemeente Amsterdam. Op Mijn
          Amsterdam tonen wij uw persoonlijke informatie uit de verschillende
          systemen die wij beheren. Wij doen ons uiterste best om ervoor te
          zorgen dat uw gegevens kloppen. Is dat niet zo?&nbsp;
          <a
            href={complaintsFormUrl}
            onClick={() => trackLink(complaintsFormUrl)}
          >
            Neem dan contact met ons op.
          </a>
        </p>
        <p>
          Wij gaan ervan uit dat u verantwoordelijk met uw eigen gegevens
          omgaat. Geef bijvoorbeeld nooit iemand zomaar toegang tot uw
          persoonlijke omgeving. En houd uw gegevens en uw DigiD voor uzelf.
        </p>
        <p>
          Kijk voor de privacyverklaring van de gemeente Amsterdam op&nbsp;
          <a href={privacyPageUrl} onClick={() => trackLink(privacyPageUrl)}>
            amsterdam.nl/privacy
          </a>
          .
        </p>
      </div>
    </PageContentMain>
  );
};
