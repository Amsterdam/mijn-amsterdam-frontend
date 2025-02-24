import { useParams } from 'react-router-dom';

import { useBodemData } from './useBodemData.hook';
import { AppRoutes } from '../../../universal/config/routes';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { ListPageParamKind } from '../Vergunningen/Vergunningen-thema-config';

export function BodemList() {
  const { items, isLoading, isError, tableConfig } = useBodemData();
  const appRouteBack = AppRoutes.BODEM;
  const params = useParams<{ kind: ListPageParamKind }>();

  return (
    <ListPagePaginated
      items={items
        .filter(tableConfig[params.kind].filter)
        .sort(tableConfig[params.kind].sort)}
      title={tableConfig[params.kind].title}
      appRoute={AppRoutes['BODEM/LIST']}
      appRouteParams={params}
      appRouteBack={appRouteBack}
      displayProps={tableConfig[params.kind].displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
