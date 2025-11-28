import { Paragraph, Link, Heading } from '@amsterdam/design-system-react';

import { useErfpachtThemaData } from './useErfpachtThemaData.hook';
import { useWonenThemaData } from './useVvEThemaData.hook';
import { ErfpachtDossierFrontend } from '../../../../server/services/erfpacht/erfpacht-types';
import { entries } from '../../../../universal/helpers/utils';
import { MaRouterLink } from '../../../components/MaLink/MaLink';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaPagina from '../../../components/Thema/ThemaPagina';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';
import * as afis from '../Afis/Afis-thema-config';
import { useAfisThemaData } from '../Afis/useAfisThemaData.hook';

export function ErfpachtThema() {
  const {
    id,
    title,
    isError,
    isLoading,
    linkListItems,
    tableConfig,
    dossiers,
    routeConfig,
  } = useErfpachtThemaData();

  const wonenData = useWonenThemaData();
  const afisData = useAfisThemaData();

  const hasOpenstaandeErfpachtFacturen =
    !!afisData.facturenByState?.open?.facturen.filter((factuur) =>
      factuur.afzender.toLowerCase().includes('erfpacht')
    )?.length;

  useHTMLDocumentTitle(routeConfig.themaPage);

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
      id={id}
      title={title}
      isLoading={isLoading}
      isError={isError}
      linkListItems={linkListItems}
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

          <PageContentCell spanWide={8}>
            <MissingFacturenDescription />
            <>
              <Heading size="level-3" level={3}>
                {wonenData?.wonenData?.name}
              </Heading>
            </>
          </PageContentCell>
        </>
      }
    />
  );
}

function MissingFacturenDescription() {
  return (
    <>
      <Heading size="level-3" level={3}>
        Facturen
      </Heading>
      <Paragraph className="ams-mb-m">
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
      </Paragraph>
      <Heading size="level-4" level={4}>
        Factuur naar ander adres
      </Heading>
      <Paragraph className="ams-mb-m">
        Facturen sturen wij altijd naar het adres waar u ingeschreven staat in
        de Basis Registratie Personen (BRP). Het is niet mogelijk dit aan te
        passen.
      </Paragraph>
      <Heading size="level-4" level={4}>
        U woont of verhuist naar het buitenland
      </Heading>
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
