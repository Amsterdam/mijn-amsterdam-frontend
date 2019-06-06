import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './Proclaimer.module.scss';

export default () => {
  return (
    <PageContentMain className={styles.Proclaimer}>
      <PageContentMainHeading>Proclaimer</PageContentMainHeading>
      <PageContentMainBody variant="regular">
        <p>
          Mijn Amsterdam is een website van de gemeente Amsterdam. Op Mijn
          Amsterdam tonen wij uw persoonlijke informatie uit de verschillende
          systemen die wij beheren. Wij doen ons uiterste best om ervoor te
          zorgen dat uw gegevens kloppen. Is dat niet zo?&nbsp;
          <a href="https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/scKlachtenformulier.aspx/fKlachtenformulier">
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
          <a href="https://www.amsterdam.nl/privacy">amsterdam.nl/privacy</a>.
        </p>
      </PageContentMainBody>
    </PageContentMain>
  );
};
