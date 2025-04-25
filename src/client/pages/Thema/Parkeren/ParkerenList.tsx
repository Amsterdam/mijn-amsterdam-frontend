import { useParams } from 'react-router';

import { ListPageParamKind } from './Parkeren-thema-config';
import { useParkerenData } from './useParkerenData.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';

export function ParkerenList() {
  const { kind = 'lopende-aanvragen' } = useParams<{
    kind: ListPageParamKind;
  }>();

  const { vergunningen, isLoading, isError, tableConfig, breadcrumbs } =
    useParkerenData();

  const { displayProps, title, filter, sort, listPageRoute } =
    tableConfig[kind];

  return (
    <ListPagePaginated
      items={vergunningen.filter(filter).sort(sort)}
      title={title}
      appRoute={listPageRoute}
      appRouteParams={{ kind }}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
