import { ReactNode, useEffect, useMemo } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';
import { useParams } from 'react-router';
import useSWR from 'swr';

import {
  AfisFacturenByStateFrontend,
  businessPartnerDetailsLabels,
  eMandateTableConfig,
  facturenTableConfig,
  listPageTitle,
  linkListItems,
  themaTitle,
  themaId,
  routeConfig,
  type WithActionButtons,
} from './Afis-thema-config';
import { AfisEMandateActionUrls } from './AfisEmandateActionButtons';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisThemaResponse,
  AfisFacturenByStateResponse,
  AfisFactuur,
  AfisFactuurState,
  type AfisEMandateFrontend,
} from '../../../../server/services/afis/afis-types';
import { FIFTEEN_MINUTES_MS } from '../../../../universal/config/app';
import {
  hasFailedDependency,
  isError,
  isLoading,
  type ApiSuccessResponse,
} from '../../../../universal/helpers/api';
import { capitalizeFirstLetter } from '../../../../universal/helpers/text';
import { entries } from '../../../../universal/helpers/utils';
import { LinkProps } from '../../../../universal/types/App.types';
import { DocumentLink } from '../../../components/DocumentList/DocumentLink';
import { MaLink, MaRouterLink } from '../../../components/MaLink/MaLink';
import type { BFFApiUrls } from '../../../config/api';
import { generateBffApiUrlWithEncryptedPayloadQuery } from '../../../helpers/api';
import { useSmallScreen } from '../../../hooks/media.hook';
import {
  useAppStateBagApi,
  useAppStateGetter,
} from '../../../hooks/useAppState';
import {
  useThemaBreadcrumbs,
  useThemaMenuItemByThemaID,
} from '../../../hooks/useThemaMenuItems';
import {
  BELASTINGEN_ROUTE_DEFAULT,
  themaId as themaIdBelastingen,
} from '../Belastingen/Belastingen-thema-config';

function getInvoiceStatusDescriptionFrontend(factuur: AfisFactuur): ReactNode {
  switch (factuur.status) {
    case 'openstaand':
      return (
        <>
          {capitalizeFirstLetter(factuur.status)}:{' '}
          <MaLink
            maVariant="fatNoUnderline"
            target="_blank"
            href={factuur.paylink ?? '#missing-paylink'}
          >
            {factuur.statusDescription}
          </MaLink>
        </>
      );
    default:
      return factuur.statusDescription;
  }
}

function mapFactuur(factuur: AfisFactuur, isPhoneScreen: boolean) {
  let factuurNummerEl: ReactNode = factuur.factuurNummer;

  if (factuur.documentDownloadLink) {
    factuurNummerEl = (
      <DocumentLink
        document={{
          id: factuur.factuurNummer,
          datePublished: factuur.datePublished ?? '',
          url: factuur.documentDownloadLink,
          title: `factuur ${factuur.factuurNummer}`,
        }}
      />
    );
  }

  return {
    ...factuur,
    statusDescription: getInvoiceStatusDescriptionFrontend(factuur),
    factuurNummerEl,
  };
}

function useTransformFacturen(
  facturenByState: AfisFacturenByStateResponse | null
): AfisFacturenByStateFrontend | null {
  const isPhoneScreen = useSmallScreen();
  const facturenByStateTransformed: AfisFacturenByStateFrontend | null =
    useMemo(() => {
      if (facturenByState) {
        return Object.fromEntries(
          entries(facturenByState)
            .filter(([_state, facturenResponse]) => facturenResponse !== null)
            .map(([state, facturenResponse]) => [
              state,
              {
                ...facturenResponse,
                facturen:
                  facturenResponse?.facturen?.map((factuur) =>
                    mapFactuur(factuur, isPhoneScreen)
                  ) ?? [],
              },
            ])
        );
      }
      return null;
    }, [facturenByState]);

  return facturenByStateTransformed;
}

/**
 * Uses /overview endpoint for Open and Overview facturen (All the Open facuren are loaded with this endpoint)
 * Uses /facturen/(afgehandeld|overgedragen) for the facturen with this state.
 */
function useAfisFacturenApi(
  businessPartnerIdEncrypted:
    | AfisThemaResponse['businessPartnerIdEncrypted']
    | undefined,
  state?: AfisFactuurState
) {
  const [facturenByStateApiResponse, fetchFacturen, isApiDataCached] =
    useAppStateBagApi<AfisThemaResponse['facturen']>({
      bagThema: `${themaId}_BAG`,
      key: `afis-facturen-${state}`,
    });

  useEffect(() => {
    if (
      businessPartnerIdEncrypted &&
      !isApiDataCached &&
      state &&
      state !== 'open'
    ) {
      fetchFacturen({
        url: generateBffApiUrlWithEncryptedPayloadQuery(
          'AFIS_FACTUREN',
          businessPartnerIdEncrypted,
          { state }
        ),
      });
    }
  }, [businessPartnerIdEncrypted, fetchFacturen, isApiDataCached, state]);

  const facturenByStateApiUpdated = useTransformFacturen(
    facturenByStateApiResponse.content ?? null
  );

  return [
    facturenByStateApiUpdated,
    facturenByStateApiResponse,
    fetchFacturen,
    isApiDataCached,
  ] as const;
}

export function useAfisListPageData(state: AfisFactuurState) {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted =
    AFIS.content?.businessPartnerIdEncrypted ?? null;

  const [facturenByStateFromBAGState, facturenByStateApiResponse] =
    useAfisFacturenApi(businessPartnerIdEncrypted, state);

  const facturenByStateFromMainState = useTransformFacturen(
    AFIS.content?.facturen ?? null
  );

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    themaId: themaId,
    facturenListResponse:
      (state === 'open'
        ? facturenByStateFromMainState?.open
        : facturenByStateFromBAGState?.[state]) ?? null,
    facturenTableConfig,
    isThemaPaginaError: isError(AFIS, false),
    isThemaPaginaLoading: isLoading(AFIS),
    isListPageError:
      state !== 'open' ? isError(facturenByStateApiResponse, false) : false,
    isListPageLoading:
      state !== 'open' ? isLoading(facturenByStateApiResponse) : false,
    listPageTitle,
    routeConfig,
    breadcrumbs,
  };
}

