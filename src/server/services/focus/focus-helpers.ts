import { differenceInMonths } from 'date-fns';
import { AppRoutes, Chapters } from '../../../universal/config';
import { MyCase } from '../../../universal/types';
import { MONTHS_TO_KEEP_AANVRAAG_NOTIFICATIONS } from './focus-aanvragen';
import {
  BijstandsuitkeringProcessLabels,
  StadspasProcessLabels,
} from './focus-aanvragen-content';
import {
  AanvraagRequestProcess,
  LinkContents,
  StatusItemRequestProcess,
} from './focus-types';

export function transformToStatusItem(
  requestProcess: AanvraagRequestProcess
): StatusItemRequestProcess {
  const labels =
    requestProcess.title === 'Stadspas'
      ? StadspasProcessLabels
      : BijstandsuitkeringProcessLabels;

  const link = Object.assign(
    {
      title: 'Meer informatie',
      to: AppRoutes.INKOMEN,
    },
    labels.link ? labels.link(requestProcess, null) : null
  );

  const steps = requestProcess.steps.map((statusStep) => {
    let description: string;
    // Below switch statement is required for the TS compiler to be able to Infer the type of statusStep correctly.
    switch (statusStep.id) {
      case 'aanvraag':
        description = labels[statusStep.id].description(
          requestProcess,
          statusStep
        );
        break;
      case 'inBehandeling':
        description = labels[statusStep.id].description(
          requestProcess,
          statusStep
        );
        break;
      case 'herstelTermijn':
        description = labels[statusStep.id].description(
          requestProcess,
          statusStep
        );
        break;
      case 'besluit':
        description = labels[statusStep.id].description(
          requestProcess,
          statusStep
        );
        break;
    }
    return {
      ...statusStep,
      description,
    };
  });

  return {
    ...requestProcess,
    steps,
    link,
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
  const linkTransform: LinkContents<any> =
    stepsContent.link || (() => requestProcess?.link);

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
    link: Object.assign(
      {
        to: AppRoutes.INKOMEN,
        title: 'Bekijk hoe het met uw aanvraag staat',
      },
      linkTransform ? linkTransform(requestProcess, null) : {}
    ),
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
