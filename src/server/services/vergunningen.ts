import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../universal/config/routing';
import { LinkProps, MyCase } from '../../universal/types/App.types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { hash, isRecentCase } from '../../universal/helpers/utils';
import { dateSort } from '../../universal/helpers/date';
import { Chapters } from '../../universal/config/index';

export interface VergunningSource {
  status: 'Toewijzen' | 'Afgehandeld' | 'Ontvangen' | string;
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
  decision?: string | null;
  dateDecision?: string | null;
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
    const id = hash(
      `vergunning-${item.identifier || item.caseType + item.dateRequest}`
    );
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
  passthroughRequestHeaders: Record<string, string>
) {
  return requestData<VergunningenData>(
    getApiConfig('VERGUNNINGEN', {
      transformResponse: transformVergunningenData,
    }),
    sessionID,
    passthroughRequestHeaders
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
  const title = 'Vergunningsaanvraag';
  let description = 'Er is een update in uw vergunningsaanvraag.';
  let datePublished = item.dateRequest;

  switch (true) {
    case item.status === 'Afgehandeld' && item.decision === 'Niet verleend':
      description = `Uw vergunningsaanvraag ${item.caseType} is niet verleend`;
      datePublished = item.dateDecision || item.dateRequest;
      break;
    case item.status === 'Afgehandeld' && item.decision === 'Ingetrokken':
      description = `Uw vergunningsaanvraag ${item.caseType} is ingetrokken`;
      datePublished = item.dateDecision || item.dateRequest;
      break;
    case item.status === 'Afgehandeld' && item.decision === 'Verleend':
      description = `Uw vergunningsaanvraag ${item.caseType} is verleend`;
      datePublished = item.dateDecision || item.dateRequest;
      break;
    case item.status !== 'Afgehandeld':
      description = `Uw vergunningsaanvraag ${item.caseType} is geregistreerd`;
      break;
    case item.status === 'Afgehandeld':
      description = `Uw vergunningsaanvraag ${item.caseType} is afgehandeld`;
      break;
  }

  return {
    id: `vergunning-${item.id}-notification`,
    datePublished,
    chapter: Chapters.VERGUNNINGEN,
    title,
    description,
    link: {
      to: item.link.to,
      title: 'Bekijk details',
    },
  };
}

export async function fetchVergunningenGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  compareDate?: Date
) {
  const vergunningen = await fetchVergunningen(
    sessionID,
    passthroughRequestHeaders
  );
  const compareToDate = compareDate || new Date();

  const cases = Array.isArray(vergunningen.content)
    ? vergunningen.content
        .filter(
          vergunning =>
            vergunning.status !== 'Afgehandeld' ||
            (vergunning.dateDecision &&
              isRecentCase(vergunning.dateDecision, compareToDate))
        )
        .map(createVergunningRecentCase)
    : [];

  const notifications = Array.isArray(vergunningen.content)
    ? vergunningen.content.map(createVergunningNotification)
    : [];

  return {
    cases,
    notifications,
  };
}
