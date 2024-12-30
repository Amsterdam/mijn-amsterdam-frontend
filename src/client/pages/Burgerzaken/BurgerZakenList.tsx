import { useParams } from 'react-router-dom';

import { useBurgerZakenData } from './useBurgerZakenData.hook';
import { AppRoutes } from '../../../universal/config/routes';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { ThemaTitles } from '../../config/thema';
import { ListPageParamKind } from '../VergunningenV2/config';

export function BurgerZakenList() {
  const { documents, isLoading, isError, tableConfig } = useBurgerZakenData();
  const params = useParams<{ kind: ListPageParamKind }>();
  const appRouteBack = AppRoutes.BURGERZAKEN;

  return (
    <ListPagePaginated
      items={documents
        .filter(tableConfig[params.kind].filter)
        .sort(tableConfig[params.kind].sort)}
      backLinkTitle={ThemaTitles.BURGERZAKEN}
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
