import { differenceInMonths } from 'date-fns';

import { themaId } from '../../../../client/pages/Inkomen/Inkomen-thema-config';
import { IS_PRODUCTION } from '../../../../universal/config/env';
import {
  dateFormat,
  defaultDateFormat,
} from '../../../../universal/helpers/date';
import { MyNotification } from '../../../../universal/types';
import { ServiceResults } from '../../content-tips/tip-types';
import { addApiBasePathToDocumentUrls, documentDownloadName } from '../helpers';
import type {
  WpiIncomeSpecification,
  WpiIncomeSpecificationTransformed,
} from '../wpi-types';

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
      themaID: themaId,
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
    themaID: themaId,
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
  specificatiesContent: ServiceResults['WPI_SPECIFICATIES']['content']
) {
  const notifications: MyNotification[] = [];

  if (!specificatiesContent) {
    return notifications;
  }

  const { jaaropgaven, uitkeringsspecificaties } = specificatiesContent;

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
