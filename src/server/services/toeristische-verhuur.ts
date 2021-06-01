import { format } from 'date-fns';
import { Chapters, MAXIMUM_DAYS_RENT_ALLOWED } from '../../universal/config';
import { FeatureToggle } from '../../universal/config';
import { AppRoutes } from '../../universal/config/routes';
import {
  apiDependencyError,
  apiSuccesResult,
  getFailedDependencies,
  getSettledResult,
} from '../../universal/helpers/api';
import {
  formatDurationBetweenDates,
  isCurrentYear,
  isDateInPast,
  monthsFromNow,
} from '../../universal/helpers/date';
import { MyNotification } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import {
  BBVergunning,
  fetchVergunningen,
  isActualNotification,
  toeristischeVerhuurVergunningTypes,
  Vakantieverhuur,
  VakantieverhuurAfmelding,
  VakantieverhuurVergunningaanvraag,
} from './vergunningen';

export interface ToeristischeVerhuurRegistratie {
  city: string;
  houseLetter: string | null;
  houseNumber: string | null;
  houseNumberExtension: string | null;
  postalCode: string | null;
  registrationNumber: string | null;
  shortName: string | null;
  street: string | null;
}

interface ToeristischeVerhuurVergunningProps {
  isActual: boolean;
  duration: number;
}

export type ToeristischeVerhuur = ToeristischeVerhuurVergunningProps &
  Vakantieverhuur;

export type ToeristischeVerhuurAfmelding = ToeristischeVerhuurVergunningProps &
  VakantieverhuurAfmelding;

export type ToeristischeVerhuurVergunningaanvraag = VakantieverhuurVergunningaanvraag &
  ToeristischeVerhuurVergunningProps;

export type ToeristischeVerhuurBBVergunning = BBVergunning &
  ToeristischeVerhuurVergunningProps;

export type VakantieverhuurVergunningen =
  | Vakantieverhuur
  | VakantieverhuurAfmelding
  | BBVergunning
  | VakantieverhuurVergunningaanvraag;

export type ToeristischeVerhuurVergunningen =
  | ToeristischeVerhuur
  | ToeristischeVerhuurAfmelding
  | ToeristischeVerhuurBBVergunning
  | ToeristischeVerhuurVergunningaanvraag;

export interface ToeristischeVerhuurRegistratiesSourceData {
  content: ToeristischeVerhuurRegistratie[];
}

const MONTHS_NEAR_END = 3;

export function daysRentLeftInCalendarYear(
  verhuurItems: ToeristischeVerhuur[]
): number {
  return verhuurItems
    .filter(
      (verhuur) => !!(verhuur.dateStart && isCurrentYear(verhuur.dateStart))
    )
    .map((verhuur) => verhuur.duration)
    .reduce(
      (total: number, duration: number) => total - duration,
      MAXIMUM_DAYS_RENT_ALLOWED
    );
}

export function transformVergunningenToVerhuur(
  vergunningen: VakantieverhuurVergunningen[]
): ToeristischeVerhuurVergunningen[] {
  return vergunningen.map((item) => ({
    ...item,
    dateRequest: item.dateRequest,
    isActual: item.dateEnd ? !isDateInPast(item.dateEnd, new Date()) : false,
    duration:
      item.dateEnd && item.dateStart
        ? formatDurationBetweenDates(item.dateEnd, item.dateStart)
        : 0,
  }));
}

export function transformToeristischeVerhuur(
  responseData: ToeristischeVerhuurRegistratiesSourceData
): ToeristischeVerhuurRegistratie[] | null {
  return responseData.content || [];
}

function fetchRegistraties(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return requestData<ToeristischeVerhuurRegistratie[]>(
    getApiConfig('TOERISTISCHE_VERHUUR_REGISTRATIES', {
      transformResponse: transformToeristischeVerhuur,
    }),
    sessionID,
    passthroughRequestHeaders
  );
}

export async function fetchToeristischeVerhuur(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  if (!FeatureToggle.toeristischeVerhuurActive) {
    return apiSuccesResult({
      vergunningen: [],
      registraties: [],
      daysLeft: MAXIMUM_DAYS_RENT_ALLOWED,
    });
  }
  const registratiesRequest = fetchRegistraties(
    sessionID,
    passthroughRequestHeaders
  );

  const vergunningenRequest = fetchVergunningen(
    sessionID,
    passthroughRequestHeaders,
    {
      appRoute: AppRoutes['TOERISTISCHE_VERHUUR/DETAIL'],
      filter: (
        vergunning
      ): vergunning is
        | Vakantieverhuur
        | VakantieverhuurAfmelding
        | VakantieverhuurVergunningaanvraag =>
        toeristischeVerhuurVergunningTypes.includes(vergunning.caseType),
    }
  );

  const [
    registratiesResponse,
    vergunningenResponse,
  ] = await Promise.allSettled([registratiesRequest, vergunningenRequest]);

  const registraties = getSettledResult(registratiesResponse);
  const vergunningen = getSettledResult(vergunningenResponse);
  const verhuurVergunningen = transformVergunningenToVerhuur(
    vergunningen.content as VakantieverhuurVergunningen[]
  );
  const daysLeft = daysRentLeftInCalendarYear(
    verhuurVergunningen.filter(
      (verhuur) => verhuur.caseType === 'Vakantieverhuur'
    ) as ToeristischeVerhuur[]
  );

  const failedDependencies = getFailedDependencies({
    registraties,
    vergunningen,
  });

  return apiSuccesResult(
    {
      registraties: registraties.content || [],
      vergunningen: verhuurVergunningen,
      daysLeft,
    },
    failedDependencies
  );
}

