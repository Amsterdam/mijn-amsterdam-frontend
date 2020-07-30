import { generatePath } from 'react-router-dom';
import { AppRoutes, Chapters } from '../../../universal/config';
import {
  apiSuccesResult,
  dateFormat,
  hash,
  dateSort,
} from '../../../universal/helpers';
import { MyNotification } from '../../../universal/types/App.types';
import {
  FocusCombinedSourceResponse,
  FocusTozoDocument,
} from './focus-combined';
import {
  documentStatusTranslation,
  FocusTozoLabelTranslations,
  FocusTozoStepType,
} from './focus-tozo-content';
import { FocusItem, FocusItemStep, FocusStepContent } from './focus-types';

export function getProductTitleForDocument(document: FocusTozoDocument) {
  const documentStepLabelSet = getStepLabels(document);

  if (!documentStepLabelSet) {
    return document.description;
  }

  const [, labelSet] = documentStepLabelSet;

  return labelSet.product;
}

export function getStepLabels(
  document: FocusTozoDocument
): [FocusTozoStepType, FocusTozoLabelTranslations] | null {
  const labelSetEntries = Object.entries(documentStatusTranslation);

  const labelSetEntry = labelSetEntries.find(([stepType, labelSet]) => {
    return document.description in labelSet || document.type in labelSet;
  });

  if (!labelSetEntry) {
    return null;
  }

  const [stepType, labelSet] = labelSetEntry;
  const stepLabels = labelSet[document.description] || labelSet[document.type];

  return [stepType as FocusTozoStepType, stepLabels];
}

export function getStepLabelsByS(
  document: FocusTozoDocument
): [FocusTozoStepType, FocusTozoLabelTranslations] | null {
  const labelSetEntries = Object.entries(documentStatusTranslation);

  const labelSetEntry = labelSetEntries.find(([stepType, labelSet]) => {
    return document.description in labelSet || document.type in labelSet;
  });

  if (!labelSetEntry) {
    return null;
  }

  const [stepType, labelSet] = labelSetEntry;
  const stepLabels = labelSet[document.description] || labelSet[document.type];

  return [stepType as FocusTozoStepType, stepLabels];
}

function getDocumentTitleTranslation(
  stepType: FocusTozoStepType,
  labelSet: FocusTozoLabelTranslations,
  document: FocusTozoDocument
) {
  if (stepType === 'aanvraag') {
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

export function createTozoDocumentStep(document: FocusTozoDocument) {
  const documentStepLabelSet = getStepLabels(document);

  if (!documentStepLabelSet) {
    return null;
  }

  const [stepType, labelSet] = documentStepLabelSet;

  const documentTitle = getDocumentTitleTranslation(
    stepType,
    labelSet,
    document
  );

  const attachedDocument = {
    id: document.id,
    title: documentTitle,
    url: `/api/${document.url}`,
    datePublished: document.datePublished,
    type: 'PDF',
  };

  const id = hash(
    `${document.productTitle}-${stepType}-${document.id}-${document.datePublished}`
  );

  document.productSpecific = labelSet.productSpecific;

  const step: FocusItemStep = {
    id,
    documents: [attachedDocument],
    product: document.productTitle,
    title: stepType,
    description: getDocumentStepDescription(document, labelSet.step),
    datePublished: document.datePublished,
    status: labelSet.step.status,
    isChecked: true,
    isActive: true,

    notificationTitle: getDocumentStepNotificationTitle(
      document,
      labelSet.step
    ),
    notificationDescription: getDocumentStepNotificationDescription(
      document,
      labelSet.step
    ),
  };

  return step;
}

export function createTozoItem(productTitle: string, steps: FocusItemStep[]) {
  const title =
    productTitle === 'Tozo 2'
      ? 'Tozo 2 (aangevraagd na 1 juni 2020)'
      : 'Tozo 1 (aangevraagd voor 1 juni 2020)';

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

export function createTozoDocumentStepNotifications(
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
    .map(document => createTozoDocumentStep(document))
    .filter(
      (step: FocusItemStep | null): step is FocusItemStep => step !== null
    );

  if (!tozoSteps.length) {
    return apiSuccesResult([]);
  }

  // Aggregate all aanvraag steps and combine into 1
  let aanvraagSteps: Record<string, FocusItemStep> = {};

  for (const step of tozoSteps) {
    if (step && step.title === 'aanvraag') {
      if (step?.product && !aanvraagSteps[step?.product]) {
        aanvraagSteps[step?.product] = step;
      } else if (step?.product) {
        aanvraagSteps[step?.product].documents.push(...step.documents);
      }
    }
  }

  const tozo1Steps = tozoSteps.filter(
    step => step.product === 'Tozo 1' && step.title !== 'aanvraag'
  );
  const tozo2Steps = tozoSteps.filter(
    step => step.product === 'Tozo 2' && step.title !== 'aanvraag'
  );

  const tozo1Item =
    tozo1Steps.length &&
    createTozoItem('Tozo 1', [aanvraagSteps['Tozo 1'], ...tozo1Steps]);
  const tozo2Item =
    tozo2Steps.length &&
    createTozoItem('Tozo 2', [aanvraagSteps['Tozo 2'], ...tozo2Steps]);
  const tozoItems: FocusItem[] = [];

  if (tozo1Item) {
    tozoItems.push(tozo1Item);
  }

  if (tozo2Item) {
    tozoItems.push(tozo2Item);
  }

  return apiSuccesResult(tozoItems);
}
