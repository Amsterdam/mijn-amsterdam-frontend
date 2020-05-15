import { processSteps, DAYS_KEEP_RECENT } from './focus-aanvragen-content';
import {
  StepTitle,
  FocusDocument,
  Decision,
  DecisionFormatted,
  TextPartContents,
  ProductTitle,
  FocusProduct,
  DocumentTitles,
  LabelData,
  Info,
  FocusProductFromSource,
  FocusProductStep,
} from './focus-types';
import { GenericDocument } from '../../../universal/types';
import { defaultDateFormat } from '../../../universal/helpers';
import { addDays, parseISO, differenceInCalendarDays } from 'date-fns';
import { API_BASE_PATH } from '../../../universal/config/api';
import { Decision, FocusProductStepFromSource } from './focus-types';

/** Checks if an item returned from the api is considered recent */
export function isRecentItem(
  decision: DecisionFormatted,
  steps: FocusProduct['processtappen'],
  compareDate: Date
) {
  const noDecision = !decision;

  let hasRecentDecision = false;

  if (steps.beslissing !== null) {
    hasRecentDecision =
      differenceInCalendarDays(compareDate, new Date(steps.beslissing.datum)) <
      DAYS_KEEP_RECENT;
  }

  return noDecision || hasRecentDecision;
}

export function parseLabelContent(text: TextPartContents, data: any): string {
  let rText = text || '';

  if (typeof rText === 'function') {
    return rText(data);
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

export function getLatestStep(steps: FocusProduct['processtappen']) {
  return (
    [...processSteps].reverse().find(step => {
      return step in steps && steps[step] !== null;
    }) || 'aanvraag'
  );
}

export function formatFocusDocument(
  datePublished: string,
  document: FocusDocument,
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

export function findLatestStepWithLabels({
  productType,
  productTitle,
  steps,
  contentLabels,
}: {
  productType: FocusProduct['soortProduct'];
  productTitle: FocusProduct['naam'];
  steps: FocusProduct['processtappen'];
  contentLabels: LabelData;
}) {
  // Find the latest active step of the request process.
  const latestStep = [...processSteps].reverse().find(step => {
    const hasStepData = step in steps && steps[step] !== null;
    const hasLabelData = !!contentLabels[productType][productTitle][step];
    return hasStepData && hasLabelData;
  });

  return latestStep;
}

export function findStepsWithLabels({
  productType,
  productTitle,
  steps,
  decision,
  contentLabels,
}: {
  productType: FocusProduct['soortProduct'];
  productTitle: FocusProduct['naam'];
  steps: FocusProduct['processtappen'];
  decision?: DecisionFormatted;
  contentLabels: LabelData;
}) {
  const stepsWithLabels: Info[] = processSteps
    .map(step => {
      const hasStepData = step in steps && steps[step] !== null;
      const hasLabelData = !!contentLabels[productType][productTitle][step];

      if (hasStepData && hasLabelData) {
        const stepLabels = contentLabels[productType][productTitle][step];
        if (
          stepLabels &&
          stepLabels.isDecisionInfo &&
          decision &&
          stepLabels[decision]
        ) {
          return stepLabels[decision];
        }
      }
      return null;
    })
    .filter((step): step is Info => step !== null);

  return stepsWithLabels;
}

export function normalizeFocusSourceProduct(item: FocusProductFromSource, titleTranslations: Record<FocusProductFromSource['naam'], string>) {
  const processSteps = item.processtappen;
  const latestStep = getLatestStep(processSteps);
  const steps = Object.entries(item.processtappen).filter(
      ([stepTitle, stepData]) => stepData !== null // TODO: Make explicit filter TS typing
    ).map((stepEntry) => {
      const [stepTitle, stepData]: [StepTitle, FocusProductStepFromSource] = stepEntry;
      const stepNormalized: FocusProductStep = {
        title: stepTitle,
        documents: stepData.document.map(sourceDocument => formatFocusDocument(stepData.datum, sourceDocument, 'PDF')) || [],
        datePublished: stepData.datum,
      }
      return stepNormalized;
    })
  return {
    id: `${item._id}-${latestStep}`,
    title: titleTranslations[item.naam] || item.naam,
    type: item.soortProduct,
    decision: item.typeBesluit ? getDecision(item.typeBesluit)
    steps,
    datePublished: processSteps[latestStep]?.datum || '',
    dienstverleningstermijn: item.dienstverleningstermijn,
    inspanningsperiode: item.inspanningsperiode,
  };
}
