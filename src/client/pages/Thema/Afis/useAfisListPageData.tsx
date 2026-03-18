import { listPageTitle } from './Afis-thema-config.ts';
import { useAfisFacturenApi } from './useAfisFacturenApi.tsx';
import {
  useAfisFacturenData,
  type AfisFacturenThemaContextParams,
} from './useAfisThemaData.hook.tsx';
import type { AfisFactuurStateFrontend } from '../../../../server/services/afis/afis-types.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function useAfisListPageData(
  state: AfisFactuurStateFrontend,
  themaContextParams?: AfisFacturenThemaContextParams
) {
  const {
    themaId,
    tableConfig,
    routeConfigListPage,
    routeConfigDetailPage,
    businessPartnerIdEncrypted,
    facturenByState,
    isThemaPaginaError,
    isThemaPaginaLoading,
  } = useAfisFacturenData(themaContextParams);

  const api = useAfisFacturenApi(
    businessPartnerIdEncrypted,
    state,
    routeConfigDetailPage.path
  );

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
