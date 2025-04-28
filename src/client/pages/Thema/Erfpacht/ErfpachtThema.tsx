import { Paragraph } from '@amsterdam/design-system-react';

import { useErfpachtThemaData } from './useErfpachtThemaData.hook';
import {
  ErfpachtDossierFrontend,
  ErfpachtDossierFactuurFrontend,
} from '../../../../server/services/erfpacht/erfpacht-types';
import { entries } from '../../../../universal/helpers/utils';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaPagina from '../../../components/Thema/ThemaPagina';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

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
  useHTMLDocumentTitle(routeConfig.themaPage.documentTitle);

  const pageContentTables = tableConfig
    ? entries(tableConfig)
        .filter(([kind]) => kind !== listPageParamKind.alleFacturen)
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
          <Paragraph>
            Hieronder ziet u de gegevens van uw erfpachtrechten.
          </Paragraph>
        </PageContentCell>
      }
      pageContentMain={pageContentTables}
    />
  );
}
