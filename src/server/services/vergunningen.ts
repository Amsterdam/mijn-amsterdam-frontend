import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../universal/config/routing';
import { LinkProps, MyCase } from '../../universal/types/App.types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { hash } from '../../universal/helpers/utils';
import { dateSort } from '../../universal/helpers/date';
import { Chapters } from '../../universal/config/index';

export interface VergunningSource {
  status: string;
  title: string;
  identifier: string;
  caseType: string;
  dateRequest: string;
  dateFrom: string | null;
  dateEndInclusive: string | null; // datum t/m
  timeStart: string | null;
  timeEnd: string | null;
  isActual: boolean;
  kenteken?: string | null;
  location?: string | null;
  outcome?: string | null;
  dateOutcome?: string | null;
}

export type VergunningenSourceData = {
  content?: VergunningSource[];
  status: 'OK' | 'ERROR';
};

export interface Vergunning extends Omit<VergunningSource, 'dateEndInclusive'> {
  id: string;
  dateEnd: string | null;
  link: LinkProps;
}

export type VergunningenData = Vergunning[];

export function transformVergunningenData(
  responseData: VergunningenSourceData
): VergunningenData {
  if (!Array.isArray(responseData?.content)) {
    return [];
  }

  const vergunningen: Vergunning[] = responseData?.content?.map(item => {
    const id = `vergunning-${hash(
      item.identifier || item.caseType + item.dateRequest
    )}`;
    const dateEnd = item.dateEndInclusive;
    delete item.dateEndInclusive;
    const vergunning = Object.assign({}, item, {
      id,
      dateEnd,
      link: {
        to: generatePath(AppRoutes['VERGUNNINGEN/DETAIL'], {
          id,
        }),
        title: item.identifier,
      },
    });
    return vergunning;
  });
  return vergunningen.sort(dateSort('dateRequest', 'desc'));
}

export function fetchVergunningen(
  sessionID: SessionID,
  samlToken: string,
  raw: boolean = false
) {
  return requestData<VergunningenData>(
    getApiConfig('VERGUNNINGEN', {
      transformResponse: (responseData: VergunningenSourceData) =>
        raw ? responseData : transformVergunningenData(responseData),
    }),
    sessionID,
    samlToken
  );
}

export function createVergunningRecentCase(item: Vergunning): MyCase {
  return {
    id: `vergunning-${item.id}-case`,
    title: `Vergunningsaanvraag ${item.identifier}`,
    link: item.link,
    chapter: Chapters.VERGUNNINGEN,
    datePublished: item.dateRequest,
  };
}

export function createVergunningNotification(item: Vergunning) {
  return {
    id: `vergunning-${item.id}-notification`,
    datePublished: item.dateRequest,
    chapter: Chapters.VERGUNNINGEN,
    title: 'Uw vergunningsaanvraag',
    description: item.title,
    link: {
      to: item.link.to,
      title: 'Bekijk vergunningsaanvraag',
    },
  };
}

export async function fetchVergunningenGenerated(
  sessionID: SessionID,
  samlToken: string
) {
  const vergunningen = await fetchVergunningen(sessionID, samlToken);

  const cases = Array.isArray(vergunningen.content)
    ? vergunningen.content
        .filter(vergunning => vergunning.status !== 'Afgehandeld')
        .map(createVergunningRecentCase)
    : [];

  const notifications = Array.isArray(vergunningen.content)
    ? vergunningen.content
        .filter(vergunning => vergunning.status !== 'Afgehandeld')
        .map(createVergunningNotification)
    : [];

  return {
    cases,
    notifications,
  };
}
