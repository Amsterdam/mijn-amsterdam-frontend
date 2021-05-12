import { DAYS_LEFT_TO_RENT } from '../../universal/config';
import { AppRoutes } from '../../universal/config/routes';
import {
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
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import {
  fetchVergunningen,
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

interface TransformedVakantieverhuur extends Vakantieverhuur {
  isPast: boolean;
  duration: number | null;
}

interface TransformedVakantieverhuurAfmelding extends VakantieverhuurAfmelding {
  isPast: boolean;
  duration: number | null;
}

interface TransformedVakantieverhuurVergunningaanvraag
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
      dateRequest: defaultDateFormat(item.dateRequest),
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
  const registratiesRequest = fetchRegistraties(
    sessionID,
    passthroughRequestHeaders
  );

  const vergunningenRequest = fetchVergunningen(
    sessionID,
    passthroughRequestHeaders,
    {
      appRoute: AppRoutes.TOERISTISCHE_VERHUUR,
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

  const failedDependencies = getFailedDependencies({
    registraties,
    vergunningen,
  });

  return apiSuccesResult(
    {
      registraties: registraties.content,
      vergunningen: transformVergunningenToVerhuur(
        vergunningen.content as VakantieverhuurVergunningen[]
      ),
      daysLeft: daysLeftInCalendarYear(
        vergunningen.content?.filter(
          (x) => x.caseType === 'Vakantieverhuur'
        ) as Vakantieverhuur[]
      ),
    },
    failedDependencies
  );
}
