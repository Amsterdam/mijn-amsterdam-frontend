import { ReactNode, useEffect, useMemo } from 'react';

import {
  AfisFacturenByStateFrontend,
  businessPartnerDetailsLabels,
  eMandateTableConfig,
  facturenTableConfig,
  listPageTitle,
  routes,
  linkListItems,
} from './Afis-thema-config';
import {
  AfisBusinessPartnerDetailsTransformed,
  AfisThemaResponse,
  AfisFacturenByStateResponse,
  AfisFactuur,
  AfisFactuurState,
} from '../../../server/services/afis/afis-types';
import { Themas } from '../../../universal/config/thema';
import {
  hasFailedDependency,
  isError,
  isLoading,
} from '../../../universal/helpers/api';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { entries } from '../../../universal/helpers/utils';
import { LinkProps } from '../../../universal/types';
import { DocumentLink } from '../../components/DocumentList/DocumentLink';
import { MaLink } from '../../components/MaLink/MaLink';
import { BFFApiUrls } from '../../config/api';
import { BagThemas } from '../../config/thema';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useAppStateBagApi, useAppStateGetter } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useThemaMenuItemByThemaID } from '../../hooks/useThemaMenuItems';

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
  const isPhoneScreen = usePhoneScreen();
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
      bagThema: BagThemas.AFIS,
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
        url: `${BFFApiUrls.AFIS_FACTUREN}/${state}?id=${businessPartnerIdEncrypted}`,
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

  const themaLink = useThemaMenuItemByThemaID(Themas.AFIS);

  return {
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
    routes,
    themaPaginaBreadcrumb: themaLink,
  };
}

export function useAfisThemaData() {
  const { AFIS } = useAppStateGetter();
  const profileType = useProfileTypeValue();
  const businessPartnerIdEncrypted =
    AFIS.content?.businessPartnerIdEncrypted ?? null;

  const facturenByState = useTransformFacturen(AFIS.content?.facturen ?? null);

  const urlNaarBelastingen =
    profileType === 'private'
      ? import.meta.env.REACT_APP_SSO_URL_BELASTINGEN
      : import.meta.env.REACT_APP_SSO_URL_BELASTINGEN_ZAKELIJK;

  const belastingenLinkListItem: LinkProps = {
    title: 'Belastingen op Mijn Amsterdam',
    to: urlNaarBelastingen,
  };

  return {
    belastingenLinkListItem,
    businessPartnerIdEncrypted,
    facturenByState,
    facturenTableConfig,
    isThemaPaginaError: isError(AFIS, false),
    isThemaPaginaLoading: isLoading(AFIS),
    listPageTitle,
    linkListItems: [...linkListItems, belastingenLinkListItem],
    routes,
    dependencyErrors: {
      open: hasFailedDependency(AFIS, 'open'),
      afgehandeld: hasFailedDependency(AFIS, 'afgehandeld'),
      overgedragen: hasFailedDependency(AFIS, 'overgedragen'),
    },
  };
}

export function useAfisBetaalVoorkeurenData(
  businessPartnerIdEncrypted:
    | AfisThemaResponse['businessPartnerIdEncrypted']
    | undefined
) {
  const [
    businesspartnerDetailsApiResponse,
    fetchBusinessPartnerDetails,
    isApiDataCached,
  ] = useAppStateBagApi<AfisBusinessPartnerDetailsTransformed | null>({
    bagThema: BagThemas.AFIS,
    key: `afis-betaalvoorkeuren`,
  });

  const themaLink = useThemaMenuItemByThemaID(Themas.AFIS);

  useEffect(() => {
    if (businessPartnerIdEncrypted && !isApiDataCached) {
      fetchBusinessPartnerDetails({
        url: `${BFFApiUrls.AFIS_BUSINESSPARTNER}?id=${businessPartnerIdEncrypted}`,
      });
    }
  }, [
    businessPartnerIdEncrypted,
    fetchBusinessPartnerDetails,
    isApiDataCached,
  ]);

  return {
    businesspartnerDetails: businesspartnerDetailsApiResponse.content,
    businessPartnerDetailsLabels,
    isLoadingBusinessPartnerDetails: isLoading(
      businesspartnerDetailsApiResponse
    ),
    hasBusinessPartnerDetailsError: isError(
      businesspartnerDetailsApiResponse,
      false
    ),
    hasEmandatesError: false,
    hasFailedEmailDependency: hasFailedDependency(
      businesspartnerDetailsApiResponse,
      'email'
    ),
    hasFailedPhoneDependency: hasFailedDependency(
      businesspartnerDetailsApiResponse,
      'phone'
    ),
    hasFailedFullNameDependency: hasFailedDependency(
      businesspartnerDetailsApiResponse,
      'fullName'
    ),
    eMandateTableConfig,
    eMandates: [],
    isLoadingEmandates: false,
    themaPaginaBreadcrumb: themaLink,
  };
}
