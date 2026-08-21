import { Paragraph, Link, Heading } from '@amsterdam/design-system-react';

import {
  filterErfpachtFacturen,
  mapErfpachtFacturen,
} from './Erfpacht-helpers.tsx';
import { useErfpachtThemaData } from './useErfpachtThemaData.hook.tsx';
import type { ErfpachtDossierFrontend } from '../../../../server/services/erfpacht/erfpacht-types.ts';
import type { ErfpachtZaakExcerptFrontend } from '../../../../server/services/erfpacht/erfpacht-zaken-types.ts';
import { MaRouterLink } from '../../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import { ThemaPagina } from '../../../components/Thema/ThemaPagina.tsx';
import { ThemaPaginaTable } from '../../../components/Thema/ThemaPaginaDataView.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';
import * as afis from '../Afis/Afis-thema-config.ts';
import { AfisFacturenTables } from '../Afis/AfisFacturenTables.tsx';

export function ErfpachtThema() {
  const {
    themaId,
    title,
    isError,
    isLoading,
    tableConfig,
    dossiers,
    zaken,
    erfpachtFacturenTableConfig,
    themaConfig,
  } = useErfpachtThemaData();

  useHTMLDocumentTitle(themaConfig.route);

  const zakenTableConfig = tableConfig['erfpacht-zaken'];
  const zakenTable = (
    <ThemaPaginaTable<ErfpachtDossierFrontend | ErfpachtZaakExcerptFrontend>
      title={zakenTableConfig.title}
      zaken={zaken}
      displayProps={zakenTableConfig.displayProps}
      maxItems={zakenTableConfig.maxItems}
      listPageRoute={zakenTableConfig.listPageRoute}
    />
  );
  const dossiersTableConfig = tableConfig['erfpacht-dossiers'];
  const dossiersTable = (
    <ThemaPaginaTable<ErfpachtDossierFrontend | ErfpachtZaakExcerptFrontend>
      title={dossiersTableConfig.title}
      zaken={dossiers}
      displayProps={dossiersTableConfig.displayProps}
      maxItems={dossiersTableConfig.maxItems}
      listPageRoute={dossiersTableConfig.listPageRoute}
    />
  );

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
          {themaConfig.featureToggle.wijzigingsaanvragenActive && (
            <PageContentCell spanWide={8}>
              <Heading size="level-4" level={4}>
                Status aanvraag erfpachtwijziging
              </Heading>
              <Paragraph className="ams-mb-m">
                Heeft u na 12 januari 2026 een wijziging voor uw erfpachtrecht
                aangevraagd via het online formulier? Dan ziet u hieronder de
                status van uw aanvraag. Aanvragen van vóór 12 januari 2026 of
                aanvragen die via e-mail zijn ingediend, staan hier niet bij.
              </Paragraph>
              <Paragraph>
                Als u een ontvangstbevestiging heeft gehad, is uw aanvraag door
                ons ontvangen. Heeft u nog een vraag, stuur dan een e-mail naar{' '}
                <Link rel="noreferrer" href="mailto:erfpacht@amsterdam.nl">
                  erfpacht@amsterdam.nl
                </Link>
              </Paragraph>
            </PageContentCell>
          )}
        </>
      }
      pageContentMain={
        <>
          {themaConfig.featureToggle.wijzigingsaanvragenActive && zakenTable}
          {dossiersTable}
          <AfisFacturenTables
            themaContextParams={{
              tableConfig: erfpachtFacturenTableConfig,
              routeConfigDetailPage: themaConfig.detailPageFactuur.route,
              routeConfigListPage: themaConfig.listPageFacturen.route,
              themaId,
              states: ['open'],
              factuurFilterFn: filterErfpachtFacturen,
              factuurMapFn: mapErfpachtFacturen,
            }}
          />
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
      <Heading level={3}>Andere erfpachtfacturen</Heading>
      <Paragraph className="ams-mb-m">
        Zoekt u een andere factuur? Kijk dan bij{' '}
        <MaRouterLink href={afis.themaConfig.route.path}>
          {afis.themaConfig.title}
        </MaRouterLink>
        .
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
