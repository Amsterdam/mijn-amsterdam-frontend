import { useParams } from 'react-router';

import { ListPageParamKind } from './Inkomen-thema-config.ts';
import { useInkomenThemaData } from './useInkomenThemaData.hook.ts';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function InkomenList() {
  const { kind = 'lopende-aanvragen' } = useParams<{
    kind: Exclude<ListPageParamKind, 'jaaropgaven' | 'uitkering'>;
  }>();
  const {
    zaken,
    tableConfig,
    isLoadingWpi,
    isErrorWpi,
    breadcrumbs,
    routeConfig,
  } = useInkomenThemaData();
  useHTMLDocumentTitle(routeConfig.listPage);
  const listPageTableConfig = tableConfig[kind];

  return (
    <ListPagePaginated
      items={zaken.filter(listPageTableConfig.filter)}
      title={listPageTableConfig.title}
      appRoute={listPageTableConfig.listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isLoadingWpi}
      isError={isErrorWpi}
    />
  );
}
