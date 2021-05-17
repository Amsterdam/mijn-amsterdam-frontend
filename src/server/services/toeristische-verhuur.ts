import { Chapters, DAYS_LEFT_TO_RENT } from '../../universal/config';
import { FeatureToggle } from '../../universal/config';
import { AppRoutes } from '../../universal/config/routes';
import { isRecentCase } from '../../universal/helpers';
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
} from '../../universal/helpers/date';
import { MyCase, MyNotification } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import {
  fetchVergunningen,
  isActualNotification,
  toeristischeVerhuurVergunningTypes,
  Vakantieverhuur,
  VakantieverhuurAfmelding,
  VakantieverhuurVergunningaanvraag,
  Vergunning,
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

export type VakantieverhuurVergunningen =
  | Vakantieverhuur
  | VakantieverhuurAfmelding
  | VakantieverhuurVergunningaanvraag;

export type TransformedVakantieverhuurVergunningen =
  | TransformedVakantieverhuur
  | TransformedVakantieverhuurAfmelding
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

function transformVergunningenToVerhuur(
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

function createVergunningRecentCase(item: Vergunning): MyCase {
  return {
    id: `vergunning-${item.id}-case`,
    title: `Vakantie verhuur ${item.identifier}`,
    link: item.link,
    chapter: Chapters.TOERISTISCHE_VERHUUR,
    datePublished: item.dateRequest,
  };
}

function createVergunningNotification(item: Vergunning): MyNotification {
  let title = 'Vakantieverhuur';
  let description = 'Er is een update in uw vergunningsaanvraag.';
  let datePublished = item.dateRequest;

  // let dateEnd = item.dateEnd ? new Date(item.dateEnd) : new Date();

  // switch (item.caseType) {
  //   case 'EvenementenMelding':
  //   case 'TVM - RVV - Object':
  //     dateEnd = new Date(
  //       `${item.dateEnd}${item.timeEnd ? `T${item.timeEnd}` : ''}`
  //     );
  // }

  switch (true) {
    case item.status === 'Afgehandeld' && item.decision === 'Niet verleend':
      description = `Uw ${item.caseType} is niet verleend`;
      datePublished = item.dateDecision || item.dateRequest;
      break;
    case item.status === 'Afgehandeld' && item.decision === 'Ingetrokken':
      description = `Uw ${item.caseType} is ingetrokken`;
      datePublished = item.dateDecision || item.dateRequest;
      break;
    case item.status === 'Afgehandeld' && item.decision === 'Verleend':
      description = `Uw ${item.caseType} is verleend`;
      datePublished = item.dateDecision || item.dateRequest;
      break;
    case item.status !== 'Afgehandeld':
      description = `Uw ${item.caseType} is geregistreerd`;
      break;
    case item.status === 'Afgehandeld':
      description = `Uw ${item.caseType} is afgehandeld`;
      break;
    // case new Date() >= dateEnd:
    //   title = 'Uw vergunning is verlopen';
    //   description = `Uw vergunningsaanvraag ${item.caseType} is afgehandeld`;
    //   break;
  }

  return {
    id: `vergunning-${item.id}-notification`,
    datePublished,
    chapter: Chapters.TOERISTISCHE_VERHUUR,
    title,
    description,
    link: {
      to: item.link.to,
      title: 'Bekijk details',
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

    const cases: MyCase[] = Array.isArray(
      TOERISTISCHE_VERHUUR?.content?.vergunningen
    )
      ? TOERISTISCHE_VERHUUR?.content?.vergunningen
          .filter(
            (vergunning) =>
              vergunning.status !== 'Afgehandeld' ||
              (vergunning.dateDecision &&
                isRecentCase(vergunning.dateDecision, compareToDate))
          )
          .map(createVergunningRecentCase)
      : [];

    const notifications: MyNotification[] = Array.isArray(
      TOERISTISCHE_VERHUUR?.content?.vergunningen
    )
      ? TOERISTISCHE_VERHUUR?.content?.vergunningen
          .filter(
            (vergunning) =>
              vergunning.status !== 'Afgehandeld' ||
              (vergunning.dateDecision &&
                isActualNotification(vergunning.dateDecision, compareToDate))
          )
          .map(createVergunningNotification)
      : [];

    return apiSuccesResult({
      cases,
      notifications,
    });
  }

  return apiDependencyError({ TOERISTISCHE_VERHUUR });
}
