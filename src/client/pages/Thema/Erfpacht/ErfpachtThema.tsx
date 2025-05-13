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
        <PageContentCell spanWide={8}>
          {openFacturen.length && (
            <>
              <Paragraph>
                Hieronder ziet u de gegevens van uw erfpachtrechten.
              </Paragraph>
              <br />
              <FacturenDisclaimer />
            </>
          )}
        </PageContentCell>
      }
      pageContentMain={pageContentTables}
    />
  );
}

function FacturenDisclaimer() {
  return (
    <Alert severity="info" heading="U heeft openstaande facturen">
      <Paragraph>
        Kijk op{' '}
        <MaRouterLink href={afis.routeConfig.themaPage.path}>
          {afis.themaTitle}
        </MaRouterLink>{' '}
        voor uw erfpacht facturen. U kunt hier alleen facturen zien van na 2025.
      </Paragraph>
    </Alert>
  );
}
