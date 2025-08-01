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
    id,
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
      themaId={id}
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
