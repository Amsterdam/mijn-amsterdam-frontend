import { useParams } from 'react-router';

import { useVergunningenThemaData } from './useVergunningenThemaData.hook';
import { ListPageParamKind } from './Vergunningen-thema-config';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function VergunningenList() {
  const { kind = 'lopende-aanvragen' } = useParams<{
    kind: ListPageParamKind;
  }>();
  const {
    vergunningen,
    id: themaId,
    isLoading,
    isError,
    tableConfig,
    routeConfig,
    breadcrumbs,
  } = useVergunningenThemaData();
  useHTMLDocumentTitle(routeConfig.listPage);

  const { title, displayProps, filter, sort, listPageRoute } =
    tableConfig[kind] ?? null;

  return (
    <ListPagePaginated
      items={vergunningen.filter(filter).sort(sort)}
      themaId={themaId}
      title={title}
      appRoute={listPageRoute}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
