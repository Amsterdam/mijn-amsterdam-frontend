import { useParams } from 'react-router-dom';

import { useParkerenData } from './useParkerenData.hook';
import { AppRoutes } from '../../../universal/config/routes';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { ListPageParamKind } from '../Vergunningen/Vergunningen-thema-config';

export function ParkerenList() {
  const params = useParams<{ kind: ListPageParamKind }>();

  const {
    parkeerVergunningenFromThemaVergunningen,
    isLoading,
    isError,
    tableConfig,
  } = useParkerenData();
  const appRouteBack = AppRoutes.PARKEREN;

  const title = tableConfig[params.kind].title;
  const displayProps = tableConfig[params.kind].displayProps;

  return (
    <ListPagePaginated
      items={parkeerVergunningenFromThemaVergunningen
        .filter(tableConfig[params.kind].filter)
        .sort(tableConfig[params.kind].sort)}
      title={title ?? ''}
      appRoute={AppRoutes['PARKEREN/LIST']}
      appRouteParams={params}
      appRouteBack={appRouteBack}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
