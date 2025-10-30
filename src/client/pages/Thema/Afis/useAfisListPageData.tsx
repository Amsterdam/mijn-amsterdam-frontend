import {
  facturenTableConfig,
  listPageTitle,
  routeConfig,
  themaId,
} from './Afis-thema-config';
import { useAfisFacturenApi, useTransformFacturen } from './useAfisFacturenApi';
import type { AfisFactuurState } from '../../../../server/services/afis/afis-types';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useAfisListPageData(state: AfisFactuurState) {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted =
    AFIS.content?.businessPartnerIdEncrypted ?? null;

  const api = useAfisFacturenApi(businessPartnerIdEncrypted, state);

  const facturenByStateFromMainState = useTransformFacturen(
    AFIS.content?.facturen ?? null
  );

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    themaId: themaId,
    facturenListResponse:
      state === 'open'
        ? // Open facturen are always loaded and retrieved from the stream endpoint
          facturenByStateFromMainState?.open
        : (api.facturenByState?.[state] ?? null),
    facturenTableConfig,
    isThemaPaginaError: isError(AFIS, false),
    isThemaPaginaLoading: isLoading(AFIS),
    isListPageError: state !== 'open' ? api.isError : false,
    isListPageLoading: state !== 'open' ? api.isLoading : false,
    listPageTitle,
    routeConfig,
    breadcrumbs,
  };
}
