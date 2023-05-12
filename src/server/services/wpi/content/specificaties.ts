import { differenceInMonths } from 'date-fns';
import { Chapters, IS_PRODUCTION } from '../../../../universal/config';
import { dateFormat, defaultDateFormat } from '../../../../universal/helpers';
import { MyNotification } from '../../../../universal/types';
import { ServiceResults } from '../../tips/tip-types';
import { documentDownloadName } from '../helpers';
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
      chapter: Chapters.INKOMEN,
      title: 'Nieuwe jaaropgave',
      description: `Uw ${item.title} staat voor u klaar.`,
      link: {
        to: `${process.env.BFF_OIDC_BASE_URL || ''}/api/v1/relay${item.url}`,
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
      to: `${process.env.BFF_OIDC_BASE_URL || ''}/api/v1/relay${item.url}`,
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
  item: WpiIncomeSpecification
): WpiIncomeSpecificationTransformed {
  const displayDatePublished = defaultDateFormat(item.datePublished);
  const url = `${item.url}`;
  const categoryFromSource = item.variant;

  return {
    ...item,
    category: categoryFromSource || DEFAULT_SPECIFICATION_CATEGORY,
    url,
    download: documentDownloadName(item),
    displayDatePublished,
  };
}
