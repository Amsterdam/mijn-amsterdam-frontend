import { useParams } from 'react-router';

import { useVergunningenThemaData } from './useVergunningenThemaData.hook';
import { ListPageParamKind } from './Vergunningen-thema-config';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';

export function VergunningenList() {
  const { kind = 'lopende-aanvragen' } = useParams<{
    kind: ListPageParamKind;
  }>();
  const { vergunningen, isLoading, isError, tableConfig, routes, breadcrumbs } =
    useVergunningenThemaData();

  const { title, displayProps, filter, sort } = tableConfig[kind] ?? null;

  return (
    <ListPagePaginated
      items={vergunningen.filter(filter).sort(sort)}
      title={title}
      appRoute={routes.listPage}
      appRouteParams={{ kind }}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
