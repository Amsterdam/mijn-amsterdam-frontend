import { addDays, differenceInCalendarDays, parseISO } from 'date-fns';
import { AppRoutes, Chapters, API_BASE_PATH } from '../../../universal/config';
import { defaultDateFormat, omit } from '../../../universal/helpers';
import { GenericDocument, MyCase } from '../../../universal/types';
import { DAYS_KEEP_RECENT, processSteps } from './focus-aanvragen-content';
import { LinkProps } from '../../../universal/types/App.types';
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
  StepTitle,
  TextPartContents,
} from './focus-types';

/** Checks if an item returned from the api is considered recent */
export function isRecentItem(
  steps: Array<{ title: string; datePublished: string }>,
  compareDate: Date
) {
  return steps.some(
    step =>
      step.title === 'beslissing' &&
      differenceInCalendarDays(compareDate, new Date(step.datePublished)) <
        DAYS_KEEP_RECENT
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

export function getLatestStep(steps: FocusProductStep[]) {
  return (
    [...processSteps].reverse().find(stepTitle => {
      return !!steps.find(stepData => stepTitle === stepData.title);
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

export function findStepsContent(
  product: FocusProduct,
  contentLabels: LabelData
) {
  const stepsContent: { [stepTitle in StepTitle]?: FocusStepContent } & {
    link?: LinkProps;
  } = {};

  const labelContent = contentLabels[product.type][product.title];

  processSteps.forEach(stepTitle => {
    const stepData = product.steps.find(step => step.title === stepTitle);
    const stepContent = labelContent[stepTitle];
    if (stepData && stepContent) {
      if (
        stepTitle === 'beslissing' &&
        product.decision &&
        product.decision in stepContent
      ) {
        stepsContent[stepTitle] = (stepContent as FocusStepContentDecision)[
          product.decision
        ];
      } else if (stepTitle !== 'beslissing') {
        stepsContent[stepTitle] = stepContent as FocusStepContent;
      }
    }
  });

  if (labelContent.link) {
    stepsContent.link = labelContent.link(product);
  }

  return stepsContent;
}

function normalizeFocusSourceProductStep(
  product: FocusProductFromSource,
  [stepTitle, stepData]: [StepTitle, FocusProductStepFromSource]
) {
  const stepNormalized: FocusProductStep = {
    id: `${product._id}-step-${stepTitle}`,
    title: stepTitle,
    documents:
      stepData.document.map(sourceDocument =>
        formatFocusDocument(stepData.datum, sourceDocument, 'PDF')
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
  const processSteps = product.processtappen;

  const steps = Object.entries(product.processtappen)
    .filter(
      (stepEntry): stepEntry is [StepTitle, FocusProductStepFromSource] =>
        stepEntry[1] !== null
    )
    .map(step => normalizeFocusSourceProductStep(product, step));

  const latestStep = getLatestStep(steps);

  return {
    id: `${product._id}-${latestStep}`,
    title: product.naam,
    type: product.soortProduct,
    decision: product.typeBesluit
      ? getDecision(product.typeBesluit)
      : undefined,
    steps,
    datePublished: processSteps[latestStep]?.datum || '',
    dateStart: processSteps.aanvraag?.datum || '',
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
    step => step.title === 'herstelTermijn'
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

  return Object.assign({}, stepData, {
    title: stepContent.title(product, customData),
    description: stepContent.description(product, customData),
    status: stepContent.status,
    isLastActive: false,
    isChecked: false,
  });
}

// This function transforms the source data from the api into readable/presentable messages for the client.
export function transformFocusProduct(
  product: FocusProduct,
  contentLabels: LabelData
): FocusItem {
  const stepsContent = findStepsContent(product, contentLabels);

  const steps = processSteps
    .map(stepTitle => {
      const stepContent = stepsContent[stepTitle];
      const stepData = product.steps.find(step => step.title === stepTitle);
      if (stepContent && stepData) {
        return fillStepContent(product, stepData, stepContent);
      }
      return null;
    })
    .filter((stepData): stepData is FocusItemStep => stepData !== null);

  const productSanitized = omit(product, [
    'steps',
    'dienstverleningstermijn',
    'inspanningsperiode',
  ]);

  const link = {
    title: stepsContent.link?.title || 'Meer informatie',
    to: stepsContent.link?.to || AppRoutes['INKOMEN'],
  };

  return Object.assign({}, productSanitized, {
    steps,
    link,
    displayDateStart: defaultDateFormat(productSanitized.dateStart),
    displayDatePublished: defaultDateFormat(productSanitized.datePublished),
    status: steps[steps.length - 1].status,
  });
}

export function transformFocusProductNotification(
  product: FocusProduct,
  contentLabels: LabelData
) {
  const latestStepTitle = getLatestStep(product.steps);
  const stepsContent = findStepsContent(product, contentLabels)[
    latestStepTitle
  ];
  const titleTransform = stepsContent?.notification.title;
  const descriptionTransform = stepsContent?.notification.title;
  const linkTransform = stepsContent?.notification.link;

  return {
    id: `${product.id}-notification`,
    datePublished: product.datePublished,
    chapter: Chapters.INKOMEN,
    title: titleTransform
      ? titleTransform(product)
      : `Update: ${product.title} aanvraag.`,
    description: descriptionTransform
      ? descriptionTransform(product)
      : `Er zijn updates in uw ${product.title} aanvraag.`,
    link: linkTransform
      ? linkTransform(product)
      : {
          to: AppRoutes['INKOMEN/TOZO'],
          title: 'Bekijk uw Tozo status',
        },
  };
}

export function transformFocusProductRecentCase(product: {
  id: string;
  datePublished: string;
  title: string;
}): MyCase {
  return {
    id: `${product.id}-case`,
    datePublished: product.datePublished,
    chapter: Chapters.INKOMEN,
    title: product.title,
    link: {
      to: AppRoutes['INKOMEN/TOZO'],
      title: 'Meer informatie',
    },
  };
}

export function translateFocusProduct(
  product: FocusProduct,
  titleTranslations: DocumentTitles
) {
  product.title = titleTranslations[product.title] || product.title;

  product.steps.forEach(step => {
    step.documents.forEach(doc => {
      doc.title = titleTranslations[doc.title] || doc.title;
    });
  });

  return product;
}
