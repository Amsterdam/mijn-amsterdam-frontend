import * as Sentry from '@sentry/node';
import { addDays, differenceInMonths, parseISO } from 'date-fns';
import { API_BASE_PATH, AppRoutes, Chapters } from '../../../universal/config';
import {
  dateSort,
  defaultDateFormat,
  hash,
  isRecentCase,
  omit,
} from '../../../universal/helpers';
import { GenericDocument, MyCase } from '../../../universal/types';
import { MONTHS_TO_KEEP_AANVRAAG_NOTIFICATIONS } from './focus-aanvragen';
import { processSteps } from './focus-aanvragen-content';
import {
  Decision,
  DecisionFormatted,
  DocumentTitles,
  FocusDocumentFromSource,
  FocusItem,
  FocusItemStep,
  FocusProduct,
  FocusProductFromSource,
  FocusProductStep,
  FocusProductStepFromSource,
  FocusStepContent,
  FocusStepContentDecision,
  LabelData,
  ProductStepLabels,
  ProductType,
  StepTitle,
  TextPartContents,
} from './focus-types';

/** Checks if an item returned from the api is considered recent */
export function isRecentItem(
  steps: Array<{ title: string; datePublished: string }>,
  compareDate: Date
) {
  return (
    steps.some(
      (step) =>
        step.title === 'besluit' &&
        isRecentCase(step.datePublished, compareDate)
    ) || steps.every((step) => step.title !== 'besluit')
  );
}

export function parseLabelContent(
  text: TextPartContents,
  product: FocusProduct & Record<string, string>
): string {
  let rText = text || '';

  if (typeof rText === 'function') {
    return rText(product);
  }

  return rText;
}

// Returns the date before which a client has to respond with information regarding a request for a product.
export function calculateUserActionDeadline(
  dateFrom: string,
  daysUserActionRequired: number
) {
  return dateFrom
    ? defaultDateFormat(addDays(parseISO(dateFrom), daysUserActionRequired))
    : '';
}

// Returns the date before which municipality has to inform the client about a decision that has been made regarding his/her request for a product.
export function calculateDecisionDeadline(
  dateStart: string,
  daysSupplierActionRequired: number = 28,
  daysUserActionRequired: number = 28,
  daysRecoveryAction: number = 0
) {
  return defaultDateFormat(
    addDays(
      parseISO(dateStart),
      daysSupplierActionRequired + daysUserActionRequired + daysRecoveryAction
    )
  );
}

export function getDecision(decision: Decision): DecisionFormatted {
  return decision.toLocaleLowerCase().replace(/\s/gi, '') as DecisionFormatted;
}

export function getLatestStep(steps: Array<{ title: string }>) {
  return (
    [...processSteps].reverse().find((stepTitle) => {
      return !!steps.find((stepData) => stepTitle === stepData.title);
    }) || 'aanvraag'
  );
}

export function formatFocusDocument(
  datePublished: string,
  document: FocusDocumentFromSource,
  documentType: string
): GenericDocument {
  const { id, omschrijving: title, $ref: url } = document;
  return {
    id: String(id),
    title,
    url: `${API_BASE_PATH}/${url}`,
    datePublished,
    type: documentType,
  };
}

export function findProductContent(
  product: { type: ProductType; title: string },
  contentLabels: LabelData
) {
  const labelContent = contentLabels[product.type][product.title];

  if (!labelContent) {
    Sentry.captureMessage('TOZO: Unknown product label content', {
      extra: {
        productType: product.type,
        productTitle: product.title,
      },
    });
  }

  return labelContent;
}

export function findStepsContent(
  product: FocusProduct | FocusItem,
  contentLabels: LabelData
) {
  const stepsContent: ProductStepLabels & {
    besluit?: FocusStepContent;
  } = {};

  const labelContent = findProductContent(product, contentLabels);

  processSteps.forEach((stepTitle: string) => {
    const steps: Array<{ title: StepTitle }> = product.steps;
    const stepData = steps.find((step) => step.title === stepTitle);
    if (labelContent && stepTitle in labelContent) {
      const stepContent = labelContent[stepTitle];

      if (stepData && stepContent) {
        if (
          stepTitle === 'besluit' &&
          product.decision &&
          product.decision in stepContent
        ) {
          stepsContent[stepTitle] = (stepContent as FocusStepContentDecision)[
            product.decision
          ];
        } else if (stepTitle !== 'besluit') {
          stepsContent[stepTitle] = stepContent as FocusStepContent;
        }
      }
    }
  });

  return stepsContent;
}

function normalizeFocusSourceProductStep(
  product: FocusProductFromSource,
  [stepTitle, stepData]: [StepTitle, FocusProductStepFromSource]
) {
  // NOTE: Translation at base level to prevent mixed terms with similar meaning.
  if (stepTitle === 'beslissing') {
    stepTitle = 'besluit';
  }

  const stepNormalized: FocusProductStep = {
    id: stepTitle,
    title: stepTitle,
    documents:
      stepData.document.map((sourceDocument) =>
        formatFocusDocument(stepData.datum, sourceDocument, 'pdf')
      ) || [],
    datePublished: stepData.datum,
  };

  if (stepTitle === 'herstelTermijn' && stepData.aantalDagenHerstelTermijn) {
    stepNormalized.aantalDagenHerstelTermijn = parseInt(
      stepData.aantalDagenHerstelTermijn,
      10
    );
  }

  return stepNormalized;
}

