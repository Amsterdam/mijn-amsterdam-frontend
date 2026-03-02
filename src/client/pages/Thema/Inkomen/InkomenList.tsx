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
    themaId,
    zaken,
    tableConfig,
    isLoadingWpi,
    isErrorWpi,
    breadcrumbs,
    themaConfig,
  } = useInkomenThemaData();
  useHTMLDocumentTitle(themaConfig.listPage.route);
  const listPageTableConfig = tableConfig[kind];

  return (
    <ListPagePaginated
      themaId={themaId}
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
