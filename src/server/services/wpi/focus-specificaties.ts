import { differenceInMonths } from 'date-fns';
import { Chapters, IS_PRODUCTION } from '../../../universal/config';
import { API_BASE_PATH } from '../../../universal/config/api';
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
} from './focus-combined';

const DEFAULT_SPECIFICATION_CATEGORY = 'Uitkering';
const MONTHS_TO_KEEP_UITKERING_NOTIFICATION = 1;
const MONTHS_TO_KEEP_JAAROPGAVE_NOTIFICATION = 3;

export interface FocusInkomenSpecificatie
  extends FocusInkomenSpecificatieFromSource {
  displayDatePublished: string;
}

function isNotificationActual(
  type: 'uitkering' | 'jaaropgave',
  datePublished: string,
  compareDate: Date
) {
  const difference = differenceInMonths(compareDate, new Date(datePublished));
  if (type === 'uitkering') {
    return difference < MONTHS_TO_KEEP_UITKERING_NOTIFICATION;
  }
  return difference < MONTHS_TO_KEEP_JAAROPGAVE_NOTIFICATION;
}

function transformIncomeSpecificationNotification(
  type: 'jaaropgave' | 'uitkering',
  item: FocusInkomenSpecificatieFromSource
): MyNotification {
  if (type === 'jaaropgave') {
    return {
      id: 'nieuwe-jaaropgave',
      datePublished: item.datePublished,
      chapter: Chapters.INKOMEN,
      title: 'Nieuwe jaaropgave',
      description: `Uw jaaropgave ${
        parseInt(dateFormat(item.datePublished, 'yyyy'), 10) - 1
      } staat voor u klaar.`,
      link: {
        to: item.url,
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
      to: item.url,
      title: 'Bekijk uitkeringsspecificatie',
      download: documentDownloadName(item),
    },
  };
}

function transformIncomSpecificationItem(
  item: FocusInkomenSpecificatieFromSource
): FocusInkomenSpecificatie {
  const displayDatePublished = defaultDateFormat(item.datePublished);
  const url = `${API_BASE_PATH}/${item.url}`;
  const categoryFromSource = item.type;
  return {
    ...item,
    category: categoryFromSource || DEFAULT_SPECIFICATION_CATEGORY,
    type: 'pdf',
    url,
    download: documentDownloadName(item),
    displayDatePublished,
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
    .map((item) => transformIncomSpecificationItem(item));

  const uitkeringsspecificaties = (
    responseContent.uitkeringsspecificaties || []
  )
    .sort(dateSort('datePublished', 'desc'))
    .map((item) => transformIncomSpecificationItem(item));

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
  const WPI_SPECIFICATIES = await fetchFOCUSSpecificaties(
    sessionID,
    passthroughRequestHeaders
  );
  const notifications: MyNotification[] = [];

  if (WPI_SPECIFICATIES.status === 'OK') {
    const { jaaropgaven, uitkeringsspecificaties } = WPI_SPECIFICATIES.content;

    const isActualJaaropgave =
      !IS_PRODUCTION ||
      isNotificationActual(
        'jaaropgave',
        jaaropgaven[0].datePublished,
        new Date()
      );

    if (jaaropgaven.length && isActualJaaropgave) {
      // Only the latest Jaaropgave gets a notification.
      notifications.push(
        transformIncomeSpecificationNotification('jaaropgave', jaaropgaven[0])
      );
    }

    const isActualUitkering =
      !IS_PRODUCTION ||
      isNotificationActual(
        'uitkering',
        uitkeringsspecificaties[0].datePublished,
        new Date()
      );

    if (uitkeringsspecificaties.length && isActualUitkering) {
      // Only the latest Uitkeringspecificatie gets a notification.
      notifications.push(
        transformIncomeSpecificationNotification(
          'uitkering',
          uitkeringsspecificaties[0]
        )
      );
    }

    return apiSuccesResult({
      notifications,
    });
  }

  return apiDependencyError({
    WPI_SPECIFICATIES,
  });
}