export function useAfisThemaData() {
  const { AFIS } = useAppStateGetter();
  const businessPartnerIdEncrypted =
    AFIS.content?.businessPartnerIdEncrypted ?? null;

  const facturenByState = useTransformFacturen(AFIS.content?.facturen ?? null);
  const menuItem = useThemaMenuItemByThemaID(themaIdBelastingen);
  const urlNaarBelastingen = menuItem?.to;

  const belastingenLinkListItem: LinkProps = {
    title: 'Belastingen op Mijn Amsterdam',
    to: urlNaarBelastingen || BELASTINGEN_ROUTE_DEFAULT,
  };

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    themaId: themaId,
    title: themaTitle,
    belastingenLinkListItem,
    businessPartnerIdEncrypted,
    facturenByState,
    facturenTableConfig,
    isThemaPaginaError: isError(AFIS, false),
    isThemaPaginaLoading: isLoading(AFIS),
    listPageTitle,
    linkListItems: [...linkListItems, belastingenLinkListItem],
    routeConfig,
    breadcrumbs,
    dependencyErrors: {
      open: hasFailedDependency(AFIS, 'open'),
      afgehandeld: hasFailedDependency(AFIS, 'afgehandeld'),
      overgedragen: hasFailedDependency(AFIS, 'overgedragen'),
    },
  };
}

function fetchAfisApi(url: string) {
  return fetch(url, { credentials: 'include' }).then((response) =>
    response.json()
  );
}

function generateApiUrl(
  businessPartnerIdEncrypted: string | null,
  route: keyof typeof BFFApiUrls
) {
  return businessPartnerIdEncrypted
    ? generateBffApiUrlWithEncryptedPayloadQuery(
        route,
        businessPartnerIdEncrypted
      )
    : null;
}

export function useAfisEMandatesData() {
  const isSmallScreen = useSmallScreen();

  const { businessPartnerIdEncrypted } = useAfisThemaData();
  const { title: betaalVoorkeurenTitle } = useAfisBetaalVoorkeurenData(
    businessPartnerIdEncrypted
  );

  const {
    data: eMandatesApiResponse,
    isLoading: isLoadingEMandates,
    error: hasEMandatesError,
    mutate: refetchEMandates,
  } = useSWR<ApiSuccessResponse<AfisEMandateFrontend[]>>(
    generateApiUrl(businessPartnerIdEncrypted, 'AFIS_EMANDATES'),
    fetchAfisApi,
    { dedupingInterval: FIFTEEN_MINUTES_MS }
  );

  const eMandates = (eMandatesApiResponse?.content ?? []).map((eMandate) => {
    return {
      ...eMandate,
      action: <AfisEMandateActionUrls eMandate={eMandate} />,
      detailLinkComponent: (
        <>
          <MaRouterLink maVariant="fatNoUnderline" href={eMandate.link.to}>
            {eMandate.link.title}
          </MaRouterLink>
          {!isSmallScreen && eMandate.acceptantDescription && (
            <Paragraph size="small">{eMandate.acceptantDescription}</Paragraph>
          )}
        </>
      ),
    };
  });

  const title = 'E-Mandaat';
  const breadcrumbs = [
    ...useThemaBreadcrumbs(themaId),
    { to: routeConfig.detailPage.path, title: betaalVoorkeurenTitle },
  ];
  const { id } = useParams<{ id: AfisEMandateFrontend['id'] }>();
  const eMandate = eMandates.find((mandate) => mandate.id === id);

  return {
    title,
    eMandate: eMandate as WithActionButtons<AfisEMandateFrontend>,
    breadcrumbs,
    hasEMandatesError,
    isLoadingEMandates,
    eMandateTableConfig,
    eMandates,
    refetchEMandates,
  };
}

export function useAfisBetaalVoorkeurenData(
  businessPartnerIdEncrypted:
    | AfisThemaResponse['businessPartnerIdEncrypted']
    | undefined
) {
  const {
    data: businesspartnerDetailsApiResponse,
    isLoading: isLoadingBusinessPartnerDetails,
    error: hasBusinessPartnerDetailsError,
  } = useSWR<ApiSuccessResponse<AfisBusinessPartnerDetailsTransformed>>(
    generateApiUrl(businessPartnerIdEncrypted ?? null, 'AFIS_BUSINESSPARTNER'),
    fetchAfisApi,
    { dedupingInterval: FIFTEEN_MINUTES_MS }
  );

  function hasFailedBusinesspartnerDependency(
    dependency: keyof AfisBusinessPartnerDetailsTransformed
  ): boolean {
    return businesspartnerDetailsApiResponse
      ? hasFailedDependency(businesspartnerDetailsApiResponse, dependency)
      : false;
  }

  return {
    title: 'Betaalvoorkeuren',
    businesspartnerDetails: businesspartnerDetailsApiResponse?.content ?? null,
    businessPartnerDetailsLabels,
    isLoadingBusinessPartnerDetails,
    hasBusinessPartnerDetailsError,
    hasFailedEmailDependency: hasFailedBusinesspartnerDependency('email'),
    hasFailedPhoneDependency: hasFailedBusinesspartnerDependency('phone'),
    hasFailedFullNameDependency: hasFailedBusinesspartnerDependency('fullName'),
  };
}
