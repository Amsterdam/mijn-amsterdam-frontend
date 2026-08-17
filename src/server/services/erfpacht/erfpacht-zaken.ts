import { generatePath } from 'react-router';

import { deriveDossierIdFromDossierNummer } from './erfpacht-dossiers.ts';
import {
  dataRequestConfig,
  featureToggle,
  routes,
} from './erfpacht-service-config.ts';
import {
  getMainStepDescription,
  getParentStatus,
  getSubStepDescription,
  translateResultaat,
  ZAAK_STATUS_FRONTEND,
  type ZaakStatusTypeSource,
} from './erfpacht-zaken-config.ts';
import type {
  ErfpachtZaakDetailFrontend,
  ErfpachtZaakExcerptFrontend,
  ZaakInfoResponseSource,
  ZaakInfoSource,
  ZaakResultaatFrontend,
  ZaakStatusFrontend,
  ZaakStatussenResponseSource,
} from './erfpacht-zaken-types.ts';
import { themaConfig } from '../../../client/pages/Thema/Erfpacht/Erfpacht-thema-config.ts';
import {
  apiErrorResult,
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import {
  dateSort,
  parseDutchDateString,
  toDateFormatted,
  toISOString,
} from '../../../universal/helpers/date.ts';
import type { SomeOtherString } from '../../../universal/helpers/types.ts';
import { hash } from '../../../universal/helpers/utils.ts';
import type {
  LinkProps,
  StatusLineItem,
} from '../../../universal/types/App.types.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getCustomApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import { generateFullApiUrlBFF } from '../../routing/route-helpers.ts';

export function getDossierLinks(zaak: ZaakInfoSource): LinkProps[] {
  return (
    zaak.zaakDossiers?.map((dossierNummer) => {
      const dossierId = deriveDossierIdFromDossierNummer(dossierNummer);
      return {
        to: generatePath(themaConfig.detailPageDossier.route.path, {
          dossierId,
        }),
        title: dossierNummer,
      };
    }) ?? []
  );
}

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
      dossierLinks: getDossierLinks(zaakInfo),
      displayStatus: getParentStatus(zaakInfo.statusOmschrijving),
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
  steps: StatusLineItem<ZaakStatusFrontend, string>[];
  resultaat: ZaakResultaatFrontend | SomeOtherString | null;
};

function transformErfpachtZaakDetailResponse(
  zaakStatussenResponseSource: ZaakStatussenResponseSource
): ZaakStatusResponseFrontend {
  const parentStatusses: ZaakStatusFrontend[] = [
    ZAAK_STATUS_FRONTEND.AANVRAAG,
    ZAAK_STATUS_FRONTEND.IN_BEHANDELING,
    ZAAK_STATUS_FRONTEND.AFGEHANDELD,
  ];

  const stepsFixed: StatusLineItem<ZaakStatusFrontend, ZaakStatusTypeSource>[] =
    parentStatusses.map((statusFixed) => {
      const substeps = zaakStatussenResponseSource.zaakStatussen
        .filter(
          (statusSource) =>
            getParentStatus(statusSource.statustoelichting) === statusFixed
        )
        .map((substep) => {
          const substepItem: StatusLineItem<ZaakStatusTypeSource> = {
            id: hash(substep.statustoelichting + substep.datumStatusGezet),
            status: substep.statustoelichting,
            datePublished: substep.datumStatusGezet,
            description: getSubStepDescription(substep),
            isActive: false,
            isChecked: true,
          };
          return substepItem;
        })
        .toSorted(dateSort('datePublished', 'asc'));

      const hasMatchingSubsteps = !!substeps?.length;
      const [firstSubstep, ...othersubsteps] = substeps ?? [];

      const step: StatusLineItem<ZaakStatusFrontend, ZaakStatusTypeSource> = {
        id: hash(statusFixed),
        status: statusFixed,
        datePublished: firstSubstep?.datePublished ?? '',
        description:
          getMainStepDescription(statusFixed, substeps) ||
          firstSubstep?.description ||
          '',
        isActive: false,
        isChecked: hasMatchingSubsteps,
        substeps: othersubsteps,
      };

      return step;
    });

  function setActiveStep(
    step: StatusLineItem<ZaakStatusFrontend, ZaakStatusTypeSource>
  ) {
    step.isActive = true;
    if (step.substeps?.length) {
      const lastSubstep = step.substeps.at(-1);
      if (lastSubstep) {
        lastSubstep.isActive = true;
      }
    }
  }

  const lastCheckedStep = stepsFixed.findLast((step) => step.isChecked);
  if (lastCheckedStep) {
    setActiveStep(lastCheckedStep);
  } else {
    const firstStep = stepsFixed.at(0);
    if (firstStep) {
      setActiveStep(firstStep);
    }
  }

  if (lastCheckedStep?.status === ZAAK_STATUS_FRONTEND.AFGEHANDELD) {
    // Disabled intermediate steps if Zaak is afgehandeld.
    // This is a situation where the zaak was still in aanvraag fase but was never taken into behandeling, and then was closed.
    stepsFixed.forEach((step) => {
      if (!step.isChecked && !step.isActive) {
        step.isVisible = false;
      }
    });
  }

  return {
    steps: stepsFixed,
    resultaat: translateResultaat(zaakStatussenResponseSource.zaakResultaat),
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

  const resultaat = zaakStatussenResponse.content.resultaat;
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
