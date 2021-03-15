import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../universal/config/routes';
import {
  LinkProps,
  MyCase,
  MyNotification,
} from '../../universal/types/App.types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { hash, isRecentCase } from '../../universal/helpers/utils';
import { dateSort } from '../../universal/helpers/date';
import { Chapters } from '../../universal/config/index';
import { apiDependencyError } from '../../universal/helpers';
import { apiSuccesResult } from '../../universal/helpers/api';
import { GenericDocument } from '../../universal/types/App.types';
import { differenceInMonths } from 'date-fns';

const MONTHS_TO_KEEP_NOTIFICATIONS = 6;

export interface VergunningSource {
  status: 'Toewijzen' | 'Afgehandeld' | 'Ontvangen' | string;
  title: string;
  identifier: string;
  caseType: string;
  dateRequest: string;
  dateFrom: string | null;
  dateEnd: string | null; // datum t/m
  timeStart: string | null;
  timeEnd: string | null;
  isActual: boolean;
  kenteken: string | null;
  location: string | null;
  decision: string | null;
  dateDecision?: string | null;
  documentsUrl: string | null;
}

export type VergunningenSourceData = {
  content?: VergunningSource[];
  status: 'OK' | 'ERROR';
};

export interface Vergunning extends VergunningSource {
  id: string;
  link: LinkProps;
}

export interface VergunningDocument extends GenericDocument {
  sequence: number;
}

export type VergunningenData = Vergunning[];

export function transformVergunningenData(
  responseData: VergunningenSourceData
): VergunningenData {
  if (!Array.isArray(responseData?.content)) {
    return [];
  }

  const vergunningen: Vergunning[] = responseData?.content?.map((item) => {
    const id = hash(
      `vergunning-${item.identifier || item.caseType + item.dateRequest}`
    );
    const vergunning = Object.assign({}, item, {
      id,
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

function isActualNotification(datePublished: string, compareDate: Date) {
  return (
    differenceInMonths(compareDate, new Date(datePublished)) <
    MONTHS_TO_KEEP_NOTIFICATIONS
  );
}

export async function fetchVergunningenGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  compareDate?: Date
) {
  const VERGUNNINGEN = await fetchVergunningen(
    sessionID,
    passthroughRequestHeaders
  );

  if (VERGUNNINGEN.status === 'OK') {
    const compareToDate = compareDate || new Date();

    const cases: MyCase[] = Array.isArray(VERGUNNINGEN.content)
      ? VERGUNNINGEN.content
          .filter(
            (vergunning) =>
              vergunning.status !== 'Afgehandeld' ||
              (vergunning.dateDecision &&
                isRecentCase(vergunning.dateDecision, compareToDate))
          )
          .map(createVergunningRecentCase)
      : [];

    const notifications: MyNotification[] = Array.isArray(VERGUNNINGEN.content)
      ? VERGUNNINGEN.content
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

  return apiDependencyError({ VERGUNNINGEN });
}
