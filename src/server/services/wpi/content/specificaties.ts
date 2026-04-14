import { differenceInMonths } from 'date-fns';

import { themaConfig } from '../../../../client/pages/Thema/Inkomen/Inkomen-thema-config.ts';
import {
  dateFormat,
  defaultDateFormat,
} from '../../../../universal/helpers/date.ts';
import type { MyNotification } from '../../../../universal/types/App.types.ts';
import {
  addApiBasePathToDocumentUrls,
  documentDownloadName,
} from '../helpers.ts';
import type {
  WpiIncomeSpecification,
  WpiIncomeSpecificationResponseDataTransformed,
  WpiIncomeSpecificationTransformed,
} from '../wpi-types.ts';

const MONTHS_TO_KEEP_UITKERING_NOTIFICATION = 1;
const MONTHS_TO_KEEP_JAAROPGAVE_NOTIFICATION = 3;

const DEFAULT_SPECIFICATION_CATEGORY = 'Uitkering';

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
  item: WpiIncomeSpecification
): MyNotification {
  if (type === 'jaaropgave') {
    return {
      id: 'nieuwe-jaaropgave',
      datePublished: item.datePublished,
      themaID: themaConfig.id,
      themaTitle: themaConfig.title,
      title: 'Nieuwe jaaropgave',
      description: `Uw ${item.title} staat voor u klaar.`,
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
    themaID: themaConfig.id,
    themaTitle: themaConfig.title,
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

export function getNotifications(
  specificatiesContent: WpiIncomeSpecificationResponseDataTransformed
) {
  const notifications: MyNotification[] = [];

  if (
    !specificatiesContent?.jaaropgaven?.length &&
    !specificatiesContent?.uitkeringsspecificaties?.length
  ) {
    return notifications;
  }

  const { jaaropgaven, uitkeringsspecificaties } = specificatiesContent;

  const isActualJaaropgave = jaaropgaven[0]
    ? isNotificationActual(
        'jaaropgave',
        jaaropgaven[0].datePublished,
        new Date()
      )
    : false;

  if (jaaropgaven.length && isActualJaaropgave) {
    // Only the latest Jaaropgave gets a notification.
    notifications.push(
      transformIncomeSpecificationNotification('jaaropgave', jaaropgaven[0])
    );
  }

  const isActualUitkering = uitkeringsspecificaties[0]
    ? isNotificationActual(
        'uitkering',
        uitkeringsspecificaties[0].datePublished,
        new Date()
      )
    : false;

  if (uitkeringsspecificaties.length && isActualUitkering) {
    // Only the latest Uitkeringspecificatie gets a notification.
    notifications.push(
      transformIncomeSpecificationNotification(
        'uitkering',
        uitkeringsspecificaties[0]
      )
    );
  }

  return notifications;
}

export function transformIncomeSpecificationItem(
  sessionID: SessionID,
  item: WpiIncomeSpecification
): WpiIncomeSpecificationTransformed {
  const datePublishedFormatted = defaultDateFormat(item.datePublished);
  const [{ url }] = addApiBasePathToDocumentUrls(sessionID, [item]);
  const categoryFromSource = item.variant;

  return {
    ...item,
    category: categoryFromSource || DEFAULT_SPECIFICATION_CATEGORY,
    url,
    download: documentDownloadName(item),
    datePublishedFormatted,
  };
}
