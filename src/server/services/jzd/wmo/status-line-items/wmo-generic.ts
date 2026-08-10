import { isAfter, isSameDay, parseISO } from 'date-fns';

import { FeatureToggle } from '../../../../../universal/config/feature-toggles.ts';
import {
  defaultDateFormat,
  isDateInPast,
} from '../../../../../universal/helpers/date.ts';
import type { GenericDocument } from '../../../../../universal/types/App.types.ts';
import type {
  ZorgnedAanvraagTransformed,
  ZorgnedProcesAanvraagActieTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../../zorgned/zorgned-types.ts';
import { DECISION_STEP_STATUS, jzdStatusStepActies } from '../wmo-config.ts';
import {
  DOCUMENT_PGB_BESLUIT,
  DOCUMENT_TITLE_BESLUIT_STARTS_WITH,
  DOCUMENT_TITLE_MEER_INFORMATIE_STARTS_WITH,
  DOCUMENT_UPLOAD_LINK_MEER_INFORMATIE,
  FAKE_DECISION_DOCUMENT_ID,
  MINIMUM_REQUEST_DATE_FOR_DOCUMENTS,
} from '../wmo-config.ts';

type ActieOmschrijving =
  (typeof jzdStatusStepActies)[keyof typeof jzdStatusStepActies];

function getActieStepByOmschrijving(
  aanvraag: ZorgnedAanvraagTransformed,
  omschrijving: ActieOmschrijving
): ZorgnedProcesAanvraagActieTransformed | null {
  return (
    aanvraag?.procesAanvraag?.acties.find(
      (actie) => actie.omschrijving === omschrijving
    ) ?? null
  );
}

function hasActieStepByOmschrijving(
  aanvraag: ZorgnedAanvraagTransformed,
  omschrijving: ActieOmschrijving
) {
  return !!getActieStepByOmschrijving(aanvraag, omschrijving);
}

function getActieStepDatumByOmschrijving(
  aanvraag: ZorgnedAanvraagTransformed,
  omschrijving: ActieOmschrijving
): string | '' {
  return getActieStepByOmschrijving(aanvraag, omschrijving)?.datum ?? '';
}

function getActieBasedAanvraagStep(aanvraag: ZorgnedAanvraagTransformed) {
  return getActieStepByOmschrijving(aanvraag, jzdStatusStepActies.AANVRAAG);
}

function getActieBasedAanvraagStepDatum(aanvraag: ZorgnedAanvraagTransformed) {
  return getActieStepDatumByOmschrijving(
    aanvraag,
    jzdStatusStepActies.AANVRAAG
  );
}

function getActieBasedInBehandelingStep(aanvraag: ZorgnedAanvraagTransformed) {
  return getActieStepByOmschrijving(
    aanvraag,
    jzdStatusStepActies.IN_BEHANDELING
  );
}

function isActieBasedInBehandelingStepActive(
  aanvraag: ZorgnedAanvraagTransformed
) {
  const actieStep = getActieBasedInBehandelingStep(aanvraag);
  return actieStep ? actieStep.status !== 'Klaar' : false;
}

function getActieBasedInBehandelingStepDatum(
  aanvraag: ZorgnedAanvraagTransformed
) {
  return getActieStepDatumByOmschrijving(
    aanvraag,
    jzdStatusStepActies.IN_BEHANDELING
  );
}

function hasActieBasedInBehandelingStep(aanvraag: ZorgnedAanvraagTransformed) {
  return hasActieStepByOmschrijving(
    aanvraag,
    jzdStatusStepActies.IN_BEHANDELING
  );
}

function getActieBasedMeerInformatieStep(aanvraag: ZorgnedAanvraagTransformed) {
  return getActieStepByOmschrijving(
    aanvraag,
    jzdStatusStepActies.MEER_INFORMATIE
  );
}

function hasActieBasedMeerInformatieStep(aanvraag: ZorgnedAanvraagTransformed) {
  return hasActieStepByOmschrijving(
    aanvraag,
    jzdStatusStepActies.MEER_INFORMATIE
  );
}

function isActieBasedMeerInformatieStepActive(
  aanvraag: ZorgnedAanvraagTransformed
) {
  const actieStep = getActieBasedMeerInformatieStep(aanvraag);
  return actieStep ? actieStep.status !== 'Klaar' : false;
}

function getActieBasedMeerInformatieStepDatum(
  aanvraag: ZorgnedAanvraagTransformed
) {
  return getActieStepDatumByOmschrijving(
    aanvraag,
    jzdStatusStepActies.MEER_INFORMATIE
  );
}

export function isActiesBasedAanvraag(aanvraag: ZorgnedAanvraagTransformed) {
  return !!getActieStepByOmschrijving(aanvraag, jzdStatusStepActies.AANVRAAG);
}

function getLastDocumentStartsWithTitle(
  documents: GenericDocument[] | undefined,
  title: string
) {
  return (
    documents?.findLast((document) => document?.title.startsWith(title)) ?? null
  );
}

export function getDecisionDocument(documents: GenericDocument[]) {
  return getLastDocumentStartsWithTitle(
    documents,
    DOCUMENT_TITLE_BESLUIT_STARTS_WITH
  );
}

function hasValidDecisionDocument(aanvraag: ZorgnedAanvraagTransformed) {
  const decisionDocument = getDecisionDocument(aanvraag.documenten);
  const hasDecisionDocument =
    !!decisionDocument && decisionDocument.id !== FAKE_DECISION_DOCUMENT_ID;
  return hasDecisionDocument;
}

export function getDocumentDecisionDate(documents: GenericDocument[]) {
  return getDecisionDocument(documents)?.datePublished ?? null;
}

export function hasDecision(aanvraag: ZorgnedAanvraagTransformed) {
  if (isDocumentDecisionDateActive(aanvraag.datumAanvraag)) {
    return hasValidDecisionDocument(aanvraag);
  }

  return !!aanvraag.resultaat;
}

function getDecisionDate(
  aanvraag: ZorgnedAanvraagTransformed,
  doTransformDate: boolean = false
) {
  let decisionDate = isDocumentDecisionDateActive(aanvraag.datumAanvraag)
    ? getDocumentDecisionDate(aanvraag.documenten)
    : aanvraag.datumBesluit;

  if (doTransformDate && decisionDate) {
    decisionDate = defaultDateFormat(decisionDate);
  }
  return decisionDate ?? null;
}

export function getDocumentMeerInformatieDate(documents: GenericDocument[]) {
  return (
    getLastDocumentStartsWithTitle(
      documents,
      DOCUMENT_TITLE_MEER_INFORMATIE_STARTS_WITH
    )?.datePublished ?? null
  );
}

export function hasMeerInformatieNodigDocumentAttached(
  aanvraag: ZorgnedAanvraagTransformed
) {
  return aanvraag.documenten.some((document) =>
    document.title.startsWith(DOCUMENT_TITLE_MEER_INFORMATIE_STARTS_WITH)
  );
}

export function isAfterWCAGValidDocumentsDate(date: string) {
  return isAfter(parseISO(date), MINIMUM_REQUEST_DATE_FOR_DOCUMENTS);
}

export function isCancelled(aanvraag: ZorgnedAanvraagTransformed) {
  // We consider an aanvraag cancelled if the start and end date of the validity are the same.
  // This is based on the data we have, but it is not 100% certain that this will always be the case.
  return aanvraag.datumIngangGeldigheid && aanvraag.datumEindeGeldigheid
    ? aanvraag.datumIngangGeldigheid === aanvraag.datumEindeGeldigheid
    : false;
}

export function isEindeGeldigheidVerstreken(
  datumEindeGeldigheid: string | null,
  compareDate: Date
) {
  const isEindeGeldigheidVerstreken = datumEindeGeldigheid
    ? isSameDay(parseISO(datumEindeGeldigheid), compareDate) ||
      isDateInPast(datumEindeGeldigheid, compareDate)
    : false;

  return isEindeGeldigheidVerstreken;
}

// TODO: Determine if there are any other conditions that can be used.
// For example we might want to enable the document decision date based on a fixed date.
// It's unknown right now if all the existing data (documents) adhere to the updated document names.
export function isDocumentDecisionDateActive(datumAanvraag: string) {
  return (
    isAfterWCAGValidDocumentsDate(datumAanvraag) &&
    FeatureToggle.zorgnedDocumentDecisionDateActive
  );
}

export function decisionParagraph(aanvraag: ZorgnedAanvraagTransformed) {
  let paragraph = '<p>In de brief leest u meer over dit besluit. ';
  if (isAfterWCAGValidDocumentsDate(aanvraag.datumAanvraag)) {
    paragraph += 'De brief staat bovenaan deze pagina.';
  } else {
    paragraph += 'De brief is per post naar u verstuurd.';
  }
  paragraph += '</p>';

  return paragraph;
}

export const AANVRAAG: ZorgnedStatusLineItemTransformerConfig = {
  status: 'Melding ontvangen',
  datePublished: (aanvraag) => {
    return isActiesBasedAanvraag(aanvraag)
      ? getActieBasedAanvraagStepDatum(aanvraag)
      : '';
  },
  isChecked: () => true,
  isActive: (aanvraag) => {
    if (isActiesBasedAanvraag(aanvraag)) {
      return (
        !hasActieBasedInBehandelingStep(aanvraag) && !hasDecision(aanvraag)
      );
    }
    return false;
  },
  description: () => {
    return '<p>Wij hebben uw melding ontvangen.</p>';
  },
};

export const MEER_INFORMATIE: ZorgnedStatusLineItemTransformerConfig = {
  status: 'Meer informatie nodig',
  isVisible: (aanvraag) => {
    if (isActiesBasedAanvraag(aanvraag)) {
      return hasActieBasedMeerInformatieStep(aanvraag);
    }
    return hasMeerInformatieNodigDocumentAttached(aanvraag);
  },
  datePublished: (aanvraag) => {
    const NO_DATE = '';
    if (isActiesBasedAanvraag(aanvraag)) {
      return getActieBasedMeerInformatieStepDatum(aanvraag);
    }
    return getDocumentMeerInformatieDate(aanvraag.documenten) ?? NO_DATE;
  },
  isChecked: () => true,
  isActive: (aanvraag) => {
    if (isActiesBasedAanvraag(aanvraag)) {
      return isActieBasedMeerInformatieStepActive(aanvraag);
    }
    return !hasDecision(aanvraag);
  },
  description: () => {
    return `<p>Wij kunnen uw aanvraag nog niet beoordelen. U moet meer informatie aanleveren. Dat kan op 2 manieren:</p>
      <p>Uploaden via <a rel="noreferrer" class="ams-link ams-link--inline" href="${DOCUMENT_UPLOAD_LINK_MEER_INFORMATIE}">amsterdam.nl/zorgdocumenten</a> of opsturen naar ons gratis antwoordnummer:</p>
      <p>Gemeente Amsterdam <br />
      Services & Data <br />
      Antwoordnummer 9087 <br />
      1000 VV Amsterdam</p>`;
  },
};

export const IN_BEHANDELING: ZorgnedStatusLineItemTransformerConfig = {
  status: 'In behandeling',
  datePublished: (aanvraag) => {
    const NO_DATE = '';
    if (isActiesBasedAanvraag(aanvraag)) {
      return getActieBasedInBehandelingStepDatum(aanvraag);
    }
    return aanvraag.datumBesluit || NO_DATE; // NOTE: Zorgneds datumAfgifte is used by OJZD to set status to  "In behandeling"
  },
  isChecked: (aanvraag) => {
    if (isActiesBasedAanvraag(aanvraag)) {
      return hasActieBasedInBehandelingStep(aanvraag);
    }
    return !!aanvraag.datumBesluit;
  },
  isActive: (aanvraag) => {
    if (isActiesBasedAanvraag(aanvraag)) {
      return isActieBasedInBehandelingStepActive(aanvraag);
    }
    return (
      aanvraag.isActueel &&
      !hasMeerInformatieNodigDocumentAttached(aanvraag) &&
      !hasDecision(aanvraag)
    );
  },
  description: () => {
    return '<p>Uw aanvraag is in behandeling.</p>';
  },
};

export function getTransformerConfigBesluit(
  isActive: ZorgnedStatusLineItemTransformerConfig['isActive'],
  useAsProduct: boolean
): ZorgnedStatusLineItemTransformerConfig {
  return {
    status: DECISION_STEP_STATUS,
    datePublished: (aanvraag) => {
      const NO_DATE = '';
      const decisionDate = getDecisionDate(aanvraag) ?? NO_DATE;
      return hasDecision(aanvraag) ? decisionDate : NO_DATE;
    },
    isChecked: (aanvraag) => {
      if (isActiesBasedAanvraag(aanvraag)) {
        return (
          !isActieBasedInBehandelingStepActive(aanvraag) &&
          hasDecision(aanvraag)
        );
      }
      return hasDecision(aanvraag);
    },
    isActive,
    isVisible: (aanvraag) => {
      if (isActiesBasedAanvraag(aanvraag)) {
        return true;
      }
      return !aanvraag.isActueel ? hasDecision(aanvraag) : true;
    },
    description: (aanvraag) => {
      return hasDecision(aanvraag)
        ? `<p>${
            aanvraag.resultaat === 'toegewezen'
              ? `U krijgt ${
                  useAsProduct ? 'een ' : ''
                }${aanvraag.titel} ${aanvraag.datumIngangGeldigheid ? `per ${defaultDateFormat(aanvraag.datumIngangGeldigheid)}` : ''}`
              : `U krijgt geen ${aanvraag.titel}`
          }.</p>
      ${decisionParagraph(aanvraag)}
      `
        : '';
    },
  };
}

export const EINDE_RECHT: ZorgnedStatusLineItemTransformerConfig = {
  status: 'Einde recht',
  datePublished: (aanvraag) =>
    (aanvraag.isActueel ? '' : aanvraag.datumEindeGeldigheid) || '',
  isVisible: (aanvraag) => {
    return hasDecision(aanvraag)
      ? aanvraag.resultaat !== 'afgewezen'
      : !!aanvraag.datumEindeGeldigheid;
  },
  isChecked: (aanvraag) => aanvraag.isActueel === false,
  isActive: (aanvraag) => aanvraag.isActueel === false,
  description: (aanvraag) =>
    `<p>${
      aanvraag.isActueel
        ? `Als uw recht op ${aanvraag.titel} stopt, krijgt u hiervan bericht.`
        : `Uw recht op ${aanvraag.titel} is beëindigd${aanvraag.datumEindeGeldigheid ? ` per ${defaultDateFormat(aanvraag.datumEindeGeldigheid)}` : ''}.`
    }</p>
    `,
};

export const EINDE_RECHT_PGB: ZorgnedStatusLineItemTransformerConfig = {
  ...EINDE_RECHT,
  description: (aanvraag) =>
    `<p>
      ${
        aanvraag.datumEindeGeldigheid
          ? aanvraag.isActueel
            ? `Uw recht op ${aanvraag.titel} stopt op ${aanvraag.datumEindeGeldigheid ? `${defaultDateFormat(aanvraag.datumEindeGeldigheid)}` : ''}.`
            : `Uw recht op ${aanvraag.titel} is beëindigd ${aanvraag.datumEindeGeldigheid ? `per ${defaultDateFormat(aanvraag.datumEindeGeldigheid)}` : ''}.`
          : ``
      }
    </p>
    ${
      aanvraag.isActueel && aanvraag.leveringsVorm === 'PGB'
        ? `
          <p>Wilt u verlenging aanvragen, dan moet u dat 8 weken voor ${aanvraag.datumEindeGeldigheid ? `${defaultDateFormat(aanvraag.datumEindeGeldigheid)}` : 'de einddatum'} doen.</p>
          <p>Kijk in uw besluit of op <a rel="noreferrer" class="ams-link ams-link--inline" href="${DOCUMENT_PGB_BESLUIT}">amsterdam.nl/pgb</a> voor meer informatie.</p>`
        : ''
    }
    `,
};

export function isDelivered(
  sourceData: ZorgnedAanvraagTransformed,
  compareDate: Date
) {
  return (
    !!sourceData.datumBeginLevering &&
    isDateInPast(sourceData.datumBeginLevering, compareDate)
  );
}

export function isDeliveryStopped(
  sourceData: ZorgnedAanvraagTransformed,
  compareDate: Date
) {
  return (
    !!sourceData.datumEindeLevering &&
    isDateInPast(sourceData.datumEindeLevering, compareDate)
  );
}

export function isDeliveredStatusActive(
  aanvraag: ZorgnedAanvraagTransformed,
  compareDate: Date
) {
  return (
    aanvraag.isActueel &&
    isDelivered(aanvraag, compareDate) &&
    !isDeliveryStopped(aanvraag, compareDate) &&
    !isEindeGeldigheidVerstreken(aanvraag.datumEindeGeldigheid, compareDate)
  );
}

export function isDecisionStatusActive(aanvraag: ZorgnedAanvraagTransformed) {
  if (aanvraag.resultaat === 'toegewezen') {
    return (
      hasDecision(aanvraag) &&
      !isEindeGeldigheidVerstreken(aanvraag.datumEindeGeldigheid, new Date())
    );
  } else if (aanvraag.resultaat === 'afgewezen') {
    return true;
  }
  return false;
}

export function isDecisionWithDeliveryStatusActive(
  aanvraag: ZorgnedAanvraagTransformed,
  today: Date
) {
  if (isActiesBasedAanvraag(aanvraag)) {
    return hasActieBasedInBehandelingStep(aanvraag)
      ? isActieBasedInBehandelingStepActive(aanvraag)
      : false;
  }
  return (
    aanvraag.resultaat === 'afgewezen' ||
    (isDecisionStatusActive(aanvraag) &&
      !isOpdrachtGegeven(aanvraag, today) &&
      !isDelivered(aanvraag, today))
  );
}

export function isDeliveryStepVisible(
  aanvraag: ZorgnedAanvraagTransformed,
  today: Date
) {
  return (
    hasDecision(aanvraag) &&
    aanvraag.resultaat !== 'afgewezen' &&
    (isDelivered(aanvraag, today) ||
      // Not yet delivered and not ended yet.
      (!isDelivered(aanvraag, today) &&
        !isEindeGeldigheidVerstreken(aanvraag.datumEindeGeldigheid, today)))
  );
}

export function isOpdrachtGegeven(
  sourceData: ZorgnedAanvraagTransformed,
  compareDate: Date
) {
  return (
    !!sourceData.datumOpdrachtLevering &&
    isDateInPast(sourceData.datumOpdrachtLevering, compareDate)
  );
}

export function isOpdrachtGegevenVisible(
  aanvraag: ZorgnedAanvraagTransformed,
  today: Date
) {
  return (
    hasDecision(aanvraag) &&
    aanvraag.resultaat !== 'afgewezen' &&
    (isOpdrachtGegeven(aanvraag, today) ||
      // Not yet given and not ended yet.
      (!isOpdrachtGegeven(aanvraag, today) &&
        !isEindeGeldigheidVerstreken(aanvraag.datumEindeGeldigheid, today)))
  );
}

export function isGeleverdVisible(
  aanvraag: ZorgnedAanvraagTransformed,
  today: Date
) {
  return (
    hasDecision(aanvraag) &&
    aanvraag.resultaat !== 'afgewezen' &&
    (isOpdrachtGegeven(aanvraag, today) ||
      // Not yet delivered and not ended yet.
      (!isOpdrachtGegeven(aanvraag, today) &&
        !isEindeGeldigheidVerstreken(aanvraag.datumEindeGeldigheid, today)))
  );
}
