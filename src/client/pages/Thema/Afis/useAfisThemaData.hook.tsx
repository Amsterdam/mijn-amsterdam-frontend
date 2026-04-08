import {
  facturenTableConfig,
  listPageTitle,
  themaConfig as themaAfis,
  routeConfig,
  type AfisFactuurFrontend,
  themaConfig,
} from './Afis-thema-config.ts';
import { useTransformFacturen } from './useAfisFacturenApi.tsx';
import type { AfisFactuurState } from '../../../../server/services/afis/afis-types.ts';
import {
  hasFailedDependency,
  isError,
  isLoading,
} from '../../../../universal/helpers/api.ts';
import type { LinkProps } from '../../../../universal/types/App.types.ts';
import type { ThemaRouteConfig } from '../../../config/thema-types.ts';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import {
  useThemaBreadcrumbs,
  useThemaMenuItemByThemaID,
} from '../../../hooks/useThemaMenuItems.ts';
import { themaConfig as themaBelastingen } from '../Belastingen/Belastingen-thema-config.ts';

export type AfisFacturenThemaContextParams = {
  themaId: string;
  tableConfig: typeof facturenTableConfig;
  routeConfigListPage: ThemaRouteConfig;
  routeConfigDetailPage: ThemaRouteConfig;
  states?: Array<keyof typeof facturenTableConfig>;
  factuurFilterFn?: (
    factuur: AfisFactuurFrontend,
    state?: AfisFactuurState
  ) => boolean;
  factuurMapFn?: (
    factuur: AfisFactuurFrontend,
    state?: AfisFactuurState
  ) => AfisFactuurFrontend;
};

export function useAfisFacturenData(
  themaContextParams?: AfisFacturenThemaContextParams
) {
  const {
    routeConfigDetailPage = themaConfig.detailPage.route,
    themaId = themaAfis.id,
    tableConfig = facturenTableConfig,
    routeConfigListPage = themaConfig.listPage.route,
  } = themaContextParams || {};
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted =
    AFIS.content?.businessPartnerIdEncrypted ?? null;
  const facturenByState = useTransformFacturen(AFIS.content?.facturen ?? null);

  return {
    isThemaPaginaError: isError(AFIS, false),
    isThemaPaginaLoading: isLoading(AFIS),
    themaId,
    facturenByState,
    tableConfig,
    routeConfigDetailPage,
    routeConfigListPage,
    businessPartnerIdEncrypted,
    businessPartnerId: AFIS.content?.businessPartnerId || null,
    dependencyErrors: {
      open: hasFailedDependency(AFIS, 'open'),
      afgehandeld: hasFailedDependency(AFIS, 'afgehandeld'),
      overgedragen: hasFailedDependency(AFIS, 'overgedragen'),
    },
  };
}

export function useAfisThemaData() {
  const menuItem = useThemaMenuItemByThemaID(themaBelastingen.id);
  const urlNaarBelastingen = menuItem?.to;

  const belastingenLinkListItem: LinkProps = {
    title: 'Belastingen op Mijn Amsterdam',
    to: urlNaarBelastingen || themaBelastingen.route.path,
  };

  const breadcrumbs = useThemaBreadcrumbs(themaAfis.id);

  const {
    facturenByState,
    tableConfig,
    businessPartnerIdEncrypted,
    businessPartnerId,
    isThemaPaginaError,
    isThemaPaginaLoading,
    dependencyErrors,
    themaId,
  } = useAfisFacturenData();

  return {
    themaId,
    title: themaConfig.title,
    belastingenLinkListItem,
    businessPartnerIdEncrypted,
    businessPartnerId,
    facturenByState,
    facturenTableConfig: tableConfig,
    isThemaPaginaError,
    isThemaPaginaLoading,
    listPageTitle,
    pageLinks: [...themaConfig.pageLinks, belastingenLinkListItem],
    routeConfig,
    breadcrumbs,
    dependencyErrors,
    themaConfig,
  };
}
