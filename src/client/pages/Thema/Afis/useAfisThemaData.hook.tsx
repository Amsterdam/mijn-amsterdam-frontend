import { ReactNode, useMemo } from 'react';

import { generatePath,useParams } from 'react-router';
import { Paragraph } from '@amsterdam/design-system-react';

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
} from './Afis-thema-config';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisThemaResponse,
  AfisFacturenByStateResponse,
  AfisFactuur,
  AfisFactuurState,
  type AfisFacturenResponse,
} from '../../../../server/services/afis/afis-types';
import {
  hasFailedDependency,
  isError,
  isLoading,
} from '../../../../universal/helpers/api';
import { capitalizeFirstLetter } from '../../../../universal/helpers/text';
import { entries } from '../../../../universal/helpers/utils';
import { LinkProps } from '../../../../universal/types/App.types';
import { DocumentLink } from '../../../components/DocumentList/DocumentLink';
import { MaLink, MaRouterLink } from '../../../components/MaLink/MaLink';
import { BFFApiUrls } from '../../../config/api';
import { useBffApi } from '../../../hooks/api/useBffApi';
import { useSmallScreen } from '../../../hooks/media.hook';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
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

export function getDocumentLink(factuur: AfisFactuur): ReactNode {
  if (factuur.documentDownloadLink) {
    return (
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
  return null;
}

function transformFactuur(
  factuur: AfisFactuur,
  state: AfisFactuurState,
  isPhoneScreen: boolean
) {
  let factuurNummerEl: ReactNode = factuur.factuurNummer;

  if (isPhoneScreen) {
    factuurNummerEl = (
      <MaRouterLink
        maVariant="fatNoDefaultUnderline"
        href={generatePath(routeConfig.detailPage.path, {
          factuurNummer: factuur.factuurNummer,
          state,
        })}
      >
        {factuur.factuurNummer}
      </MaRouterLink>
    );
  } else if (factuur.documentDownloadLink) {
    factuurNummerEl = getDocumentLink(factuur);
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
                    transformFactuur(factuur, state, isPhoneScreen)
                  ) ?? [],
              },
            ])
        );
      }
      return null;
    }, [facturenByState, isPhoneScreen]);

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
  state: AfisFactuurState
) {
  const url =
    businessPartnerIdEncrypted && state && state !== 'open'
      ? `${BFFApiUrls.AFIS_FACTUREN}/${state}?id=${businessPartnerIdEncrypted}`
      : null;

  const { data, isError, isLoading } = useBffApi<AfisFacturenResponse>(url);
  const facturenResponse = data?.content ?? null;
  const facturenByStateApiUpdated = useTransformFacturen(
    facturenResponse
      ? {
          [facturenResponse.state]: facturenResponse,
        }
      : null
  );

  return {
    facturenByState: facturenByStateApiUpdated,
    isLoading,
    isError,
  } as const;
}

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

export function useAfisEMandateSWR(businessPartnerIdEncrypted: string | null) {
  return useSWR<AfisEMandateFrontend[]>(
    generateApiUrl(businessPartnerIdEncrypted, 'AFIS_EMANDATES'),
    sendGetRequest,
    { dedupingInterval: FIFTEEN_MINUTES_MS }
  );
}

export function optimisticEmandatesUpdate(
  eMandate: AfisEMandateFrontend,
  payload: Record<string, string>
) {
  return (eMandates: AfisEMandateFrontend[] | undefined) => {
    if (!eMandates) {
      return eMandates;
    }
    return eMandates.map((mandate) => {
      if (mandate.id === eMandate?.id) {
        return {
          ...mandate,
          ...payload,
        };
      }
      return mandate;
    });
  };
}

export function useAfisEmandateUpdate(
  businessPartnerIdEncrypted: string | null,
  eMandate: AfisEMandateFrontend | null
) {
  const { mutate, isLoading, isValidating } = useAfisEMandateSWR(
    businessPartnerIdEncrypted
  );
  const { trigger, isMutating, ...rest } =
    useSWRMutation<AfisEMandateUpdatePayloadFrontend>(
      eMandate?.updateUrl,
      swrPostRequestDefault(),
      {
        onSuccess(eMandateUpdatePayload) {
          if (eMandate && eMandateUpdatePayload) {
            mutate(optimisticEmandatesUpdate(eMandate, eMandateUpdatePayload), {
              revalidate: false,
            });
          }
        },
      }
    );

  return {
    update: async (dateValidTo: string) => {
      trigger({ dateValidTo });
    },
    isMutating: isMutating || isLoading || isValidating,
    ...rest,
  };
}

export function useAfisEMandatesData() {
  const isSmallScreen = useSmallScreen();

  const { businessPartnerIdEncrypted } = useAfisThemaData();
  const { title: betaalVoorkeurenTitle } = useAfisBetaalVoorkeurenData(
    businessPartnerIdEncrypted
  );

  const {
    data: eMandatesApiResponse,
    isLoading,
    error,
    mutate,
  } = useAfisEMandateSWR(businessPartnerIdEncrypted);

  const eMandates = (eMandatesApiResponse ?? []).map((eMandate) => {
    return {
      ...eMandate,
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
    { to: routeConfig.betaalVoorkeuren.path, title: betaalVoorkeurenTitle },
  ];
  const { id } = useParams<{ id: AfisEMandateFrontend['id'] }>();
  const eMandate = eMandates.find((mandate) => mandate.id === id);

  return {
    title,
    eMandate,
    breadcrumbs,
    hasEMandatesError: !!error,
    isLoadingEMandates: isLoading || !eMandatesApiResponse,
    eMandateTableConfig,
    eMandates,
    refetchEMandates: mutate,
    mutate,
  };
}


export function useAfisBetaalVoorkeurenData(
  businessPartnerIdEncrypted:
    | AfisThemaResponse['businessPartnerIdEncrypted']
    | undefined
) {
    const api = useBffApi<AfisBusinessPartnerDetailsTransformed>(
    businessPartnerIdEncrypted
      ? `${BFFApiUrls.AFIS_BUSINESSPARTNER}?id=${businessPartnerIdEncrypted}`
      : null
  );
  const businesspartnerDetailsApiResponse = api.data;

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

