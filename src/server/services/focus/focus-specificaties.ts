import { format } from 'date-fns';
import { ReactNode } from 'react';
import { Chapters } from '../../../universal/config';
import { API_BASE_PATH } from '../../../universal/config/api';
import { FeatureToggle } from '../../../universal/config/app';
import {
  dateFormat,
  dateSort,
  defaultDateFormat,
} from '../../../universal/helpers';
import {
  apiDependencyError,
  apiSuccesResult,
} from '../../../universal/helpers/api';
import { MyNotification } from '../../../universal/types';
import {
  fetchFOCUSCombined,
  FocusInkomenSpecificatie as FocusInkomenSpecificatieFromSource,
  FocusInkomenSpecificatieType,
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
  displayDatePublished: string;
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
      description: `Uw jaaropgave ${parseInt(
        dateFormat(item.datePublished, 'yyyy'),
        10
      ) - 1} staat voor u klaar.`,
      link: {
        to: `${API_BASE_PATH}/${item.url}`,
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
      to: `${API_BASE_PATH}/${item.url}`,
      title: 'Bekijk uitkeringsspecificatie',
      download: documentDownloadName(item),
    },
  };
}

function transformIncomSpecificationItem(
  item: FocusInkomenSpecificatieFromSource,
  type: 'jaaropgave' | 'uitkeringsspecificatie'
): FocusInkomenSpecificatie {
  const displayDatePublished = defaultDateFormat(item.datePublished);
  return {
    ...item,
    displayDatePublished,
    documentUrl: `<a
        href=${`${API_BASE_PATH}/${item.url}`}
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

export async function fetchFOCUSSpecificaties(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const combinedData = await fetchFOCUSCombined(
    sessionID,
    passthroughRequestHeaders
  );

  if (combinedData.status === 'OK') {
    return apiSuccesResult(
      transformFOCUSIncomeSpecificationsData(combinedData.content)
    );
  }
  return combinedData;
}

export async function fetchFOCUSSpecificationsGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  if (!FeatureToggle.focusUitkeringsspecificatieNotificationsActive) {
    return apiSuccesResult({ notifications: [] });
  }

  const FOCUS_SPECIFICATIES = await fetchFOCUSSpecificaties(
    sessionID,
    passthroughRequestHeaders
  );
  const notifications: MyNotification[] = [];

  if (FOCUS_SPECIFICATIES.status === 'OK') {
    const {
      jaaropgaven,
      uitkeringsspecificaties,
    } = FOCUS_SPECIFICATIES.content;

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

    return apiSuccesResult({
      notifications,
    });
  }

  return apiDependencyError({
    FOCUS_SPECIFICATIES,
  });
}
