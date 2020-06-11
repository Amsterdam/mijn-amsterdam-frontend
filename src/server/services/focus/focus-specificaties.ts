import { format } from 'date-fns';
import { ReactNode } from 'react';
import { Chapters } from '../../../universal/config';
import {
  dateFormat,
  dateSort,
  defaultDateFormat,
} from '../../../universal/helpers';
import { MyNotification } from '../../../universal/types';
import { requestData } from '../../helpers';
import { ApiUrls, getApiConfigValue } from '../../config';
import { apiSuccesResult } from '../../../universal/helpers/api';
import {
  FocusInkomenSpecificatie as FocusInkomenSpecificatieFromSource,
  FocusInkomenSpecificatieType,
  fetchFOCUSCombined,
} from './focus-combined';

export const focusInkomenSpecificatieTypes: {
  [type in FocusInkomenSpecificatieType]: string;
} = {
  IOAZ: 'IOAZ',
  BBS: 'Bijzonder bijstand en stimuleringsregelingen',
  WKO: 'Wet kinderopvang',
  IOAW: 'IOAW',
  STIMREG: 'Stimuleringsregelingen',
  BIBI: 'Bijzonder bijstand',
  PART: 'Participatiewet',
  BBZ: 'BBZ',
};

export interface FocusInkomenSpecificatie
  extends FocusInkomenSpecificatieFromSource {
  displayDate: string;
  documentUrl: ReactNode;
  notification?: MyNotification;
}

function documentDownloadName(item: FocusInkomenSpecificatieFromSource) {
  return `${format(new Date(item.datePublished), 'yyyy-MM-dd')}-${item.title}`;
}

function transformIncomeSpecificationNotification(
  type: 'jaaropgave' | 'uitkeringsspecificatie',
  item: FocusInkomenSpecificatieFromSource
): MyNotification {
  if (type === 'jaaropgave') {
    return {
      id: 'nieuwe-jaaropgave',
      datePublished: item.datePublished,
      chapter: Chapters.INKOMEN,
      title: 'Nieuwe jaaropgave',
      description: `Uw jaaropgave ${dateFormat(
        item.datePublished,
        'yyyy'
      )} staat voor u klaar.`,
      link: {
        to: `/api/${item.url}`,
        title: 'Bekijk jaaropgave',
        download: documentDownloadName(item),
      },
    };
  }
  return {
    id: 'nieuwe-uitkeringsspecificatie',
    datePublished: item.datePublished,
    chapter: Chapters.INKOMEN,
    title: 'Nieuwe uitkeringsspecificatie',
    description: `Uw uitkeringsspecificatie van ${dateFormat(
      item.datePublished,
      'MMMM yyyy'
    )} staat voor u klaar.`,
    link: {
      to: `/api/${item.url}`,
      title: 'Bekijk uitkeringsspecificatie',
      download: documentDownloadName(item),
    },
  };
}

function transformIncomSpecificationItem(
  item: FocusInkomenSpecificatieFromSource,
  type: 'jaaropgave' | 'uitkeringsspecificatie'
): FocusInkomenSpecificatie {
  const displayDate = defaultDateFormat(item.datePublished);
  return {
    ...item,
    displayDate,
    documentUrl: `<a
        href=${`/api/${item.url}`}
        rel="external noopener noreferrer"
        download=${documentDownloadName(item)}
      >
        PDF
      </a>`,
  };
}

export interface FOCUSIncomeSpecificationSourceDataContent {
  jaaropgaven: FocusInkomenSpecificatieFromSource[];
  uitkeringsspecificaties: FocusInkomenSpecificatieFromSource[];
}

export interface IncomeSpecifications {
  jaaropgaven: FocusInkomenSpecificatie[];
  uitkeringsspecificaties: FocusInkomenSpecificatie[];
}

export function transformFOCUSIncomeSpecificationsData(
  responseContent: FOCUSIncomeSpecificationSourceDataContent
) {
  const jaaropgaven = (responseContent.jaaropgaven || [])
    .sort(dateSort('datePublished', 'desc'))
    .map(item => transformIncomSpecificationItem(item, 'jaaropgave'));

  const uitkeringsspecificaties = (
    responseContent.uitkeringsspecificaties || []
  )
    .sort(dateSort('datePublished', 'desc'))
    .map(item =>
      transformIncomSpecificationItem(item, 'uitkeringsspecificatie')
    );

  return {
    jaaropgaven,
    uitkeringsspecificaties,
  };
}

export async function fetchFOCUSSpecificaties(sessionID: SessionID) {
  const combinedData = await fetchFOCUSCombined(sessionID);
  if (combinedData.status === 'OK') {
    return apiSuccesResult(
      transformFOCUSIncomeSpecificationsData(combinedData.content)
    );
  }
  return combinedData;
}

export async function fetchFOCUSSpecificationsGenerated(sessionID: SessionID) {
  const response = await fetchFOCUSSpecificaties(sessionID);
  const notifications: MyNotification[] = [];

  if (response.status === 'OK') {
    const { jaaropgaven, uitkeringsspecificaties } = response.content;

    if (jaaropgaven.length) {
      notifications.push(
        transformIncomeSpecificationNotification('jaaropgave', jaaropgaven[0])
      );
    }

    if (uitkeringsspecificaties.length) {
      notifications.push(
        transformIncomeSpecificationNotification(
          'uitkeringsspecificatie',
          uitkeringsspecificaties[0]
        )
      );
    }
  }

  return {
    notifications,
  };
}
