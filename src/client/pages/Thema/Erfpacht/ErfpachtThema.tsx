import { Alert, Paragraph } from '@amsterdam/design-system-react';

import { useErfpachtThemaData } from './useErfpachtThemaData.hook';
import {
  ErfpachtDossierFrontend,
  ErfpachtDossierFactuurFrontend,
} from '../../../../server/services/erfpacht/erfpacht-types';
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
    title,
    isError,
    isLoading,
    linkListItems,
    tableConfig,
    dossiers,
    openFacturen,
    routeConfig,
    listPageParamKind,
  } = useErfpachtThemaData();

  const afisData = useAfisThemaData();
  const hasOpenstaandeErfpachtFacturen =
    !!afisData.facturenByState?.open?.facturen.filter((factuur) =>
      factuur.afzender.toLowerCase().includes('erfpacht')
    )?.length;

  useHTMLDocumentTitle(routeConfig.themaPage);

  const excludedTables: string[] = [
    listPageParamKind.alleFacturen,
    // At the moment this table will show up with items such as 'Factuurinformatie is niet beschikbaar' in az/prod.
    listPageParamKind.openFacturen,
  ];

  const pageContentTables = tableConfig
    ? entries(tableConfig)
        .filter(([kind]) => !excludedTables.includes(kind))
        .map(([kind, { title, displayProps, listPageRoute, maxItems }]) => {
          return (
            <ThemaPaginaTable<
              ErfpachtDossierFrontend | ErfpachtDossierFactuurFrontend
            >
              key={kind}
              title={title}
              zaken={
                kind === listPageParamKind.erfpachtDossiers
                  ? dossiers
                  : openFacturen
              }
              displayProps={displayProps}
              maxItems={maxItems}
              listPageRoute={listPageRoute}
            />
          );
        })
    : [];

  return (
    <ThemaPagina
      title={title}
      isLoading={isLoading}
      isError={isError}
      linkListItems={linkListItems}
      pageContentTop={
        <>
          <PageContentCell spanWide={8}>
            <Paragraph>
              Hieronder ziet u de gegevens van uw erfpachtrechten.
            </Paragraph>
          </PageContentCell>

          {hasOpenstaandeErfpachtFacturen && (
            <PageContentCell spanWide={8}>
              <FacturenDisclaimer />
            </PageContentCell>
          )}
        </>
      }
      pageContentMain={pageContentTables}
    />
  );
}

function FacturenDisclaimer() {
  return (
    <Alert headingLevel={2} heading="U heeft openstaande facturen">
      <Paragraph>
        Kijk op{' '}
        <MaRouterLink href={afis.routeConfig.themaPage.path}>
          {afis.themaTitle}
        </MaRouterLink>{' '}
        voor uw erfpacht facturen. U kunt hier alleen facturen van 2025 inzien.
      </Paragraph>
    </Alert>
  );
}
