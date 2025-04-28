import { useParams } from 'react-router';

import { ListPageParamKind } from './Inkomen-thema-config';
import { useInkomenThemaData } from './useInkomenThemaData.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function InkomenList() {
  const { kind = 'lopende-aanvragen' } = useParams<{
    kind: Exclude<ListPageParamKind, 'jaaropgaven' | 'uitkering'>;
  }>();
  const {
    zaken,
    tableConfig,
    listPageRoute,
    isLoadingWpi,
    isErrorWpi,
    breadcrumbs,
    routeConfig,
  } = useInkomenThemaData();
  useHTMLDocumentTitle(routeConfig.listPage.documentTitle);
  const listPageTableConfig = tableConfig[kind];

  return (
    <ListPagePaginated
      items={zaken.filter(listPageTableConfig.filter)}
      title={listPageTableConfig.title}
      appRoute={listPageRoute}
      appRouteParams={{ kind }}
      breadcrumbs={breadcrumbs}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isLoadingWpi}
      isError={isErrorWpi}
    />
  );
}
