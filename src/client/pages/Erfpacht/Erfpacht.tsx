import { Paragraph } from '@amsterdam/design-system-react';

import { listPageParamKind } from './Erfpacht-thema-config';
import { useErfpachtThemaData } from './erfpachtData.hook';
import {
  ErfpachtDossier,
  ErfpachtDossierFactuur,
} from '../../../server/services/erfpacht/erfpacht-types';
import { entries } from '../../../universal/helpers/utils';
import { PageContentCell } from '../../components/Page/Page';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ThemaPaginaTable from '../ThemaPagina/ThemaPaginaTable';

export function Erfpacht() {
  const {
    title,
    isError,
    isLoading,
    linkListItems,
    tableConfig,
    dossiers,
    openFacturen,
  } = useErfpachtThemaData();

  const pageContentTables = tableConfig
    ? entries(tableConfig)
        .filter(([kind]) => kind !== listPageParamKind.alleFacturen)
        .map(([kind, { title, displayProps, listPageRoute, maxItems }]) => {
          return (
            <ThemaPaginaTable<ErfpachtDossier | ErfpachtDossierFactuur>
              key={kind}
              title={title}
              zaken={
                kind === listPageParamKind.erfpachtRechten
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
