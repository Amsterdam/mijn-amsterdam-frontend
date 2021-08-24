import { generatePath } from 'react-router-dom';

import {
  API_BASE_PATH,
  Chapters,
  IS_PRODUCTION,
} from '../../../universal/config';
import { defaultDateTimeFormat, hash } from '../../../universal/helpers';
import { LinkProps, MyNotification } from '../../../universal/types/App.types';
import { stepLabels } from './focus-aanvragen-content';
import { isNotificationActual } from './focus-aanvragen-helpers';
import { FocusDocument } from './focus-combined';
import {
  FocusItem,
  FocusItemStep,
  FocusStepContent,
  ToxxLabelSet,
  ToxxLabelSetCollection,
} from './focus-types';

export function getProductTitleForDocument(
  document: FocusDocument,
  labelSetCollection: ToxxLabelSetCollection
) {
  const labelSetForProduct = getLabelSet(document, labelSetCollection);

  if (!labelSetForProduct) {
    return document.description;
  }

  return labelSetForProduct.product;
}

export function sanitizeDocumentCodeId(documentCodeId: string) {
  return documentCodeId.replace(/\s/g, '').toLowerCase();
}

export function getLabelSet(
  document: FocusDocument,
  labelSetCollection: ToxxLabelSetCollection
): ToxxLabelSet | null {
  const entry = Object.entries(labelSetCollection).find(([documentCodeId]) => {
    return (
      sanitizeDocumentCodeId(documentCodeId) ===
      sanitizeDocumentCodeId(document.documentCodeId)
    );
  });

  if (entry) {
    return entry[1];
  }

  return null;
}

function getDocumentTitle(labelSet: ToxxLabelSet, document: FocusDocument) {
  // Documents of the aanvraag step are formatted differently
  if (labelSet.stepType === 'aanvraag') {
    return `${labelSet.documentTitle}\n${defaultDateTimeFormat(
      document.datePublished
    )}`;
  }
  return labelSet.documentTitle;
}

function getDocumentStepDescription(
  document: FocusDocument,
  stepLabels: FocusStepContent
) {
  return stepLabels.description(document);
}

function getDocumentStepNotificationDescription(
  document: FocusDocument,
  stepLabels: FocusStepContent
) {
  return stepLabels.notification?.description(document);
}

function getDocumentStepNotificationTitle(
  document: FocusDocument,
  stepLabels: FocusStepContent
) {
  return stepLabels.notification?.title(document);
}

function getDocumentStepNotificationLink(
  document: FocusDocument,
  stepLabels: FocusStepContent
): LinkProps | undefined {
  return stepLabels.notification?.link?.(document);
}

export function createToxxItemStep(
  document: FocusDocument,
  labelSetCollection: ToxxLabelSetCollection
) {
  const labelSet = getLabelSet(document, labelSetCollection);

  if (!labelSet) {
    return null;
  }

  const documentTitle = getDocumentTitle(labelSet, document);

  const attachedDocument = {
    id: document.id,
    title: documentTitle,
    url: `${API_BASE_PATH}/${document.url}`,
    datePublished: document.datePublished,
    type: 'pdf',
  };

  const id = hash(
    `${document.productTitle}-${document.id}-${document.datePublished}`
  );

  document.productSpecific = labelSet.productSpecific;

  const datePublished = labelSet.datePublished || document.datePublished;

  const step: FocusItemStep = {
    id,
    documents: [attachedDocument],
    product: document.productTitle,
    title: labelSet.stepType,
    description: getDocumentStepDescription(document, labelSet.labels),
    datePublished,
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
    notificationLink: getDocumentStepNotificationLink(
      document,
      labelSet.labels
    ),
  };
  if (labelSet.stepType === 'besluit' && labelSet.decision) {
    step.decision = labelSet.decision;
  }

  return step;
}

interface CreateToxxItemProps {
  title: string;
  productTitle: string;
  steps: FocusItemStep[];
  routeProps: {
    path: string;
    params: Record<string, string>;
  };
}

export function createToxxItem({
  title,
  productTitle,
  steps,
  routeProps,
}: CreateToxxItemProps): FocusItem {
  const id = hash(`${title}-${steps[0].datePublished}`);
  const lastStep = steps[steps.length - 1];
  const datePublished = lastStep.datePublished;
  const decisionStep = steps.filter((step) => step.title === 'besluit').pop();
  const dateEnd = decisionStep ? decisionStep.datePublished : null;
  return {
    id,
    dateStart: steps[0].datePublished,
    datePublished, // Use the date from latest step
    title,
    decision: decisionStep?.decision,
    status: !!decisionStep ? stepLabels.besluit : lastStep.status,
    productTitle,
    dateEnd,
    type: 'Tozo',
    link: {
      to: generatePath(routeProps.path, { ...routeProps.params, id }),
      title: `Bekijk hoe het met uw aanvraag staat`,
    },
    steps,
  };
}

export function createToxxItemStepNotifications(
  item: FocusItem,
  compareDate: Date
): MyNotification[] {
  return item.steps
    .filter(
      (step) =>
        !IS_PRODUCTION || isNotificationActual(step.datePublished, compareDate)
    )
    .map((step) => ({
      id: hash(`notification-${step.id}`),
      datePublished: step.datePublished,
      chapter: Chapters.INKOMEN,
      title:
        step.notificationTitle || 'Update aanvraag ' + item.productTitle + '',
      description: step.notificationDescription || '',
      link: step.notificationLink || {
        to: item.link.to,
        title: 'Bekijk hoe het met uw aanvraag staat',
      },
    }));
}
