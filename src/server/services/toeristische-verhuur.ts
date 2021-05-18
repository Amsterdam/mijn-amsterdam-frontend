import { format } from 'date-fns';
import { Chapters, DAYS_LEFT_TO_RENT } from '../../universal/config';
import { FeatureToggle } from '../../universal/config';
import { AppRoutes } from '../../universal/config/routes';
import {
  apiDependencyError,
  apiSuccesResult,
  getFailedDependencies,
  getSettledResult,
} from '../../universal/helpers/api';
import {
  defaultDateFormat,
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

export interface TransformedVakantieverhuur extends Vakantieverhuur {
  isPast: boolean;
  duration: number | null;
}

export interface TransformedVakantieverhuurAfmelding
  extends VakantieverhuurAfmelding {
  isPast: boolean;
  duration: number | null;
}

export interface TransformedVakantieverhuurVergunningaanvraag
  extends VakantieverhuurVergunningaanvraag {
  isPast: boolean;
  duration: number | null;
}

export interface TransformedBBVergunning extends BBVergunning {
  isPast: boolean;
  duration: number | null;
}

export type VakantieverhuurVergunningen =
  | Vakantieverhuur
  | VakantieverhuurAfmelding
  | BBVergunning
  | VakantieverhuurVergunningaanvraag;

export type TransformedVakantieverhuurVergunningen =
  | TransformedVakantieverhuur
  | TransformedVakantieverhuurAfmelding
  | TransformedBBVergunning
  | TransformedVakantieverhuurVergunningaanvraag;

export interface ToeristischeVerhuurRegistratiesSourceData {
  content: ToeristischeVerhuurRegistratie[];
}

export const daysLeftInCalendarYear = (items: Vakantieverhuur[]): number => {
  const itemsThisYear = items.filter((item) => {
    return item.dateStart ? isCurrentYear(item.dateStart) : undefined;
  });
  return itemsThisYear.reduce((a, b) => {
    if (b.dateEnd ? isCurrentYear(b.dateEnd) : undefined) {
      return (
        a -
        (b.dateEnd && b.dateStart
          ? formatDurationBetweenDates(b.dateEnd, b.dateStart)
          : 0)
      );
    } else {
      const daysTillEndOfYear =
        b.dateEnd && b.dateStart
          ? formatDurationBetweenDates(b.dateEnd, b.dateStart)
          : 0;
      return a - daysTillEndOfYear;
    }
  }, DAYS_LEFT_TO_RENT);
};

export function transformVergunningenToVerhuur(
  vergunningen: VakantieverhuurVergunningen[] | null
): TransformedVakantieverhuurVergunningen[] | null {
  return (
    vergunningen?.map((item) => ({
      ...item,
      dateRequest: item.dateRequest,
      dateEnd: item.dateEnd ? defaultDateFormat(item.dateEnd) : null,
      dateStart: item.dateStart ? defaultDateFormat(item.dateStart) : null,
      isPast: item.dateEnd ? isDateInPast(item.dateEnd, new Date()) : false,
      duration:
        item.dateEnd && item.dateStart
          ? formatDurationBetweenDates(item.dateEnd, item.dateStart)
          : null,
    })) ?? null
  );
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
      daysLeft: DAYS_LEFT_TO_RENT,
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
  const daysLeft =
    daysLeftInCalendarYear(
      vergunningen.content?.filter(
        (x) => x.caseType === 'Vakantieverhuur'
      ) as Vakantieverhuur[]
    ) ?? DAYS_LEFT_TO_RENT;

  const failedDependencies = getFailedDependencies({
    registraties,
    vergunningen,
  });

  return apiSuccesResult(
    {
      registraties: registraties.content || [],
      vergunningen:
        transformVergunningenToVerhuur(
          vergunningen.content as VakantieverhuurVergunningen[]
        ) ?? [],
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
  console.log(item.caseType, monthsTillEnd);
  if (
    item.caseType === 'B&B Vergunning' ||
    item.caseType === 'Vakantieverhuur vergunningaanvraag'
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
      case isActive && monthsTillEnd && monthsTillEnd > -3:
        title = `Uw vergunning gemeentelijke ${item.caseType} loopt af`;
        description = `Wij hebben uw aanvraag voor een vergunning ${item.caseType} met gemeentelijk zaaknummer ${item.identifier} loopt binnenkort af. Vraag op tijd een nieuwe vergunning aan`;
        cta = 'Vergunning vakantieverhuur aanvragen';
        linkTo = 'www.amsterdam.nl';
        datePublished = format(new Date(), 'yyyy-MM-dd');

        break;
      case !isActive && monthsTillEnd && monthsTillEnd < 3:
        title = `Uw vergunning gemeentelijke ${item.caseType} is verlopen`;
        description = `Wij hebben uw aanvraag voor een vergunning ${item.caseType} met gemeentelijk zaaknummer ${item.identifier} loopt binnenkort af. Vraag op tijd een nieuwe vergunning aan`;
        cta = 'Vergunning vakantieverhuur aanvragen';
        linkTo = 'www.amsterdam.nl';
        datePublished = format(new Date(), 'yyyy-MM-dd');
        break;
    }
  } else {
    switch (true) {
      case item.caseType === 'Vakantieverhuur afmelding':
        description = `Wij hebben uw melding voor vakantieverhuur ontvangen.`;
        title = `Melding vakantieverhuur geannuleerd`;
        cta = 'Bekijk uw melding';
        datePublished = item.dateRequest;
        break;
      case item.caseType === 'Vakantieverhuur':
        description = `Wij hebben uw melding voor vakantieverhuur ontvangen.`;
        title = `Melding vakantieverhuur ontvangen`;
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

    const notifications: MyNotification[] = Array.isArray(
      TOERISTISCHE_VERHUUR?.content?.vergunningen
    )
      ? TOERISTISCHE_VERHUUR?.content?.vergunningen.map(
          createVergunningNotification
        )
      : [];
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
