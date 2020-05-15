import { addDays, differenceInCalendarDays, parseISO } from 'date-fns';
import { API_BASE_PATH } from '../../../universal/config/api';
import { defaultDateFormat, omit } from '../../../universal/helpers';
import { GenericDocument } from '../../../universal/types';
import { DAYS_KEEP_RECENT, processSteps } from './focus-aanvragen-content';
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
  LabelData,
  StepTitle,
  TextPartContents,
} from './focus-types';

/** Checks if an item returned from the api is considered recent */
export function isRecentItem(steps: FocusProductStep[], compareDate: Date) {
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
  daysSupplierActionRequired: number,
  daysUserActionRequired: number,
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
  contentDocumentTitles: DocumentTitles,
  documentType: string
): GenericDocument {
  const { id, omschrijving: title, $ref: url } = document;
  return {
    id: String(id),
    title: contentDocumentTitles[title] || title,
    url: `${API_BASE_PATH}/${url}`,
    datePublished,
    type: documentType,
  };
}

export function findStepsContent(
  product: FocusProduct,
  contentLabels: LabelData
) {
  const stepsContent: { [stepTitle in StepTitle]?: FocusStepContent } = {};

  processSteps.forEach(stepTitle => {
    const stepData = product.steps.find(step => step.title === stepTitle);
    const stepContent =
      contentLabels &&
      contentLabels[product.type] &&
      contentLabels[product.type]![product.title] &&
      contentLabels[product.type]![product.title]![stepTitle];

    if (stepData && stepContent) {
      const decision = product.decision;
      if (
        stepTitle === 'beslissing' &&
        decision &&
        'toekenning' in stepContent &&
        stepContent[decision]
      ) {
        stepsContent[stepTitle] = stepContent[decision];
      } else if (!decision && !('toekenning' in stepContent) && stepContent) {
        stepsContent[stepTitle] = stepContent as FocusStepContent;
      }
    }
  });

  return stepsContent;
}

function normalizeFocusSourceProductStep(
  [stepTitle, stepData]: [StepTitle, FocusProductStepFromSource],
  contentDocumentTitles: DocumentTitles
) {
  const stepNormalized: FocusProductStep = {
    id: `step-${stepTitle}`,
    title: stepTitle,
    documents:
      stepData.document.map(sourceDocument =>
        formatFocusDocument(
          stepData.datum,
          sourceDocument,
          contentDocumentTitles,
          'PDF'
        )
      ) || [],
    datePublished: stepData.datum,
    aantalDagenHerstelTermijn:
      stepTitle === 'herstelTermijn' && stepData.aantalDagenHerstelTermijn
        ? parseInt(stepData.aantalDagenHerstelTermijn, 10)
        : 0,
  };
  return stepNormalized;
}

export function normalizeFocusSourceProduct(
  item: FocusProductFromSource,
  titleTranslations: Record<FocusProductFromSource['naam'], string>,
  contentDocumentTitles: DocumentTitles
) {
  const processSteps = item.processtappen;

  const steps = Object.entries(item.processtappen)
    .filter(
      (stepEntry): stepEntry is [StepTitle, FocusProductStepFromSource] =>
        stepEntry[1] !== null
    )
    .map(step => normalizeFocusSourceProductStep(step, contentDocumentTitles));

  const latestStep = getLatestStep(steps);

  return {
    id: `${item._id}-${latestStep}`,
    title: titleTranslations[item.naam] || item.naam,
    type: item.soortProduct,
    decision: item.typeBesluit ? getDecision(item.typeBesluit) : undefined,
    steps,
    datePublished: processSteps[latestStep]?.datum || '',
    dateStart: processSteps.aanvraag?.datum || '',
    dienstverleningstermijn: item.dienstverleningstermijn,
    inspanningsperiode: item.inspanningsperiode,
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
  const steps = product.steps
    .map(stepData => {
      const stepContent = stepsContent[stepData.title];
      if (stepContent) {
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

  return Object.assign(productSanitized, { steps });
}
