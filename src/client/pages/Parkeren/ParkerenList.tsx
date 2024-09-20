import { useParams } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config/routes';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { ThemaTitles } from '../../config/thema';
import { Themas } from '../../../universal/config/thema';
import { ListPageParamKind } from '../VergunningenV2/config';
import { useParkerenData } from './useParkerenData.hook';

export function ParkerenList() {
  const params = useParams<{ kind: ListPageParamKind }>();

  const { parkeervergunningen, title, displayProps, isLoading, isError } =
    useParkerenData(params.kind);
  const appRouteBack = AppRoutes['PARKEREN'];

  return (
    <ListPagePaginated
      items={parkeervergunningen}
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