function createVergunningNotification(
  item: VakantieverhuurVergunningen
): MyNotification {
  let title = 'Vakantieverhuur';
  let description = 'Er is een update in uw vergunningsaanvraag.';
  let datePublished = item.dateRequest;
  let cta = 'Bekijk uw aanvraag';
  let linkTo = item.link.to;

  const monthsTillEnd = item.dateEnd ? monthsFromNow(item.dateEnd) : undefined;
  const isActive = item.dateEnd ? new Date() < new Date(item.dateEnd) : false;
  if (
    item.caseType === 'B&B - vergunning' ||
    item.caseType === 'Vakantieverhuur vergunningsaanvraag'
  ) {
    switch (true) {
      case item.status === 'Ontvangen' &&
        isActualNotification(item.dateRequest, new Date()):
        title = `Aanvraag vergunning gemeentelijke ${item.caseType}`;
        description = `Wij hebben uw aanvraag voor een vergunning ${item.caseType} met gemeentelijk zaaknummer ${item.identifier} ontvangen`;
        datePublished = item.dateRequest;
        break;
      case item.status === 'Afgehandeld' &&
        isActualNotification(item.dateRequest, new Date()):
        title = `Aanvraag vergunning gemeentelijke ${item.caseType}`;
        description = `Wij hebben uw aanvraag voor een vergunning ${item.caseType} met gemeentelijk zaaknummer ${item.identifier} afgehandeld`;
        datePublished = item.dateDecision || item.dateRequest;
        break;
      case isActive && monthsTillEnd && monthsTillEnd > -MONTHS_NEAR_END:
        title = `Uw vergunning gemeentelijke ${item.caseType} loopt af`;
        description = `Uw vergunning ${item.caseType} met gemeentelijk zaaknummer ${item.identifier} loopt binnenkort af. Vraag op tijd een nieuwe vergunning aan`;
        cta = 'Vergunning vakantieverhuur aanvragen';
        linkTo =
          'https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/vergunning/';
        datePublished = format(new Date(), 'yyyy-MM-dd');

        break;
      case !isActive && monthsTillEnd && monthsTillEnd < MONTHS_NEAR_END:
        title = `Uw vergunning gemeentelijke ${item.caseType} is verlopen`;
        description = `Uw vergunning ${item.caseType} met gemeentelijk zaaknummer ${item.identifier} is verlopen. U kunt een nieuwe vergunning aanvragen`;
        cta = 'Vergunning vakantieverhuur aanvragen';
        linkTo =
          'https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/vergunning/';
        datePublished = format(new Date(), 'yyyy-MM-dd');
        break;
      default:
        title = `Aanvraag vergunning gemeentelijke ${item.caseType}`;
        description = `Wij hebben uw aanvraag voor een vergunning ${item.caseType} met gemeentelijk zaaknummer ${item.identifier} ontvangen`;
        datePublished = item.dateRequest;
        break;
    }
  } else {
    switch (true) {
      case item.caseType === 'Vakantieverhuur afmelding':
        title = `Melding vakantieverhuur geannuleerd`;
        description = `Wij hebben uw melding voor vakantieverhuur ontvangen.`;
        cta = 'Bekijk uw geannuleerde melding';
        datePublished = item.dateRequest;
        break;
      case item.caseType === 'Vakantieverhuur':
        title = `Melding vakantieverhuur ontvangen`;
        description = `Wij hebben uw melding voor vakantieverhuur ontvangen.`;
        cta = 'Bekijk uw melding';
        datePublished = item.dateRequest;
        break;
    }
  }
  return {
    id: `vergunning-${item.id}-notification`,
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
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  compareDate?: Date
) {
  const TOERISTISCHE_VERHUUR = await fetchToeristischeVerhuur(
    sessionID,
    passthroughRequestHeaders
  );

  if (TOERISTISCHE_VERHUUR.status === 'OK') {
    const compareToDate = compareDate || new Date();

    const vergunningNotifications: MyNotification[] = Array.isArray(
      TOERISTISCHE_VERHUUR?.content?.vergunningen
    )
      ? TOERISTISCHE_VERHUUR?.content?.vergunningen.map(
          createVergunningNotification
        )
      : [];

    const registrationsNotifications: MyNotification[] = Array.isArray(
      TOERISTISCHE_VERHUUR?.content?.vergunningen
    )
      ? TOERISTISCHE_VERHUUR?.content?.vergunningen.map(
          createVergunningNotification
        )
      : [];

    const notifications = [
      ...vergunningNotifications,
      ...registrationsNotifications,
    ];
    const filteredNotifications = notifications.filter(
      (notification) =>
        notification.datePublished &&
        isActualNotification(notification.datePublished, compareToDate)
    );

    return apiSuccesResult({
      notifications: filteredNotifications,
    });
  }

  return apiDependencyError({ TOERISTISCHE_VERHUUR });
}