export function normalizeFocusSourceProduct(product: FocusProductFromSource) {
  const steps = Object.entries(product.processtappen)
    // Filter out steps that don't have any data assiciated
    .filter(
      (stepEntry): stepEntry is [StepTitle, FocusProductStepFromSource] =>
        stepEntry[1] !== null
    )
    .map((step) => normalizeFocusSourceProductStep(product, step))
    .sort(dateSort('datePublished', 'asc'));

  const lastStep = steps[steps.length - 1];
  const firstStep = steps[0];
  const id = hash(`${product._id}-${lastStep.title}`);

  return {
    id,
    title: product.naam,
    type: product.soortProduct,
    decision: product.typeBesluit ? getDecision(product.typeBesluit) : null,
    steps,
    datePublished: lastStep.datePublished,
    dateStart: firstStep.datePublished,
    dienstverleningstermijn: product.dienstverleningstermijn,
    inspanningsperiode: product.inspanningsperiode,
  };
}

export function fillStepContent(
  product: FocusProduct,
  stepData: FocusProductStep,
  stepContent: FocusStepContent
): FocusItemStep {
  const additionalInformationStep = product.steps.find(
    (step) => step.title === 'herstelTermijn'
  );

  let aantalDagenHerstelTermijn = 0;
  if (additionalInformationStep) {
    aantalDagenHerstelTermijn =
      additionalInformationStep.aantalDagenHerstelTermijn || 0;
  }

  // deadline corresponding to the 'inBehandeling' step.
  const decisionDeadline1 = calculateDecisionDeadline(
    product.dateStart,
    product.dienstverleningstermijn,
    product.inspanningsperiode,
    0
  );

  // deadline for the Municiaplity corresponding to the 'herstelTermijn' step.
  const decisionDeadline2 = calculateDecisionDeadline(
    product.dateStart,
    product.dienstverleningstermijn,
    product.inspanningsperiode,
    aantalDagenHerstelTermijn
  );

  // deadline for the Client (Civilian) corresponding to the 'herstelTermijn' step.
  const userActionDeadline = calculateUserActionDeadline(
    stepData.datePublished,
    aantalDagenHerstelTermijn
  );

  const customData = {
    decisionDeadline1,
    decisionDeadline2,
    userActionDeadline,
  };

  return Object.assign(
    {},
    stepData,
    {
      product: product.title,
      description: stepContent.description(product, customData),
      status: stepContent.status,
      isActive: getLatestStep(product.steps) === stepData.title,
      isChecked: true,
    },
    stepData.title === 'besluit' ? { decision: product.decision } : null
  );
}

export function transformFocusProductSteps(
  product: FocusProduct,
  stepsContent: ReturnType<typeof findStepsContent>
) {
  return processSteps
    .map((stepTitle) => {
      const stepContent = stepsContent[stepTitle];
      const stepData = product.steps.find((step) => step.title === stepTitle);
      if (stepContent && stepData) {
        return fillStepContent(product, stepData, stepContent);
      }
      return null;
    })
    .filter((stepData): stepData is FocusItemStep => stepData !== null);
}

// This function transforms the source data from the api into readable/presentable messages for the client.
export function transformFocusProduct(
  product: FocusProduct,
  contentLabels: LabelData
): FocusItem {
  const stepsContent = findStepsContent(product, contentLabels);
  const productContent = findProductContent(product, contentLabels);
  const steps = transformFocusProductSteps(product, stepsContent);

  const productSanitized = omit(product, ['steps']);

  const link = Object.assign(
    {
      title: 'Meer informatie',
      to: AppRoutes.INKOMEN,
    },
    productContent.link ? productContent.link(product) : null
  );

  return Object.assign({}, productSanitized, {
    steps,
    link,
    status: steps[steps.length - 1].status,
  });
}

export function createFocusNotification(
  item: FocusItem,
  contentLabels: LabelData
) {
  const latestStepTitle = getLatestStep(item.steps);
  const stepsContent = findStepsContent(item, contentLabels)[latestStepTitle];
  const itemContent = findProductContent(item, contentLabels);

  const titleTransform = stepsContent?.notification?.title;
  const descriptionTransform = stepsContent?.notification?.description;
  const linkTransform = stepsContent?.notification?.link || itemContent?.link;

  return {
    id: `${item.id}-notification`,
    datePublished: item.datePublished,
    chapter:
      item.productTitle === 'Stadspas' ? Chapters.STADSPAS : Chapters.INKOMEN,
    title: titleTransform
      ? titleTransform(item)
      : `Update: ${item.title} aanvraag.`,
    description: descriptionTransform
      ? descriptionTransform(item)
      : `U hebt updates over uw ${item.title}-aanvraag.`,
    link: Object.assign(
      {
        to: AppRoutes.INKOMEN,
        title: 'Bekijk hoe het met uw aanvraag staat',
      },
      linkTransform ? linkTransform(item) : {}
    ),
  };
}

export function createFocusRecentCase(item: FocusItem): MyCase {
  return {
    id: `${item.id}-case`,
    title: item.title,
    link: item.link,
    chapter: Chapters.INKOMEN,
    datePublished: item.datePublished,
  };
}

export function translateFocusProduct(
  product: FocusProduct,
  titleTranslations: DocumentTitles
) {
  const prod = Object.assign({}, product);

  prod.title = titleTranslations[prod.title] || prod.title;
  prod.productTitle = prod.title;

  prod.steps = prod.steps.map((step) => {
    return Object.assign({}, step, {
      documents: step.documents.map((doc) => {
        return Object.assign({}, doc, {
          title: titleTranslations[doc.title] || doc.title,
        });
      }),
    });
  });

  return prod;
}

// Tozo/Tonk items, stadspasaanvraag, bijstandsaanvraag
export function isNotificationActual(datePublished: string, compareDate: Date) {
  const difference = differenceInMonths(compareDate, new Date(datePublished));
  return difference < MONTHS_TO_KEEP_AANVRAAG_NOTIFICATIONS;
}
