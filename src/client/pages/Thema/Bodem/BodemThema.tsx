import { Paragraph } from '@amsterdam/design-system-react';

import { useBodemData } from './useBodemData.hook';
import { LoodMetingFrontend } from '../../../../server/services/bodem/types';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaPagina from '../../../components/Thema/ThemaPagina';
import ThemaPaginaTable from '../../../components/Thema/ThemaPaginaTable';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function BodemThema() {
  const {
    items,
    tableConfig,
    isLoading,
    isError,
    linkListItems,
    id,
    title,
    routeConfig,
  } = useBodemData();
  useHTMLDocumentTitle(routeConfig.themaPage);

  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      { title, displayProps, filter, sort, listPageRoute, maxItems },
    ]) => {
      return (
        <ThemaPaginaTable<LoodMetingFrontend>
          key={kind}
          title={title}
          zaken={items.filter(filter).sort(sort)}
          listPageRoute={listPageRoute}
          displayProps={displayProps}
          textNoContent={`U heeft geen ${title.toLowerCase()}`}
          maxItems={maxItems}
        />
      );
    }
  );
  return (
    <ThemaPagina
      id={id}
      title={title}
      isLoading={isLoading}
      isError={isError}
      pageContentTop={
        <PageContentCell spanWide={8}>
          <Paragraph>
            Op deze pagina vindt u informatie over uw lood in de bodem-check.
          </Paragraph>
        </PageContentCell>
      }
      pageContentMain={tables}
      linkListItems={linkListItems}
    />
  );
}
