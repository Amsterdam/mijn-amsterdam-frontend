import { useParams } from 'react-router-dom';

import { ListPageParamKind, tableConfig } from './Vergunningen-thema-config';
import { VergunningFrontendV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';

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

  const appRouteBack = AppRoutes.VERGUNNINGEN;

  return (
    <ListPagePaginated
      items={vergunningen}
      title={title}
      appRoute={AppRoutes['VERGUNNINGEN/LIST']}
      appRouteParams={params}
      appRouteBack={appRouteBack}
      displayProps={displayProps}
      isLoading={isLoading(VERGUNNINGENv2)}
      isError={isError(VERGUNNINGENv2)}
    />
  );
}
