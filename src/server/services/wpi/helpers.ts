import { differenceInMonths, format } from 'date-fns';
import { generatePath, LinkProps } from 'react-router-dom';
import { AppRoutes, Chapters } from '../../../universal/config';
import { MyCase } from '../../../universal/types';
import { MONTHS_TO_KEEP_AANVRAAG_NOTIFICATIONS } from './config';
import { requestProcess as BijstandsuitkeringProcessLabels } from './content/bijstandsuitkering';
import { requestProcess as StadspasProcessLabels } from './content/stadspas';
import { WpiRequestProcess, WpiRequestProcessLabels } from './wpi-types';

export function transformToStatusLine(
  requestProcess: WpiRequestProcess,
  labels: WpiRequestProcessLabels
) {
  const steps = requestProcess.steps.map((statusStep) => {
    const description = labels[statusStep.id].description(
      requestProcess,
      statusStep
    );
    const isActive = requestProcess.status === statusStep.id;
    const isChecked = true;
    return {
      ...statusStep,
      isActive,
      isChecked,
      description,
    };
  });

  const activeStep = steps.find((step) => step.id === requestProcess.status);

  return {
    ...requestProcess,
    status: activeStep?.status || requestProcess.status,
    steps,
  };
}

export function createFocusNotification(requestProcess: WpiRequestProcess) {
  const labels =
    requestProcess.title === 'Stadspas'
      ? StadspasProcessLabels
      : BijstandsuitkeringProcessLabels;

  const requestStatus = requestProcess.steps.find(
    (requestStatus) => requestStatus.id === requestProcess.status
  )!; // Should always exist.

  const notificationLabels = labels[requestProcess.status].notification;
  const titleTransform = notificationLabels.title;
  const descriptionTransform = notificationLabels.description;

  return {
    id: `${requestProcess.id}-notification`,
    datePublished: requestProcess.datePublished,
    chapter:
      requestProcess.title === 'Stadspas'
        ? Chapters.STADSPAS
        : Chapters.INKOMEN,
    title: titleTransform
      ? titleTransform(requestProcess, requestStatus)
      : `Update: ${requestProcess.title} aanvraag.`,
    description: descriptionTransform
      ? descriptionTransform(requestProcess, requestStatus)
      : `U hebt updates over uw ${requestProcess.title}-aanvraag.`,

    link: {
      to: AppRoutes.INKOMEN,
      title: 'Bekijk hoe het met uw aanvraag staat',
    },
  };
}

export function createFocusRecentCase(item: WpiRequestProcess): MyCase {
  return {
    id: `${item.id}-case`,
    title: item.title,
    link: { to: '', title: '' }, // TODO: Fix link
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
    requestProcess.title // TODO: This will result in a long title, correct this with an about or about property.
  }${hasProductSpecific ? ` ${statusStep?.productSpecific}` : ''}`;
}

export function addLink(requestProcess: WpiRequestProcess) {
  let title = 'Bekijk uw aanvraag';

  const id = requestProcess.id;
  let link: LinkProps;

  switch (requestProcess.about) {
    case 'TONK':
      link = {
        to: generatePath(AppRoutes['INKOMEN/TONK'], {
          id,
          version: 1,
        }),
        title,
      };
      break;
    case 'Tozo 1':
    case 'Tozo 2':
    case 'Tozo 3':
    case 'Tozo 4':
    case 'Tozo 5':
      link = {
        to: generatePath(AppRoutes['INKOMEN/TOZO'], {
          id,
          version: requestProcess.about.replace('Tozo ', ''),
        }),
        title,
      };
      break;
    case 'Bijstandsuitkering':
      link = {
        to: generatePath(AppRoutes['INKOMEN/BIJSTANDSUITKERING'], {
          id,
        }),
        title,
      };
      break;
    case 'Stadspas':
      link = {
        to: generatePath(AppRoutes['STADSPAS/AANVRAAG'], {
          id,
        }),
        title,
      };
      break;
    case 'Bbz':
      link = {
        to: generatePath(AppRoutes['INKOMEN/BBZ'], {
          id,
          version: 1,
        }),
        title,
      };
      break;
  }

  return Object.assign(requestProcess, {
    link,
  });
}
