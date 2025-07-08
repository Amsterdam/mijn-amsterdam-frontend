import { useParams } from 'react-router';

import { useZorgThemaData } from './useZorgThemaData.ts';
import { ListPageParamKind } from './Zorg-thema-config.ts';
import { HistoricItemsMention } from './ZorgThema.tsx';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function ZorgList() {
  const { kind = 'huidige-voorzieningen' } = useParams<{
    kind: ListPageParamKind;
  }>();

  const {
    voorzieningen,
    tableConfig,
    isLoading,
    isError,
    listPageParamKind,
    breadcrumbs,
    routeConfig,
  } = useZorgThemaData();
  useHTMLDocumentTitle(routeConfig.listPage);

  const { filter, title, displayProps, listPageRoute } = tableConfig[kind];

  return (
    <ListPagePaginated
      items={voorzieningen.filter(filter)}
      title={title}
      appRoute={listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
      pageContentBottom={
        <PageContentCell spanWide={8} startWide={3}>
          {kind === listPageParamKind.historic && <HistoricItemsMention />}
        </PageContentCell>
      }
    />
  );
}
