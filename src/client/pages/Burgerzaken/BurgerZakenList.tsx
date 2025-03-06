import { useParams } from 'react-router-dom';

import { useBurgerZakenData } from './useBurgerZakenData.hook';
import { AppRoutes } from '../../../universal/config/routes';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { ListPageParamKind } from '../Vergunningen/Vergunningen-thema-config';

export function BurgerZakenList() {
  const { documents, isLoading, isError, tableConfig } = useBurgerZakenData();
  const params = useParams<{ kind: ListPageParamKind }>();
  const appRouteBack = AppRoutes.BURGERZAKEN;

  return (
    <ListPagePaginated
      items={documents.sort(tableConfig[params.kind].sort)}
      title={tableConfig[params.kind].title}
      appRoute={AppRoutes['BURGERZAKEN/LIST']}
      appRouteParams={params}
      appRouteBack={appRouteBack}
      displayProps={tableConfig[params.kind].displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
