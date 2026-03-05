import { listPageTitle } from './Afis-thema-config';
import { useAfisFacturenApi } from './useAfisFacturenApi';
import {
  useAfisFacturenData,
  type AfisFacturenThemaContextParams,
} from './useAfisThemaData.hook';
import type { AfisFactuurStateFrontend } from '../../../../server/services/afis/afis-types';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useAfisListPageData(
  state: AfisFactuurStateFrontend,
  themaContextParams?: AfisFacturenThemaContextParams
) {
  const {
    themaId,
    tableConfig,
    routeConfigListPage,
    businessPartnerIdEncrypted,
    facturenByState,
    isThemaPaginaError,
    isThemaPaginaLoading,
  } = useAfisFacturenData(themaContextParams);

  const api = useAfisFacturenApi(businessPartnerIdEncrypted, state);

  const facturen =
    (state === 'open'
      ? // Open facturen are always loaded and retrieved from the stream endpoint
        facturenByState?.open
      : (api.facturenByState?.[state] ?? null)
    )?.facturen ?? [];

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    themaId,
    facturen,
    tableConfig,
    isThemaPaginaError,
    isThemaPaginaLoading,
    isListPageError: state !== 'open' ? api.isError : false,
    isListPageLoading: state !== 'open' ? api.isLoading : false,
    listPageTitle,
    routeConfig: routeConfigListPage,
    breadcrumbs,
  };
}
