import { differenceInMonths, format } from 'date-fns';
import { AppRoutes, Chapters } from '../../../universal/config';
import { MyCase, StatusLine } from '../../../universal/types';
import { MONTHS_TO_KEEP_AANVRAAG_NOTIFICATIONS } from './config';
import { requestProcess as BijstandsuitkeringProcessLabels } from './content/bijstandsuitkering';
import { requestProcess as StadspasProcessLabels } from './content/stadspas';
import {
  StatusItemRequestProcess,
  WpiRequestProcess,
  WpiRequestProcessLabels,
} from './focus-types';

export function transformToStatusLine<
  T extends WpiRequestProcess,
  L extends WpiRequestProcessLabels
>(requestProcess: T, labels: L): StatusLine {
  const steps = requestProcess.steps.map((statusStep) => {
    const description = labels[statusStep.id].description(
      requestProcess,
      statusStep
    );
    return {
      ...statusStep,
      description,
    };
  });

  return {
    ...requestProcess,
    steps,
  };
}

export function createFocusNotification(
  requestProcess: StatusItemRequestProcess
) {
  const labels =
    requestProcess.title === 'Stadspas'
      ? StadspasProcessLabels
      : BijstandsuitkeringProcessLabels;

  const stepsContent = labels[requestProcess.status].notification;
  const titleTransform = stepsContent.title;
  const descriptionTransform = stepsContent.description;

  return {
    id: `${requestProcess.id}-notification`,
    datePublished: requestProcess.datePublished,
    chapter:
      requestProcess.title === 'Stadspas'
        ? Chapters.STADSPAS
        : Chapters.INKOMEN,
    title: titleTransform
      ? titleTransform(requestProcess, null)
      : `Update: ${requestProcess.title} aanvraag.`,
    description: descriptionTransform
      ? descriptionTransform(requestProcess, null)
      : `U hebt updates over uw ${requestProcess.title}-aanvraag.`,

    // TODO: Implement correct link
    link: {
      to: AppRoutes.INKOMEN,
      title: 'Bekijk hoe het met uw aanvraag staat',
    },
  };
}

export function createFocusRecentCase(item: StatusItemRequestProcess): MyCase {
  return {
    id: `${item.id}-case`,
    title: item.title,
    link: item.link,
    chapter: Chapters.INKOMEN,
    datePublished: item.datePublished,
  };
}

// This applies to Tozo/Tonk items, stadspasaanvraag, bijstandsaanvraag
export function isNotificationActual(datePublished: string, compareDate: Date) {
  const difference = differenceInMonths(compareDate, new Date(datePublished));
  return difference < MONTHS_TO_KEEP_AANVRAAG_NOTIFICATIONS;
}

export function documentDownloadName(item: {
  datePublished: string;
  title: string;
}) {
  return `${format(new Date(item.datePublished), 'yyyy-MM-dd')}-${item.title}`;
}

export function productName(
  requestProcess: { title: string },
  statusStep: Nullable<{ productSpecific?: 'lening' | 'uitkering' }>,
  includeArticle: boolean = true
) {
  const hasProductSpecific = !!statusStep?.productSpecific;
  return `${hasProductSpecific && includeArticle ? 'de ' : ''}${
    requestProcess.title // TODO: This will result in a long title, correct this with an about or productTitle property.
  }${hasProductSpecific ? ` ${statusStep?.productSpecific}` : ''}`;
}
