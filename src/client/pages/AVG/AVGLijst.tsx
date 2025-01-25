import { useParams } from 'react-router-dom';

import { useAVGData } from './useAVGData.hook';
import { AppRoutes } from '../../../universal/config/routes';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { ListPageParamKind } from '../VergunningenV2/config';

export function AVGList() {
  const { avgVerzoeken, isLoading, isError, tableConfig } = useAVGData();
  const appRouteBack = AppRoutes.AVG;
  const params = useParams<{ kind: ListPageParamKind }>();

  return (
    <ListPagePaginated
      items={avgVerzoeken
        .filter(tableConfig[params.kind].filter)
        .sort(tableConfig[params.kind].sort)}
      title={tableConfig[params.kind].title}
      appRoute={AppRoutes['AVG/LIST']}
      appRouteParams={params}
      appRouteBack={appRouteBack}
      displayProps={tableConfig[params.kind].displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
