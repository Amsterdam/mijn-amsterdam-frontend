import { useParams } from 'react-router';

import { ListPageParamKind } from './Horeca-thema-config';
import { useHorecaThemaData } from './useHorecaThemaData.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function HorecaList() {
  const { kind = 'lopende-aanvragen' } = useParams<{
    kind: ListPageParamKind;
  }>();
  const {
    vergunningen,
    themaId,
    tableConfig,
    isLoading,
    isError,
    breadcrumbs,
    routeConfig,
  } = useHorecaThemaData();
  useHTMLDocumentTitle(routeConfig.listPage);
  const listPageTableConfig = tableConfig[kind];

  return (
    <ListPagePaginated
      items={vergunningen.filter(listPageTableConfig.filter)}
      themaId={themaId}
      title={listPageTableConfig.title}
      appRoute={listPageTableConfig.listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
