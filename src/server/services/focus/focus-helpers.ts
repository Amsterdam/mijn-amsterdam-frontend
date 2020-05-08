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
} from './focus-types';
import { GenericDocument } from '../../../universal/types';
import { defaultDateFormat } from '../../../universal/helpers';
import { addDays, parseISO, differenceInCalendarDays } from 'date-fns';

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

export function translateProductTitle(title: ProductTitle) {
  switch (title) {
    case 'Levensonderhoud':
      return 'Bijstandsuitkering';
  }
  return title;
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
  stepTitle: StepTitle,
  datePublished: string,
  document: FocusDocument,
  contentDocumentTitles: DocumentTitles
): GenericDocument {
  const { id, omschrijving: title, $ref: url } = document;
  return {
    id: String(id),
    title: contentDocumentTitles[title] || title,
    url: `/api/${url}`,
    datePublished,
    type: stepTitle,
  };
}
