import * as Sentry from '@sentry/node';
import { generatePath } from 'react-router-dom';
import { AppRoutes, Chapters } from '../../../universal/config';
import {
  apiSuccesResult,
  dateFormat,
  dateSort,
  hash,
} from '../../../universal/helpers';
import { MyNotification } from '../../../universal/types/App.types';
import {
  FocusCombinedSourceResponse,
  FocusTozoDocument,
} from './focus-combined';
import { tozoDocumentLabelSet, FocusTozoLabelSet } from './focus-tozo-content';
import { FocusItem, FocusItemStep, FocusStepContent } from './focus-types';

export function getProductTitleForDocument(document: FocusTozoDocument) {
  const labelSet = getLabelSet(document);

  if (!labelSet) {
    return document.description;
  }

  return labelSet.product;
}

function transformKey(documentCodeId: string) {
  return documentCodeId.replace(/\s/g, '').toLowerCase();
}

export function getLabelSet(
  document: FocusTozoDocument
): FocusTozoLabelSet | null {
  const labelSetEntry = Object.entries(tozoDocumentLabelSet).find(
    ([documentCodeId]) => {
      return (
        transformKey(documentCodeId) === transformKey(document.documentCodeId)
      );
    }
  );

  if (!labelSetEntry) {
    return null;
  }

  // We don't need labelSetEntry[0]
  return labelSetEntry[1];
}

function getDocumentTitle(
  labelSet: FocusTozoLabelSet,
  document: FocusTozoDocument
) {
  // Documents of the aanvraag step are formatted differently
  if (labelSet.productSpecific === 'aanvraag') {
    return `${labelSet.documentTitle}\n${dateFormat(
      document.datePublished,
      `dd MMMM 'om' HH:mm`
    )} uur`;
  }
  return labelSet.documentTitle;
}

function getDocumentStepDescription(
  document: FocusTozoDocument,
  stepLabels: FocusStepContent
) {
  return stepLabels.description(document);
}

function getDocumentStepNotificationDescription(
  document: FocusTozoDocument,
  stepLabels: FocusStepContent
) {
  return stepLabels.notification?.description(document);
}

function getDocumentStepNotificationTitle(
  document: FocusTozoDocument,
  stepLabels: FocusStepContent
) {
  return stepLabels.notification?.title(document);
}

export function createTozoItemStep(document: FocusTozoDocument) {
  const labelSet = getLabelSet(document);

  if (!labelSet) {
    Sentry.captureMessage('Unknown Tozo document encountered', {
      extra: {
        document,
      },
    });
    return null;
  }

  const documentTitle = getDocumentTitle(labelSet, document);

  const attachedDocument = {
    id: document.id,
    title: documentTitle,
    url: `/api/${document.url}`,
    datePublished: document.datePublished,
    type: 'PDF',
  };

  const id = hash(
    `${document.productTitle}-${document.id}-${document.datePublished}`
  );

  document.productSpecific = labelSet.productSpecific;

  const step: FocusItemStep = {
    id,
    documents: [attachedDocument],
    product: document.productTitle,
    title: labelSet.stepType,
    description: getDocumentStepDescription(document, labelSet.labels),
    datePublished: document.datePublished,
    status: labelSet.labels.status,
    isChecked: true,
    isActive: true,

    notificationTitle: getDocumentStepNotificationTitle(
      document,
      labelSet.labels
    ),
    notificationDescription: getDocumentStepNotificationDescription(
      document,
      labelSet.labels
    ),
  };

  return step;
}

export function createTozoItem(productTitle: string, steps: FocusItemStep[]) {
  let title = '';

  switch (productTitle) {
    case 'Tozo 1':
      title = 'Tozo 1 (aangevraagd voor 1 juni 2020)';
      break;
    case 'Tozo 2':
      title = 'Tozo 2 (aangevraagd na 1 juni 2020)';
      break;
    case 'Tozo 3':
      title = 'Tozo 3 (aangevraagd na 1 oktober 2020)';
      break;
  }

  const id = hash(`${title}-${steps[0].datePublished}`);

  return {
    id,
    dateStart: steps[0].datePublished,
    datePublished: steps[steps.length - 1].datePublished,
    title,
    status: steps[steps.length - 1].status,
    productTitle,
    type: 'Tozo',
    chapter: Chapters.INKOMEN,
    link: {
      to: generatePath(AppRoutes['INKOMEN/TOZO'], { id }),
      title: `Bekijk hoe het met uw aanvraag staat`,
    },
    steps,
  };
}

export function createTozoItemStepNotifications(
  item: FocusItem
): MyNotification[] {
  return item.steps.map(step => ({
    id: hash(`notification-${step.id}`),
    datePublished: step.datePublished,
    chapter: Chapters.INKOMEN,
    title:
      step.notificationTitle || 'Update aanvraag ' + item.productTitle + '',
    description: step.notificationDescription || '',
    link: {
      to: generatePath(AppRoutes['INKOMEN/TOZO'], { id: item.id }),
      title: 'Bekijk hoe het met uw aanvraag staat',
    },
  }));
}

export function createTozoResult(
  tozodocumenten: FocusCombinedSourceResponse['tozodocumenten']
) {
  const documents: FocusTozoDocument[] = Array.isArray(tozodocumenten)
    ? tozodocumenten
        .map(document => {
          return {
            ...document,
            productTitle: getProductTitleForDocument(document),
          };
        })
        .sort(dateSort('datePublished'))
    : [];

  const tozoSteps: FocusItemStep[] = documents
    .map(document => createTozoItemStep(document))
    .filter(
      (step: FocusItemStep | null): step is FocusItemStep => step !== null
    );

  if (!tozoSteps.length) {
    return apiSuccesResult([]);
  }

  // Aggregate all aanvraag step documents and combine into 1
  let aanvraagSteps: Record<string, FocusItemStep> = {};
  const otherSteps: FocusItemStep[] = [];

  for (const step of tozoSteps) {
    if (step && step.title === 'aanvraag') {
      if (step?.product && !aanvraagSteps[step.product]) {
        // step is not present, cache the step
        aanvraagSteps[step.product] = step;
      } else if (step?.product) {
        // step is present, add documents
        aanvraagSteps[step.product].documents.push(...step.documents);
      }
    } else if (step) {
      otherSteps.push(step);
    }
  }

  const tozo1Steps = otherSteps.filter(step => step.product === 'Tozo 1');
  const tozo2Steps = otherSteps.filter(step => step.product === 'Tozo 2');
  const tozo3Steps = otherSteps.filter(step => step.product === 'Tozo 3');

  if (aanvraagSteps['Tozo 1']) {
    tozo1Steps.unshift(aanvraagSteps['Tozo 1']);
  }
  const tozo1Item = tozo1Steps.length && createTozoItem('Tozo 1', tozo1Steps);

  if (aanvraagSteps['Tozo 2']) {
    tozo2Steps.unshift(aanvraagSteps['Tozo 2']);
  }
  const tozo2Item = tozo2Steps.length && createTozoItem('Tozo 2', tozo2Steps);

  if (aanvraagSteps['Tozo 3']) {
    tozo3Steps.unshift(aanvraagSteps['Tozo 3']);
  }
  const tozo3Item = tozo3Steps.length && createTozoItem('Tozo 3', tozo3Steps);

  const tozoItems: FocusItem[] = [];

  if (tozo1Item) {
    tozoItems.push(tozo1Item);
  }

  if (tozo2Item) {
    tozoItems.push(tozo2Item);
  }

  if (tozo3Item) {
    tozoItems.push(tozo3Item);
  }

  return apiSuccesResult(tozoItems);
}
