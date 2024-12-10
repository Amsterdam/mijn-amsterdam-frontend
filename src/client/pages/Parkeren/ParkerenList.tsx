import { useParams } from 'react-router-dom';

import { useParkerenData } from './useParkerenData.hook';
import { AppRoutes } from '../../../universal/config/routes';
import { Themas } from '../../../universal/config/thema';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { ThemaTitles } from '../../config/thema';
import { ListPageParamKind } from '../VergunningenV2/config';

export function ParkerenList() {
  const params = useParams<{ kind: ListPageParamKind }>();

  const { parkeerVergunningen, isLoading, isError, tableConfig } =
    useParkerenData();
  const appRouteBack = AppRoutes.PARKEREN;

  const title = tableConfig[params.kind].title;
  const displayProps = tableConfig[params.kind].displayProps;

  return (
    <ListPagePaginated
      items={parkeerVergunningen}
      backLinkTitle={ThemaTitles.PARKEREN}
      title={title ?? ''}
      appRoute={AppRoutes['PARKEREN/LIST']}
      appRouteParams={params}
      appRouteBack={appRouteBack}
      displayProps={displayProps}
      thema={Themas.PARKEREN}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
