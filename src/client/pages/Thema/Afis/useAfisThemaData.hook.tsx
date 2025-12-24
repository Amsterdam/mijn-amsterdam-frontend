import {
  facturenTableConfig,
  listPageTitle,
  linkListItems,
  themaTitle,
  themaId as themaIdAfis,
  routeConfig,
} from './Afis-thema-config';
import { useTransformFacturen } from './useAfisFacturenApi';
import {
  hasFailedDependency,
  isError,
  isLoading,
} from '../../../../universal/helpers/api';
import { LinkProps } from '../../../../universal/types/App.types';
import type { ThemaRouteConfig } from '../../../config/thema-types';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
import {
  useThemaBreadcrumbs,
  useThemaMenuItemByThemaID,
} from '../../../hooks/useThemaMenuItems';
import {
  BELASTINGEN_ROUTE_DEFAULT,
  themaId as themaIdBelastingen,
} from '../Belastingen/Belastingen-thema-config';

export type AfisFacturenThemaContextParams = {
  themaId: string;
  tableConfig: typeof facturenTableConfig;
  routeConfigListPage: ThemaRouteConfig;
  routeConfigDetailPage: ThemaRouteConfig;
};

export function useAfisFacturenData(
  themaContextParams?: AfisFacturenThemaContextParams
) {
  const {
    routeConfigDetailPage = routeConfig.detailPage,
    themaId = themaIdAfis,
    tableConfig = facturenTableConfig,
    routeConfigListPage = routeConfig.listPage,
  } = themaContextParams || {};
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted =
    AFIS.content?.businessPartnerIdEncrypted ?? null;
  const facturenByState = useTransformFacturen(
    AFIS.content?.facturen ?? null,
    routeConfigDetailPage.path
  );

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
  const menuItem = useThemaMenuItemByThemaID(themaIdBelastingen);
  const urlNaarBelastingen = menuItem?.to;

  const belastingenLinkListItem: LinkProps = {
    title: 'Belastingen op Mijn Amsterdam',
    to: urlNaarBelastingen || BELASTINGEN_ROUTE_DEFAULT,
  };

  const breadcrumbs = useThemaBreadcrumbs(themaIdAfis);

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
    title: themaTitle,
    belastingenLinkListItem,
    businessPartnerIdEncrypted,
    businessPartnerId,
    facturenByState,
    facturenTableConfig: tableConfig,
    isThemaPaginaError,
    isThemaPaginaLoading,
    listPageTitle,
    linkListItems: [...linkListItems, belastingenLinkListItem],
    routeConfig,
    breadcrumbs,
    dependencyErrors,
  };
}
