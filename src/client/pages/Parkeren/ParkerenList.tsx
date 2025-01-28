import { useParams } from 'react-router-dom';

import { ListPageParamKind } from './Parkeren-thema-config';
import { useParkerenData } from './useParkerenData.hook';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function ParkerenList() {
  const params = useParams<{ kind: ListPageParamKind }>();

  const { vergunningen, isLoading, isError, tableConfig, routes } =
    useParkerenData();

  const title = tableConfig[params.kind].title;
  const displayProps = tableConfig[params.kind].displayProps;

  return (
    <ListPagePaginated
      items={vergunningen
        .filter(tableConfig[params.kind].filter)
        .sort(tableConfig[params.kind].sort)}
      title={title ?? ''}
      appRoute={routes.listPage}
      appRouteParams={params}
      appRouteBack={routes.themePage}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
