import { generatePath } from 'react-router';

import {
  dataRequestConfig,
  featureToggle,
  routes,
} from './erfpacht-service-config.ts';
import {
  getDisplayStatus,
  ZAAK_STATUS_FRONTEND,
} from './erfpacht-zaken-config.ts';
import type {
  ErfpachtZaakDetailFrontend,
  ErfpachtZaakExcerptFrontend,
  ZaakInfoResponseSource,
  ZaakStatusFrontend,
  ZaakStatussenResponseSource,
  ZaakStatusTypeSource,
} from './erfpacht-zaken-types.ts';
import { themaConfig } from '../../../client/pages/Thema/Erfpacht/Erfpacht-thema-config.ts';
import {
  apiErrorResult,
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import {
  parseDutchDateString,
  toDateFormatted,
  toISOString,
} from '../../../universal/helpers/date.ts';
import { hash } from '../../../universal/helpers/utils.ts';
import type { StatusLineItem } from '../../../universal/types/App.types.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getCustomApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import { generateFullApiUrlBFF } from '../../routing/route-helpers.ts';

function transformErfpachtZakenResponse(
  zakenResponseSource: ZaakInfoResponseSource
): ErfpachtZaakExcerptFrontend[] {
  return (zakenResponseSource.content ?? []).map((zaakInfo) => {
    const datePublished = zaakInfo.formattedStatusDatum
      ? parseDutchDateString(zaakInfo.formattedStatusDatum)
      : null;

    const zaak: ErfpachtZaakExcerptFrontend = {
      ...zaakInfo,
      // Added these fields because the date notation from the API is not in ISO format, and we need to ensure that the date is in a consistent format for frontend use.
      datePublished: datePublished ? toISOString(datePublished) : null,
      datePublishedFormatted: toDateFormatted(datePublished),
      //
      fetchZaakDetailUrl: generateFullApiUrlBFF(
        routes.protected.ERFPACHT_ZAAK_DETAILS,
        {
          uuid: zaakInfo.zaakUuid,
          zaakUrl: zaakInfo.zaakUrl,
        }
      ),
      link: {
        to: generatePath(themaConfig.detailPageZaak.route.path, {
          uuid: zaakInfo.zaakUuid,
        }),
        title: zaakInfo.zaakOmschrijving,
      },
      dossierLinks: zaakInfo.zaakDossiers ?? [],
      displayStatus: getDisplayStatus(zaakInfo.statusOmschrijving),
    };
    return zaak;
  });
}

/**
 * Fetches wijzigingsaanvraag zaken.
 */
export async function fetchErfpachtZaakInfo(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<ErfpachtZaakExcerptFrontend[]>> {
  const config = getCustomApiConfig(dataRequestConfig, {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/vernise/api/zaakinfo`;
    },
    params: {
      page: 1,
      size: 100,
      sort: ['desc'],
    },
    transformResponse: transformErfpachtZakenResponse,
    postponeFetch:
      !featureToggle.wijzigingsaanvragenEnabled ||
      !featureToggle.serviceEnabled,
  });

  const zaakInfoResponse = await requestData<ErfpachtZaakExcerptFrontend[]>(
    config,
    authProfileAndToken
  );

  return zaakInfoResponse;
}

type ZaakStatusResponseFrontend = {
  steps: StatusLineItem<ZaakStatusFrontend, ZaakStatusTypeSource>[];
  result: string;
};

function transformErfpachtZaakDetailResponse(
  zaakStatussenResponseSource: ZaakStatussenResponseSource
): ZaakStatusResponseFrontend {
  const stepStatusFixed: ZaakStatusFrontend[] = [
    ZAAK_STATUS_FRONTEND.AANVRAAG,
    ZAAK_STATUS_FRONTEND.MEER_INFORMATIE_NODIG,
    ZAAK_STATUS_FRONTEND.IN_BEHANDELING,
    ZAAK_STATUS_FRONTEND.AFGEHANDELD,
  ];

  const stepsFixed: StatusLineItem<ZaakStatusFrontend, ZaakStatusTypeSource>[] =
    stepStatusFixed.map((statusFixed) => {
      const substeps = zaakStatussenResponseSource.zaakStatussen.filter(
        (statusSource) =>
          getDisplayStatus(statusSource.statustoelichting) === statusFixed
      );
      const isMeerInformatieStep =
        statusFixed === ZAAK_STATUS_FRONTEND.MEER_INFORMATIE_NODIG;
      const isOptionalStep = isMeerInformatieStep;
      const hasMatchingSubsteps = !!substeps?.length;

      let description = '';

      switch (true) {
        case isMeerInformatieStep && hasMatchingSubsteps:
          description = `Er is meer informatie en tijd nodig om uw aanvraag te beoordelen.`;
          break;
        case statusFixed === ZAAK_STATUS_FRONTEND.IN_BEHANDELING &&
          hasMatchingSubsteps:
          description = `Wij hebben uw aanvraag in behandeling genomen.`;
          break;
        case statusFixed === ZAAK_STATUS_FRONTEND.AFGEHANDELD &&
          hasMatchingSubsteps:
          description = `Wij hebben uw aanvraag afgerond en hebben u hierover bericht gestuurd.`;
          break;
      }

      const step: StatusLineItem<ZaakStatusFrontend, ZaakStatusTypeSource> = {
        id: hash(statusFixed),
        status: statusFixed,
        datePublished: substeps?.at(-1)?.datumStatusGezet ?? '',
        isActive: false,
        isChecked: hasMatchingSubsteps,
        description,
        isVisible: isOptionalStep ? hasMatchingSubsteps : true,
      };

      return step;
    });

  const lastCheckedStep = stepsFixed.findLast((step) => step.isChecked);
  if (lastCheckedStep) {
    lastCheckedStep.isActive = true;
  } else {
    const firstStep = stepsFixed.at(0);
    if (firstStep) {
      firstStep.isActive = true;
    }
  }

  return {
    steps: stepsFixed,
    result: zaakStatussenResponseSource.zaakResultaat,
  };
}

async function fetchErfpachtZaakStatussen(
  authProfileAndToken: AuthProfileAndToken,
  uuid: ErfpachtZaakExcerptFrontend['zaakUuid']
): Promise<ApiResponse<ZaakStatusResponseFrontend>> {
  const config = getCustomApiConfig(dataRequestConfig, {
    formatUrl(requestConfig) {
      return `${requestConfig.url}/vernise/api/zaak/${uuid}/status`;
    },
    transformResponse: transformErfpachtZaakDetailResponse,
  });

  const zaakStatussenResponse = requestData<ZaakStatusResponseFrontend>(
    config,
    authProfileAndToken
  );

  return zaakStatussenResponse;
}

export async function fetchErfpachtZaakDetail(
  authProfileAndToken: AuthProfileAndToken,
  uuid: ErfpachtZaakExcerptFrontend['zaakUuid']
): Promise<ApiResponse<ErfpachtZaakDetailFrontend>> {
  const erfpachtZaakInfoRequest = fetchErfpachtZaakInfo(authProfileAndToken);
  const zaakStatussenRequest = fetchErfpachtZaakStatussen(
    authProfileAndToken,
    uuid
  );

  const [zaakStatussenResponse, erfpachtZaakInfoResponse] = await Promise.all([
    zaakStatussenRequest,
    erfpachtZaakInfoRequest,
  ]);

  if (
    zaakStatussenResponse.status !== 'OK' ||
    erfpachtZaakInfoResponse.status !== 'OK'
  ) {
    return apiErrorResult('Failed to fetch zaak details', null);
  }

  // We're checking the existence of 'zaken' because the response can be either ErfpachtResponseFrontend or ErfpachtErpachterResponse.
  const zaakBase =
    erfpachtZaakInfoResponse.content.find((zaak) => zaak.zaakUuid === uuid) ??
    null;

  if (!zaakBase) {
    return apiErrorResult('Zaak not found', null);
  }

  const resultaat = zaakStatussenResponse.content.result || null;
  const steps = zaakStatussenResponse.content.steps ?? [];

  const zaakDetail: ErfpachtZaakDetailFrontend = {
    ...zaakBase,
    id: zaakBase.zaakUuid,
    title: zaakBase.zaakOmschrijving,
    steps,
    displayStatus:
      resultaat ??
      steps.findLast((step) => step.isChecked)?.status ??
      'Onbekend',
    resultaat,
  };

  return apiSuccessResult(zaakDetail);
}

export const forTesting = {
  transformErfpachtZaakDetailResponse,
  transformErfpachtZakenResponse,
  fetchErfpachtZaakStatussen,
};
