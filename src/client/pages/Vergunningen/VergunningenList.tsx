import { useParams } from 'react-router-dom';

import { useVergunningenThemaData } from './useVergunningenThemaData.hook';
import { ListPageParamKind } from './Vergunningen-thema-config';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function VergunningenList() {
  const params = useParams<{ kind: ListPageParamKind }>();
  const {
    vergunningen,
    isLoading,
    isError,
    tableConfig,
    routes,
    themaPaginaBreadcrumb,
  } = useVergunningenThemaData();
  const { title, displayProps, filter, sort } =
    tableConfig[params.kind] ?? null;

  return (
    <ListPagePaginated
      items={vergunningen.filter(filter).sort(sort)}
      title={title}
      appRoute={routes.listPage}
      appRouteParams={params}
      breadcrumbs={[themaPaginaBreadcrumb]}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
