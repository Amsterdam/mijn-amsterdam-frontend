import { subMonths } from 'date-fns';
import memoize from 'memoizee';
import { generatePath } from 'react-router-dom';
import slug from 'slugme';
import { Chapters, FeatureToggle } from '../../universal/config';
import { MAXIMUM_DAYS_RENT_ALLOWED } from '../../universal/config/app';
import { AppRoutes } from '../../universal/config/routes';
import {
  apiDependencyError,
  apiErrorResult,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../universal/helpers/api';
import {
  calculateDaysBetweenDates,
  dateFormat,
  dateSort,
  defaultDateFormat,
  isCurrentYear,
  isDateInPast,
} from '../../universal/helpers/date';
import {
  hasOtherActualVergunningOfSameType,
  isActualNotification,
  isExpired,
  isNearEndDate,
  NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END,
} from '../../universal/helpers/vergunningen';
import { MyNotification } from '../../universal/types';
import { CaseType } from '../../universal/types/vergunningen';
import { DEFAULT_API_CACHE_TTL_MS, getApiConfig } from '../config';
import { requestData } from '../helpers';
import { AuthProfileAndToken } from '../helpers/app';
import {
  BBVergunning,
  fetchVergunningen,
  toeristischeVerhuurVergunningTypes,
  Vakantieverhuur,
  VakantieverhuurVergunningaanvraag,
  Vergunning,
} from './vergunningen/vergunningen';

export interface ToeristischeVerhuurRegistratieNumberSource {
  registrationNumber: string;
}

export interface ToeristischeVerhuurRegistratieDetailSource {
  rentalHouse: {
    city: string;
    houseLetter: string | null;
    houseNumber: string | null;
    houseNumberExtension: string | null;
    postalCode: string | null;
    street: string | null;
  };
  registrationNumber: string;
  agreementDate: string | null;
}

export interface ToeristischeVerhuurRegistratieDetail {
  city: string;
  houseLetter: string | null;
  houseNumber: string | null;
  houseNumberExtension: string | null;
  postalCode: string | null;
  registrationNumber: string;
  street: string | null;
  agreementDate: string | null;
}

export interface ToeristischeVerhuurRegistratieDetailsSourceData {
  content: ToeristischeVerhuurRegistratieDetail[];
}

async function fetchRegistraties(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const registrationNumbersResponse = await requestData<string[]>(
    getApiConfig('TOERISTISCHE_VERHUUR_REGISTRATIES', {
      url: `${process.env.BFF_LVV_API_URL}bsn`,
      method: 'POST',
      data: JSON.stringify(authProfileAndToken.profile.id),
      transformResponse: (response) => {
        if (!Array.isArray(response)) {
          return [];
        }
        return response.map((r: ToeristischeVerhuurRegistratieNumberSource) =>
          r.registrationNumber.replaceAll(' ', '')
        );
      },
    }),
    requestID
  );

  if (registrationNumbersResponse.status !== 'OK') {
    return registrationNumbersResponse;
  }

  const registrationDetailResponses = await Promise.all(
    registrationNumbersResponse.content?.map((num) => {
      const url = `${process.env.BFF_LVV_API_URL}${num}`;
      return requestData<ToeristischeVerhuurRegistratieDetail>(
        getApiConfig('TOERISTISCHE_VERHUUR_REGISTRATIES', {
          method: 'get',
          url,
        }),
        requestID
      );
    }) || []
  );

  if (!registrationDetailResponses.every((r) => r.status === 'OK')) {
    return apiErrorResult('Could not retrieve all registration details', null);
  }

  const registrations = registrationDetailResponses
    .map((response) => response.content)
    .filter(
      (r): r is ToeristischeVerhuurRegistratieDetail =>
        r !== null && ['amsterdam', 'weesp'].includes(r.city?.toLowerCase())
    );

  return apiSuccessResult(registrations);
}

/** Code to transform and type Decos vergunningen to Toeristische verhuur */
interface ToeristischeVerhuurVergunningProps {
  isActual: boolean;
  duration: number;
}

// A union of the the source types that are retrieved from the Decos api
export type VakantieverhuurVergunning =
  | Vakantieverhuur
  | BBVergunning
  | VakantieverhuurVergunningaanvraag;

export type ToeristischeVerhuur = ToeristischeVerhuurVergunningProps &
  Vakantieverhuur;

export type ToeristischeVerhuurVergunningaanvraag =
  VakantieverhuurVergunningaanvraag & ToeristischeVerhuurVergunningProps;

export type ToeristischeVerhuurBBVergunning = BBVergunning &
  ToeristischeVerhuurVergunningProps;

export type ToeristischeVerhuurVergunning =
  | ToeristischeVerhuur
  | ToeristischeVerhuurBBVergunning
  | ToeristischeVerhuurVergunningaanvraag;

export function daysRentLeftInCalendarYear(
  verhuurItems: ToeristischeVerhuur[]
): number {
  return verhuurItems
    .map((verhuur) => {
      if (!verhuur.dateEnd || !verhuur.dateStart) {
        return 0;
      }

      const startsInCurrentYear = isCurrentYear(verhuur.dateStart);
      const endsInCurrentYear = isCurrentYear(verhuur.dateEnd);
      switch (true) {
        case startsInCurrentYear && endsInCurrentYear:
          return verhuur.duration;
        case startsInCurrentYear && !endsInCurrentYear:
          return calculateDaysBetweenDates(
            `${new Date().getFullYear()}-12-31`,
            verhuur.dateStart
          );
        case !startsInCurrentYear && endsInCurrentYear:
          return calculateDaysBetweenDates(
            verhuur.dateEnd,
            `${new Date().getFullYear()}-01-01`
          );
      }

      return 0;
    })
    .reduce(
      (total: number, duration: number) => total - duration,
      MAXIMUM_DAYS_RENT_ALLOWED
    );
}

export function transformVergunningenToVerhuur(
  vergunningen: VakantieverhuurVergunning[],
  dateCompare?: Date
): ToeristischeVerhuurVergunning[] {
  if (!Array.isArray(vergunningen)) {
    return [];
  }
  const vergunningenTransformed = vergunningen.map((vergunning) => {
    const isActual = vergunning.dateEnd
      ? !isDateInPast(vergunning.dateEnd, dateCompare)
      : true;

    let status = vergunning.status;

    // Add custom status for Vergunning vakantieverhuur only
    if (vergunning.title === 'Vergunning vakantieverhuur') {
      status = vergunning.decision;
      status = !isActual && status !== 'Ingetrokken' ? 'Verlopen' : status;
    } else if (
      vergunning.title === 'Vergunning bed & breakfast' &&
      vergunning.status === 'Afgehandeld'
    ) {
      status = vergunning.decision;
    }

    return {
      ...vergunning,
      status,
      isActual,
      duration:
        vergunning.dateEnd && vergunning.dateStart
          ? calculateDaysBetweenDates(vergunning.dateEnd, vergunning.dateStart)
          : 0,
    };
  });

  const geplandeVerhuur: ToeristischeVerhuur[] = [];
  const overige: ToeristischeVerhuurVergunning[] = [];

  for (const vergunning of vergunningenTransformed) {
    if (vergunning.title === 'Geplande verhuur' && vergunning.isActual) {
      geplandeVerhuur.push(vergunning);
    } else {
      // We consider expired B&B permits as not relevent for the user.
      if (
        vergunning.title === 'Vergunning bed & breakfast' &&
        !vergunning.isActual
      ) {
        continue;
      }
      overige.push(vergunning);
    }
  }

  return [
    ...geplandeVerhuur.sort(dateSort('dateStart', 'asc')),
    ...overige.sort(dateSort('dateStart', 'desc')),
  ];
}

async function fetchAndTransformToeristischeVerhuur(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  profileType: ProfileType = 'private'
) {
  if (!FeatureToggle.toeristischeVerhuurActive) {
    return apiSuccessResult({
      vergunningen: [],
      registraties: [],
      daysLeft: MAXIMUM_DAYS_RENT_ALLOWED,
    });
  }
  const registratiesRequest =
    profileType === 'commercial'
      ? Promise.resolve(apiSuccessResult([]))
      : fetchRegistraties(requestID, authProfileAndToken);

  const vergunningenRequest = fetchVergunningen(
    requestID,
    authProfileAndToken,
    {
      appRoute: (vergunning: Vergunning) => {
        switch (vergunning.caseType) {
          case CaseType.BBVergunning:
            return AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/BB'];
          case CaseType.VakantieverhuurVergunningaanvraag:
            return AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING/VV'];
          case CaseType.VakantieVerhuur:
            return generatePath(
              AppRoutes['TOERISTISCHE_VERHUUR/VAKANTIEVERHUUR'],
              {
                title: slug(vergunning.title, {
                  lower: true,
                }),
                id: vergunning.id,
              }
            );
          default:
            return AppRoutes['TOERISTISCHE_VERHUUR/VAKANTIEVERHUUR'];
        }
      },
      filter: (vergunning): vergunning is VakantieverhuurVergunning =>
        toeristischeVerhuurVergunningTypes.includes(vergunning.caseType),
    }
  );

  const [registratiesResponse, vergunningenResponse] = await Promise.allSettled(
    [registratiesRequest, vergunningenRequest]
  );

  const registraties = getSettledResult(registratiesResponse);
  const vergunningen = getSettledResult(vergunningenResponse);

  const toeristischeVerhuurVergunningen = transformVergunningenToVerhuur(
    vergunningen.content as VakantieverhuurVergunning[]
  );

  const verhuurVergunningen = toeristischeVerhuurVergunningen.filter(
    (verhuur): verhuur is ToeristischeVerhuur =>
      verhuur.title === 'Geplande verhuur' ||
      verhuur.title === 'Afgelopen verhuur'
  );
  const daysLeft = daysRentLeftInCalendarYear(verhuurVergunningen);
  const failedDependencies = getFailedDependencies({
    registraties,
    vergunningen,
  });

  return apiSuccessResult(
    {
      registraties: registraties.status === 'OK' ? registraties.content : [],
      vergunningen: toeristischeVerhuurVergunningen,
      daysLeft,
    },
    failedDependencies
  );
}

export const fetchToeristischeVerhuur = memoize(
  fetchAndTransformToeristischeVerhuur,
  {
    maxAge: DEFAULT_API_CACHE_TTL_MS,
    normalizer: function (args) {
      return args[0] + JSON.stringify(args[1]);
    },
  }
);

export function createToeristischeVerhuurNotification(
  item: ToeristischeVerhuurVergunning,
  items: ToeristischeVerhuurVergunning[]
): MyNotification {
  let title = 'Toeristische verhuur';
  let description = 'Er is een update in uw toeristische verhuur overzicht.';
  let datePublished = item.dateRequest;
  let cta = 'Bekijk uw aanvraag';
  let linkTo = AppRoutes.TOERISTISCHE_VERHUUR;

  const vergunningTitleLower = item.title.toLowerCase();

  if (
    item.title === 'Vergunning bed & breakfast' ||
    item.title === 'Vergunning vakantieverhuur'
  ) {
    const ctaLinkToDetail = generatePath(
      AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
      {
        title: slug(item.caseType, {
          lower: true,
        }),
        id: item.id,
      }
    );
    const ctaLinkToAanvragen =
      item.title === 'Vergunning bed & breakfast'
        ? 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/vergunning/'
        : 'https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/vergunning/';
    switch (true) {
      // B&B + Vakantieverhuurvergunning
      case item.decision === 'Verleend' &&
        isNearEndDate(item) &&
        !hasOtherActualVergunningOfSameType(items, item):
        title = `Uw ${vergunningTitleLower} loopt af`;
        description = `Uw ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} loopt binnenkort af. Vraag op tijd een nieuwe vergunning aan.`;
        cta = `Vergunning aanvragen`;
        linkTo = ctaLinkToAanvragen;
        datePublished = datePublished = dateFormat(
          subMonths(
            new Date(item.dateEnd!),
            NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END
          ),
          'yyyy-MM-dd'
        );
        break;
      // B&B + Vakantieverhuurvergunning
      case item.decision === 'Verleend' &&
        isExpired(item) &&
        !hasOtherActualVergunningOfSameType(items, item):
        title = `Uw ${vergunningTitleLower} is verlopen`;
        description = `Uw ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} is verlopen. U kunt een nieuwe vergunning aanvragen.`;
        cta = 'Vergunning aanvragen';
        linkTo = ctaLinkToAanvragen;
        datePublished = item.dateEnd!;
        break;
      // B&B only
      case item.status === 'Ontvangen':
        title = `Aanvraag ${vergunningTitleLower} ontvangen`;
        description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} ontvangen.`;
        cta = 'Bekijk uw aanvraag';
        linkTo = ctaLinkToDetail;
        datePublished = item.dateRequest;
        break;
      case item.status === 'In behandeling':
        title = `Aanvraag ${vergunningTitleLower} in behandeling`;
        description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} in behandeling genomen.`;
        cta = 'Bekijk uw aanvraag';
        linkTo = ctaLinkToDetail;
        datePublished = item.dateRequest;
        if (item.caseType === CaseType.BBVergunning) {
          datePublished = item.dateWorkflowActive || item.dateRequest;
        }
        break;
      // B&B + Vakantieverhuurvergunning
      case !!item.decision:
        const decision = item.decision?.toLowerCase() || 'afgehandeld';
        title = `Aanvraag ${vergunningTitleLower} ${decision}`;
        description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} ${decision}.`;
        cta = 'Bekijk uw aanvraag';
        linkTo = ctaLinkToDetail;
        datePublished = item.dateDecision || item.dateRequest;
        break;
      // Fallback for both B&B + Vakantieverhuurvergunning
      default:
        title = `Aanvraag ${vergunningTitleLower} in behandeling`;
        description = `Wij hebben uw aanvraag voor een ${vergunningTitleLower} met gemeentelijk zaaknummer ${item.identifier} in behandeling.`;
        cta = `Bekijk uw aanvraag`;
        linkTo = ctaLinkToDetail;
        datePublished = item.dateRequest;
        break;
    }
  } else {
    const ctaLinkToDetail = generatePath(
      AppRoutes['TOERISTISCHE_VERHUUR/VAKANTIEVERHUUR'],
      {
        title: slug(item.title, {
          lower: true,
        }),
        id: item.id,
      }
    );

    const period = !!(item.dateStart && item.dateEnd)
      ? `van ${defaultDateFormat(item.dateStart)} tot ${defaultDateFormat(
          item.dateEnd
        )} `
      : '';

    switch (true) {
      case item.title === 'Geannuleerde verhuur':
        title = `Vakantieverhuur geannuleerd`;
        description = `Wij hebben uw annulering voor vakantieverhuur ${period}ontvangen.`;
        cta = 'Bekijk uw geannuleerde verhuur';
        linkTo = ctaLinkToDetail;
        datePublished = item.dateRequest;
        break;
      case item.title === 'Geplande verhuur':
        title = `Vakantieverhuur gepland`;
        description = `Wij hebben uw melding voor vakantieverhuur ${period}ontvangen.`;
        cta = 'Bekijk uw geplande verhuur';
        linkTo = ctaLinkToDetail;
        datePublished = item.dateRequest;
        break;
    }
  }

  return {
    id: `vergunning-${item.id}-notification`,
    datePublished,
    chapter: Chapters.TOERISTISCHE_VERHUUR,
    title,
    description: description,
    link: {
      to: linkTo,
      title: cta,
    },
  };
}

function createRegistratieNotification(
  item: ToeristischeVerhuurRegistratieDetail
): MyNotification {
  const title = 'Aanvraag landelijk registratienummer toeristische verhuur';
  const description = `Uw landelijke registratienummer voor toeristische verhuur is toegekend. Uw registratienummer is ${item.registrationNumber}.`;
  const datePublished = !!item.agreementDate ? item.agreementDate : '';
  const cta = 'Bekijk uw overzicht toeristische verhuur';
  const linkTo = AppRoutes.TOERISTISCHE_VERHUUR;

  return {
    id: `toeristiche-verhuur-registratie-${item.registrationNumber}-notification`,
    datePublished,
    chapter: Chapters.TOERISTISCHE_VERHUUR,
    title,
    description,
    link: {
      to: linkTo,
      title: cta,
    },
  };
}

export async function fetchToeristischeVerhuurGenerated(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  compareDate?: Date,
  profileType?: ProfileType
) {
  const TOERISTISCHE_VERHUUR = await fetchToeristischeVerhuur(
    requestID,
    authProfileAndToken,
    profileType
  );

  if (TOERISTISCHE_VERHUUR.status === 'OK') {
    const compareToDate = compareDate || new Date();

    const vergunningen = TOERISTISCHE_VERHUUR.content.vergunningen.filter(
      (vergunning) => vergunning.title !== 'Afgelopen verhuur'
    );
    const vergunningNotifications = vergunningen.map((vergunning) =>
      createToeristischeVerhuurNotification(vergunning, vergunningen)
    );

    const registrationsNotifications =
      TOERISTISCHE_VERHUUR.content.registraties.map(
        createRegistratieNotification
      );

    const notifications = [
      ...vergunningNotifications,
      ...registrationsNotifications,
    ];

    const actualNotifications = notifications.filter(
      (notification) =>
        !!notification.datePublished &&
        isActualNotification(notification.datePublished, compareToDate)
    );

    return apiSuccessResult({
      notifications: actualNotifications,
    });
  }

  return apiDependencyError({ TOERISTISCHE_VERHUUR });
}
