import React, { useEffect, useState } from 'react';

import {
  Alert,
  Heading,
  Link,
  Paragraph,
  Select,
  UnorderedList,
} from '@amsterdam/design-system-react';

import { AfisFacturenTables } from './AfisFacturenTables.tsx';
import { getVragenOverFactuurText } from './AfisVragenOverFactuurLink.tsx';
import { useAfisThemaData } from './useAfisThemaData.hook.tsx';
import type {
  AfisFacturenOverviewResponse,
  AfisKnownBusinessPartner,
} from '../../../../server/services/afis/afis-types.ts';
import { entries } from '../../../../universal/helpers/utils.ts';
import { MaButtonRouterLink } from '../../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import { Spinner } from '../../../components/Spinner/Spinner.tsx';
import { ThemaPagina } from '../../../components/Thema/ThemaPagina.tsx';
import { sendFetchRequest, useBffApi } from '../../../hooks/api/useBffApi.ts';
import { useAppStateStore } from '../../../hooks/useAppStateStore.ts';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

function PageContentTop({
  urlNaarBelastingen,
}: {
  urlNaarBelastingen: string;
}) {
  return (
    <PageContentCell spanWide={8}>
      <Paragraph className="ams-mb-m">
        Hieronder ziet u een overzicht van uw facturen.
        <br />
        {getVragenOverFactuurText('Vraag over facturen en betaalvoorkeuren')}
      </Paragraph>
      <Paragraph>
        U ziet hier niet de facturen over Gemeentebelastingen
        <br />
        Deze vindt u terug bij{' '}
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
          Het verwerken van uw betaling kan tot 5 werkdagen duren.
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
    facturenByState,
    businessPartners,
  } = useAfisThemaData();

  useHTMLDocumentTitle(themaConfig.route);

  const isPartialError = entries(dependencyErrors).some(
    ([, hasError]) => hasError
  );

  const pageContentSecondary = (
    <>
      <PageContentCell>
        <Heading level={2}>Automatische incasso</Heading>
        <Paragraph className="ams-mb-s">
          Facturatiegegevens bekijken en een automatische incasso instellen.
        </Paragraph>
        <MaButtonRouterLink
          className="ams-mb-m"
          variant="secondary"
          href={themaConfig.detailPageBetaalvoorkeuren.route.path}
        >
          Ga naar betaalvoorkeuren
        </MaButtonRouterLink>

        <AfisDisclaimer />
      </PageContentCell>
    </>
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
          {!!businessPartners?.length && (
            <BusinessPartnerSelect businessPartners={businessPartners} />
          )}
          {facturenByState !== null && (
            <>
              {pageContentSecondary}
              <AfisFacturenTables />
            </>
          )}
        </>
      }
      maintenanceNotificationsPageSlug="afis"
    />
  );
}

function BusinessPartnerSelect({
  businessPartners,
}: {
  businessPartners: AfisKnownBusinessPartner[];
}) {
  const appState = useAppStateStore();
  const [businessPartnerIdEncrypted, setBusinessPartnerIdEncrypted] = useState(
    appState.AFIS?.content?.businessPartnerIdEncrypted || '-'
  );

  const { data, fetch, isLoading, isError } = useBffApi(
    'selected-business-partner',
    {
      fetchImmediately: false,
      sendRequest: async (url, { payload }) => {
        return sendFetchRequest<AfisFacturenOverviewResponse>(url).then(
          (response) => {
            appState.mergeAppState('AFIS', {
              content: {
                businessPartnerIdEncrypted: payload.businessPartnerIdEncrypted,
                facturen: response.content,
              },
            });
            return response;
          }
        );
      },
    }
  );

  console.log(data);

  useEffect(() => {
    if (businessPartnerIdEncrypted && businessPartnerIdEncrypted !== '-') {
      fetch(
        `http://localhost:5000/api/v1/services/afis/facturen-overview?id=${businessPartnerIdEncrypted}`,
        {
          payload: {
            businessPartnerIdEncrypted,
          },
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- We only want to fetch the overview when the selected business partner changes, not when the fetch function changes.
  }, [businessPartnerIdEncrypted]);

  return (
    <PageContentCell spanWide={8}>
      <Heading level={2}>Vestiging selecteren</Heading>
      <Paragraph className="ams-mb-s">
        U heeft meerdere vestigingen. Selecteer hieronder de vestiging waarvan u
        de gegevens wilt bekijken.
      </Paragraph>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Select
          disabled={isLoading || isError}
          onChange={(e) => {
            setBusinessPartnerIdEncrypted(e.target.value);
          }}
          value={businessPartnerIdEncrypted}
        >
          <Select.Option value="-">- Selecteer een vestiging -</Select.Option>
          {businessPartners.map((bp) => (
            <Select.Option
              key={bp.kvkVestigingsnummer}
              value={bp.businessPartnerIdEncrypted}
            >
              {bp.vestigingsNaam}
            </Select.Option>
          ))}
        </Select>
        {isLoading && (
          <span>
            &nbsp;
            <Spinner /> Gegevens ophalen...
          </span>
        )}
      </form>
    </PageContentCell>
  );
}
