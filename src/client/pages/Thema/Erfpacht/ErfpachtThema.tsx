import { Paragraph, Link, Heading } from '@amsterdam/design-system-react';

import {
  filterErfpachtFacturen,
  mapErfpachtFacturen,
} from './Erfpacht-helpers';
import { themaConfig } from './Erfpacht-thema-config';
import { useErfpachtThemaData } from './useErfpachtThemaData.hook';
import { ErfpachtDossierFrontend } from '../../../../server/services/erfpacht/erfpacht-types';
import { entries } from '../../../../universal/helpers/utils';
import { MaRouterLink } from '../../../components/MaLink/MaLink';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaPagina from '../../../components/Thema/ThemaPagina';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';
import * as afis from '../Afis/Afis-thema-config';
import { AfisFacturenTables } from '../Afis/AfisFacturenTables';

export function ErfpachtThema() {
  const {
    themaId,
    title,
    isError,
    isLoading,
    tableConfig,
    dossiers,
    erfpachtFacturenTableConfig,
    themaConfig,
  } = useErfpachtThemaData();

  useHTMLDocumentTitle(themaConfig.route);

  const pageContentTables = tableConfig
    ? entries(tableConfig).map(
        ([kind, { title, displayProps, listPageRoute, maxItems }]) => {
          return (
            <ThemaPaginaTable<ErfpachtDossierFrontend>
              key={kind}
              title={title}
              zaken={dossiers}
              displayProps={displayProps}
              maxItems={maxItems}
              listPageRoute={listPageRoute}
            />
          );
        }
      )
    : [];

  return (
    <ThemaPagina
      id={themaId}
      title={title}
      isLoading={isLoading}
      isError={isError}
      pageLinks={themaConfig.pageLinks}
      maintenanceNotificationsPageSlug="erfpacht"
      pageContentTop={
        <>
          <PageContentCell spanWide={8}>
            <Paragraph>
              Hieronder ziet u de gegevens van uw erfpachtrechten. Wij
              vernieuwen dit portaal. Daarom kunt u op dit moment de status van
              uw wijzigingsaanvraag helaas niet inzien. Als u een
              ontvangstbevestiging van ons heeft gehad, kunt u ervan uitgaan dat
              wij uw aanvraag hebben ontvangen. Heeft u een toch nog een vraag,
              stuur dan een e-mail naar{' '}
              <Link rel="noreferrer" href="mailto:erfpacht@amsterdam.nl">
                erfpacht@amsterdam.nl
              </Link>
              .
            </Paragraph>
          </PageContentCell>
        </>
      }
      pageContentMain={
        <>
          {pageContentTables}
          {themaConfig.featureToggle.afisFacturenTablesActive && (
            <AfisFacturenTables
              themaContextParams={{
                tableConfig: erfpachtFacturenTableConfig,
                routeConfigDetailPage: themaConfig.detailPageFactuur.route,
                routeConfigListPage: themaConfig.listPageFacturen.route,
                themaId: themaId,
                states: ['open'],
                factuurFilterFn: filterErfpachtFacturen,
                factuurMapFn: mapErfpachtFacturen,
              }}
            />
          )}
          <PageContentCell spanWide={8}>
            <MissingFacturenDescription />
          </PageContentCell>
        </>
      }
    />
  );
}

function MissingFacturenDescription() {
  return (
    <>
      <Heading level={3}>Facturen</Heading>
      <Paragraph className="ams-mb-m">
        {!themaConfig.featureToggle.afisFacturenTablesActive ? (
          <>
            Facturen vanaf 1 januari 2025 en nog niet betaalde facturen kunt u
            inzien onder{' '}
            <MaRouterLink href={afis.routeConfig.themaPage.path}>
              {afis.themaTitle}.
            </MaRouterLink>{' '}
            Zoekt u een oudere factuur, stuur dan een e-mail naar{' '}
            <Link
              rel="noreferrer"
              href="mailto:debiteurenadministratie@amsterdam.nl"
            >
              debiteurenadministratie@amsterdam.nl
            </Link>
            .
          </>
        ) : (
          <>
            U ziet hier openstaande facturen vanaf 1 januari 2025. Zoekt u een
            andere factuur? Kijk dan bij{' '}
            <MaRouterLink href={afis.routeConfig.themaPage.path}>
              {afis.themaTitle}
            </MaRouterLink>{' '}
            of stuur een e-mail naar{' '}
            <Link
              rel="noreferrer"
              href="mailto:debiteurenadministratie@amsterdam.nl"
            >
              debiteurenadministratie@amsterdam.nl
            </Link>
            .
          </>
        )}
      </Paragraph>
      <Heading level={4}>Factuur naar ander adres</Heading>
      <Paragraph className="ams-mb-m">
        Facturen sturen wij altijd naar het adres waar u ingeschreven staat in
        de Basis Registratie Personen (BRP). Het is niet mogelijk dit aan te
        passen.
      </Paragraph>
      <Heading level={4}>U woont of verhuist naar het buitenland</Heading>
      <Paragraph>
        Geef bij een verhuizing naar het buitenland altijd uw nieuwe woonadres
        aan ons door. Stuur daarvoor een e-mail naar{' '}
        <Link
          rel="noreferrer"
          href="mailto:debiteurenadministratie@amsterdam.nl"
        >
          debiteurenadministratie@amsterdam.nl
        </Link>
        . Zet hierin altijd uw debiteurennummer.
      </Paragraph>
    </>
  );
}
