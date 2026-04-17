import React from 'react';

import {
  Alert,
  Heading,
  Link,
  Paragraph,
  UnorderedList,
} from '@amsterdam/design-system-react';

import { AfisFacturenTables } from './AfisFacturenTables.tsx';
import { useAfisThemaData } from './useAfisThemaData.hook.tsx';
import { entries } from '../../../../universal/helpers/utils.ts';
import { MaButtonRouterLink } from '../../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaPagina from '../../../components/Thema/ThemaPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function getVragenOverAfgehandeldeFactuurText(
  mailSubject: string = 'Vraag over facturen en betaalvoorkeuren'
) {
  return (
    <>
      Afgehandelde facturen van vóór 1 januari 2025 kunnen niet getoond worden.
      Heeft u vragen over deze of andere facturen? Mail dan naar{' '}
      <VragenOverFactuurLink mailSubject={mailSubject} />.
    </>
  );
}

export function getVragenOverFactuurText(
  mailSubject: string = 'Vraag over factuur'
) {
  return (
    <>
      Mist u een factuur of heeft u een vraag over één van uw facturen? Stuur
      een e-mail naar <VragenOverFactuurLink mailSubject={mailSubject} />.
    </>
  );
}

function VragenOverFactuurLink({
  mailSubject = 'Vraag over facturen en betaalvoorkeuren',
}: {
  mailSubject?: string;
}) {
  return (
    <Link
      href={`mailto:debiteurenadministratie@amsterdam.nl?subject=${encodeURIComponent(mailSubject)}`}
    >
      debiteurenadministratie@amsterdam.nl
    </Link>
  );
}

function PageContentTop({
  urlNaarBelastingen,
}: {
  urlNaarBelastingen: string;
}) {
  return (
    <PageContentCell spanWide={8}>
      <Paragraph className="ams-mb-m">
        Heeft u een vraag over één van uw facturen? Mail dan naar{' '}
        <VragenOverFactuurLink mailSubject="Vraag over facturen en betaalvoorkeuren" />
        .
      </Paragraph>
      <Paragraph>
        U ziet hier niet de facturen over Gemeentebelastingen. Deze vindt u
        terug bij{' '}
        <Link rel="noreferrer" href={urlNaarBelastingen}>
          Mijn Belastingen
        </Link>
        .
      </Paragraph>
    </PageContentCell>
  );
}

export function AfisDisclaimer() {
  return (
    <Alert severity="warning" heading="Belangrijk om te weten" headingLevel={4}>
      <UnorderedList markers={false}>
        <UnorderedList.Item>
          Het verwerken van uw betaling kan tot 4 werkdagen duren.
        </UnorderedList.Item>
        <UnorderedList.Item>
          Enkel het openstaande bedrag wordt getoond.
        </UnorderedList.Item>
        <UnorderedList.Item>
          Gebruik de betaallink alleen voor het voldoen van het volledige
          factuurbedrag. Indien er sprake is van een betalingsregeling of
          deelbetaling verzoeken we u het resterend bedrag handmatig over te
          maken onder vermelding van de gegevens op uw factuur.
        </UnorderedList.Item>
      </UnorderedList>
    </Alert>
  );
}

export function AfisDisclaimerOvergedragenFacturen() {
  return (
    <Alert heading="Belangrijk om te weten" severity="warning" headingLevel={4}>
      <Paragraph>
        Als u niet betaalt, wordt uw factuur door Financiën overgedragen naar de
        afdeling Incasso & Invordering van directie Belastingen. Deze afdeling
        is vanaf dat moment verantwoordelijk voor de invordering van uw factuur
        en daarmee uw aanspreekpunt. De status van uw factuur vindt u terug bij
        Mijn Belastingen - gemeente Amsterdam.
      </Paragraph>
      <Heading level={4}>Heeft u vragen?</Heading>
      <Paragraph>
        Afdeling Incasso & Invordering is van maandag tot en met vrijdag tussen
        08.00 en 18.00 uur bereikbaar op{' '}
        <Link rel="noreferrer" href="tel:0202554800">
          020 255 4800
        </Link>
        . U kunt ook een e-mail sturen naar{' '}
        <Link rel="noreferrer" href="mailto:belastingen@amsterdam.nl">
          belastingen@amsterdam.nl
        </Link>
        . Noem in het onderwerp uw vorderingsnummer en team Incasso.
      </Paragraph>
    </Alert>
  );
}

export function AfisThema() {
  const {
    dependencyErrors,
    isThemaPaginaError,
    isThemaPaginaLoading,
    listPageTitle,
    pageLinks,
    belastingenLinkListItem,
    title,
    themaId,
    themaConfig,
  } = useAfisThemaData();

  useHTMLDocumentTitle(themaConfig.route);

  const isPartialError = entries(dependencyErrors).some(
    ([, hasError]) => hasError
  );

  const pageContentSecondary = (
    <PageContentCell>
      <MaButtonRouterLink
        className="ams-mb-m"
        variant="secondary"
        href={themaConfig.betaalVoorkeurenPage.route.path}
      >
        Betaalvoorkeuren
      </MaButtonRouterLink>
      <AfisDisclaimer />
    </PageContentCell>
  );

  const pageContentErrorAlert = (
    <>
      We kunnen niet alle gegevens tonen.{' '}
      {entries(dependencyErrors)
        .filter(([, hasError]) => hasError)
        .map(([state]) => (
          <React.Fragment key={state}>
            <br />- {listPageTitle[state]} kunnen nu niet getoond worden.
          </React.Fragment>
        ))}
    </>
  );

  return (
    <ThemaPagina
      id={themaId}
      title={title}
      isError={isThemaPaginaError}
      isPartialError={isPartialError}
      errorAlertContent={pageContentErrorAlert}
      isLoading={!isThemaPaginaError && isThemaPaginaLoading}
      pageLinks={pageLinks}
      pageContentTop={
        <PageContentTop urlNaarBelastingen={belastingenLinkListItem.to} />
      }
      pageContentMain={
        <>
          {pageContentSecondary}
          <AfisFacturenTables />
        </>
      }
      maintenanceNotificationsPageSlug="afis"
    />
  );
}
