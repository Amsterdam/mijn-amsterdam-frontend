import { useParams } from 'react-router-dom';

import { ListPageParamKind, tableConfig } from './Vergunningen-thema-config';
import { VergunningFrontend } from '../../../server/services/vergunningen/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { useAppStateGetter } from '../../hooks/useAppState';

export function VergunningenList() {
  const params = useParams<{ kind: ListPageParamKind }>();
  const appState = useAppStateGetter();
  const { VERGUNNINGEN } = appState;
  const {
    title,
    displayProps,
    filter: vergunningenListFilter,
    sort: vergunningenListSort,
  } = tableConfig[params.kind] ?? null;

  const vergunningenFiltered: VergunningFrontend[] =
    VERGUNNINGEN.content
      ?.filter(vergunningenListFilter)
      .sort(vergunningenListSort) ?? [];
  const vergunningen =
    addLinkElementToProperty<VergunningFrontend>(vergunningenFiltered);

  const appRouteBack = AppRoutes.VERGUNNINGEN;

  return (
    <ListPagePaginated
      items={vergunningen}
      title={title}
      appRoute={AppRoutes['VERGUNNINGEN/LIST']}
      appRouteParams={params}
      appRouteBack={appRouteBack}
      displayProps={displayProps}
      isLoading={isLoading(VERGUNNINGEN)}
      isError={isError(VERGUNNINGEN)}
    />
  );
}
