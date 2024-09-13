import { differenceInMonths, format } from 'date-fns';
import { LinkProps, generatePath } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config/routes';
import { Thema } from '../../../universal/config/thema';
import { GenericDocument, MyNotification } from '../../../universal/types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { encrypt } from '../../helpers/encrypt-decrypt';
import { BffEndpoints } from '../../routing/bff-routes';
import { MONTHS_TO_KEEP_AANVRAAG_NOTIFICATIONS } from './config';
import { requestProcess as bbzRequestProcessLabels } from './content/bbz';
import { requestProcess as tonkRequestProcessLabels } from './content/tonk';
import { requestProcess as tozoRequestProcessLabels } from './content/tozo';
import {
  WpiRequestProcess,
  WpiRequestProcessLabels,
  WpiRequestStatus,
} from './wpi-types';

export function transformToStatusLine(
  sessionID: AuthProfileAndToken['profile']['sid'],
  requestProcess: WpiRequestProcess,
  labels: WpiRequestProcessLabels
): WpiRequestProcess {
  const steps = requestProcess.steps.map((statusStep) => {
    const description = labels[statusStep.id].description(
      requestProcess,
      statusStep
    );

    return {
      ...statusStep,
      documents: addApiBasePathToDocumentUrls(sessionID, statusStep.documents),
      isActive: false,
      isChecked: true,
      description,
    };
  });

  const activeStep = steps[steps.length - 1];
  activeStep.isActive = true;

  return {
    ...requestProcess,
    steps,
  };
}

export function addApiBasePathToDocumentUrls(
  sessionID: AuthProfileAndToken['profile']['sid'],
  documents: GenericDocument[]
): GenericDocument[] {
  return documents.map((document) => {
    const sourceUrl = new URL(
      document.url.startsWith('http')
        ? document.url
        : `http://example.com${document.url}` // Create FAKE url so URL can parse correctly.
    );
    const [idEncrypted] = encrypt(
      `${sessionID}:${sourceUrl.searchParams.get('id') ?? ''}`
    );
    const url = new URL(
      generateFullApiUrlBFF(BffEndpoints.WPI_DOCUMENT_DOWNLOAD, {
        id: idEncrypted,
      })
    );

    for (const key of ['isBulk', 'isDms']) {
      url.searchParams.append(key, sourceUrl.searchParams.get(key) ?? 'False');
    }

    return {
      ...document,
      url: url.toString(),
    };
  });
}

export function createProcessNotification(
  requestProcess: WpiRequestProcess,
  statusStep: WpiRequestStatus,
  labels: WpiRequestProcessLabels,
  thema: Thema
): MyNotification {
  const notificationLabels = labels[statusStep.id].notification;
  const titleTransform = notificationLabels.title;
  const descriptionTransform = notificationLabels.description;
  const linkTransform = notificationLabels.link;

  return {
    id: `${requestProcess.id}-notification`,
    datePublished: statusStep.datePublished,
    thema,
    title: titleTransform
      ? titleTransform(requestProcess, statusStep)
      : `Update: ${requestProcess.about} aanvraag.`,
    description: descriptionTransform
      ? descriptionTransform(requestProcess, statusStep)
      : `U heeft updates over uw ${
          statusStep.about || requestProcess.about
        }-aanvraag.`,

    link: linkTransform
      ? linkTransform(requestProcess, statusStep)
      : {
          to: requestProcess.link?.to || '/',
          title: 'Bekijk hoe het met uw aanvraag staat',
        },
  };
}

// This applies to Tozo/Tonk items and bijstandsaanvraag
export function isRequestProcessActual(
  datePublished: string,
  compareDate: Date
) {
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
  requestProcess: { about: string },
  statusStep: Nullable<{
    productSpecific?: 'lening' | 'uitkering';
    about?: string;
  }>,
  includeArticle: boolean = true
) {
  const hasProductSpecific = !!statusStep?.productSpecific;
  return `${hasProductSpecific && includeArticle ? 'de ' : ''}${
    statusStep?.about || requestProcess.about
  }${hasProductSpecific ? ` ${statusStep?.productSpecific}` : ''}`;
}

export function addLink(requestProcess: WpiRequestProcess) {
  let title = 'Bekijk uw aanvraag';

  const id = requestProcess.id;
  let link: LinkProps | undefined = undefined;

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

  if (link) {
    return Object.assign(requestProcess, {
      link,
    });
  }

  return requestProcess;
}

export function getEAanvraagRequestProcessLabels(
  requestProcess: WpiRequestProcess
): WpiRequestProcessLabels | undefined {
  let labels: WpiRequestProcessLabels | undefined = undefined;
  switch (requestProcess.about) {
    case 'Tozo 1':
    case 'Tozo 2':
    case 'Tozo 3':
    case 'Tozo 4':
    case 'Tozo 5':
      labels = tozoRequestProcessLabels;
      break;
    case 'Bbz':
      labels = bbzRequestProcessLabels;
      break;
    case 'TONK':
      labels = tonkRequestProcessLabels;
      break;
  }
  return labels;
}
