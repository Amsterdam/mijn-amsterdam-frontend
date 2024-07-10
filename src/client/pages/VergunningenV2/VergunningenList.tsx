import { AppRoutes } from '../../../universal/config/routes';
import { ThemaTitles } from '../../config/thema';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

import { useParams } from 'react-router-dom';
import { VergunningFrontendV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { addLinkElementToProperty } from '../../components/Table/Table';
import { useAppStateGetter } from '../../hooks';
import { ListPageParamKind, tableConfig } from './config';
import { Themas } from '../../../universal/config/thema';

export function VergunningenList() {
  const params = useParams<{ kind: ListPageParamKind }>();
  const appState = useAppStateGetter();
  const { VERGUNNINGENv2 } = appState;
  const {
    title,
    displayProps,
    filter: vergunningenListFilter,
    sort: vergunningenListSort,
  } = tableConfig[params.kind] ?? null;

  const vergunningenFiltered: VergunningFrontendV2[] =
    VERGUNNINGENv2.content
      ?.filter(vergunningenListFilter)
      .sort(vergunningenListSort) ?? [];
  const vergunningen =
    addLinkElementToProperty<VergunningFrontendV2>(vergunningenFiltered);

  const appRouteBack = AppRoutes['VERGUNNINGEN'];

  return (
    <ListPagePaginated
      items={vergunningen}
      backLinkTitle={ThemaTitles.VERGUNNINGEN}
      title={title}
      appRoute={AppRoutes['VERGUNNINGEN/LIST']}
      appRouteParams={params}
      appRouteBack={appRouteBack}
      displayProps={displayProps}
      thema={Themas.VERGUNNINGENv2}
      isLoading={isLoading(VERGUNNINGENv2)}
      isError={isError(VERGUNNINGENv2)}
    />
  );
}
