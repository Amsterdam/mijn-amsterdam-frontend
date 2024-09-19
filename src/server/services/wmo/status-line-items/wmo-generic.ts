import isAfter from 'date-fns/isAfter';
import isSameDay from 'date-fns/isSameDay';
import parseISO from 'date-fns/parseISO';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';
import {
  defaultDateFormat,
  isDateInPast,
} from '../../../../universal/helpers/date';
import { GenericDocument } from '../../../../universal/types';
import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types';
import {
  DOCUMENT_PGB_BESLUIT,
  DOCUMENT_TITLE_BESLUIT_STARTS_WITH,
  DOCUMENT_TITLE_MEER_INFORMATIE_STARTS_WITH,
  DOCUMENT_UPLOAD_LINK_MEER_INFORMATIE,
  MINIMUM_REQUEST_DATE_FOR_DOCUMENTS,
} from '../wmo-config-and-types';

function getDecisionDocument(documents: GenericDocument[]) {
  return documents.find((document) =>
    document.title.startsWith(DOCUMENT_TITLE_BESLUIT_STARTS_WITH)
  );
}

export function getDocumentDecisionDate(documents: GenericDocument[]) {
  return getDecisionDocument(documents)?.datePublished ?? null;
}

export function hasDecision(aanvraag: ZorgnedAanvraagTransformed) {
  const hasDecision = isDocumentDecisionDateActive(aanvraag.datumAanvraag)
    ? !!getDecisionDocument(aanvraag.documenten)
    : !!aanvraag.resultaat;

  return hasDecision;
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

function getDecisionDateTransformed(aanvraag: ZorgnedAanvraagTransformed) {
  const DO_TRANSFORM = true;
  return getDecisionDate(aanvraag, DO_TRANSFORM);
}

export function getDocumentMeerInformatieDate(documents: GenericDocument[]) {
  return (
    documents.find((document) =>
      document.title.startsWith(DOCUMENT_TITLE_MEER_INFORMATIE_STARTS_WITH)
    )?.datePublished ?? null
  );
}

export function hasMeerInformatieNodig(aanvraag: ZorgnedAanvraagTransformed) {
  return aanvraag.documenten.some((document) =>
    document.title.startsWith(DOCUMENT_TITLE_MEER_INFORMATIE_STARTS_WITH)
  );
}

export function isAfterWCAGValidDocumentsDate(date: string) {
  return isAfter(parseISO(date), MINIMUM_REQUEST_DATE_FOR_DOCUMENTS);
}

// TODO: Determine if there are any other conditions that can be used.
// For example we might want to enable the document decision date based on a fixed date.
// It's unknown right now if all the existing data (documents) adhere to the updated document names.
function isDocumentDecisionDateActive(datumAanvraag: string) {
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
  status: 'Aanvraag ontvangen',
  datePublished: '',
  isChecked: () => true,
  isActive: () => false,
  description: () => {
    return '<p>Uw aanvraag is ontvangen</p>';
  },
};

export const MEER_INFORMATIE: ZorgnedStatusLineItemTransformerConfig = {
  status: 'Meer informatie nodig',
  isVisible: (stepIndex, aanvraag) => hasMeerInformatieNodig(aanvraag),
  datePublished: (aanvraag) =>
    getDocumentMeerInformatieDate(aanvraag.documenten) ?? '',
  isChecked: (stepIndex, aanvraag) => true,
  isActive: (stepIndex, aanvraag) =>
    hasMeerInformatieNodig(aanvraag) && !hasDecision(aanvraag),
  description: () => {
    return `<p>
      Wij kunnen uw aanvraag nog niet beoordelen. U moet meer informatie aanleveren. Dat kan op 2 manieren:</p>
      <p>Uploaden via <a rel="noreferrer" class="ams-link ams-link--inline" href="${DOCUMENT_UPLOAD_LINK_MEER_INFORMATIE}">amsterdam.nl/zorgdocumenten</a> of opsturen naar ons gratis antwoordnummer:</p>
      <p>Gemeente Amsterdam <br />
      Services & Data <br />
      Antwoordnummer 9087 <br />
      1000 VV Amsterdam
    </p>`;
  },
};

export const IN_BEHANDELING: ZorgnedStatusLineItemTransformerConfig = {
  status: 'In behandeling',
  datePublished: (aanvraag) => aanvraag.datumBesluit || '', // NOTE: Zorgneds datumAfgifte is used by OJZD to set status to  "In behandeling"
  isChecked: (stepIndex, aanvraag) => !!aanvraag.datumBesluit,
  isActive: (stepIndex, aanvraag) =>
    !!aanvraag.datumBesluit &&
    !hasDecision(aanvraag) &&
    !hasMeerInformatieNodig(aanvraag),
  description: (aanvraag) => {
    return '<p>Uw aanvraag is in behandeling</p>';
  },
};

export function getTransformerConfigBesluit(
  isActive: ZorgnedStatusLineItemTransformerConfig['isActive'],
  useAsProduct: boolean
): ZorgnedStatusLineItemTransformerConfig {
  return {
    status: 'Besluit genomen',
    datePublished: (aanvraag) => getDecisionDate(aanvraag) ?? '',
    isChecked: (stepIndex, aanvraag) => hasDecision(aanvraag),
    isActive: isActive,
    description: (aanvraag) =>
      hasDecision(aanvraag)
        ? `<p>
         ${
           aanvraag.resultaat === 'toegewezen'
             ? `U krijgt ${useAsProduct ? 'een ' : ''}${aanvraag.titel} ${aanvraag.datumIngangGeldigheid ? `per ${defaultDateFormat(aanvraag.datumIngangGeldigheid)}` : ''}`
             : `U krijgt geen ${aanvraag.titel}`
         }.
      </p>
      ${decisionParagraph(aanvraag)}
      `
        : '',
  };
}

export const EINDE_RECHT: ZorgnedStatusLineItemTransformerConfig = {
  status: 'Einde recht',
  datePublished: (aanvraag) =>
    (aanvraag.isActueel ? '' : aanvraag.datumEindeGeldigheid) || '',
  isVisible: (stepIndex, aanvraag, today, allAanvragen) => {
    return hasDecision(aanvraag) && aanvraag.resultaat !== 'afgewezen';
  },
  isChecked: (stepIndex, aanvraag) => aanvraag.isActueel === false,
  isActive: (stepIndex, aanvraag, today) => aanvraag.isActueel === false,
  description: (aanvraag) =>
    `<p>
      ${
        aanvraag.isActueel
          ? `Als uw recht op ${aanvraag.titel} stopt, krijgt u hiervan bericht.`
          : `Uw recht op ${aanvraag.titel} is beëindigd${aanvraag.datumEindeGeldigheid ? ` per ${defaultDateFormat(aanvraag.datumEindeGeldigheid)}` : ''}.`
      }
    </p>
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

export function isBeforeToday(dateStr: string | null, compareDate: Date) {
  if (!dateStr) {
    return false;
  }
  return isSameDay(parseISO(dateStr), compareDate)
    ? false
    : isDateInPast(dateStr, compareDate);
}

export function isServiceDeliveryStarted(
  sourceData: ZorgnedAanvraagTransformed,
  compareDate: Date
) {
  return isBeforeToday(sourceData.datumBeginLevering, compareDate);
}

export function isServiceDeliveryStopped(
  sourceData: ZorgnedAanvraagTransformed,
  compareDate: Date
) {
  return isBeforeToday(sourceData.datumEindeLevering, compareDate);
}

export function isServiceDeliveryStatusActive(
  sourceData: ZorgnedAanvraagTransformed,
  compareDate: Date
) {
  return (
    sourceData.isActueel &&
    isServiceDeliveryStarted(sourceData, compareDate) &&
    !isServiceDeliveryStopped(sourceData, compareDate) &&
    !isBeforeToday(sourceData.datumEindeGeldigheid, compareDate)
  );
}

export function isDecisionStatusActive(
  stepIndex: number,
  aanvraag: ZorgnedAanvraagTransformed
) {
  if (aanvraag.resultaat === 'toegewezen') {
    return (
      hasDecision(aanvraag) &&
      !isBeforeToday(aanvraag.datumEindeGeldigheid, new Date())
    );
  } else if (aanvraag.resultaat === 'afgewezen') {
    return true;
  }
  return false;
}

export function isDecisionWithDeliveryStatusActive(
  stepIndex: number,
  aanvraag: ZorgnedAanvraagTransformed,
  today: Date
) {
  return (
    aanvraag.resultaat === 'afgewezen' ||
    (isDecisionStatusActive(stepIndex, aanvraag) &&
      !isBeforeToday(aanvraag.datumOpdrachtLevering, today) &&
      !isServiceDeliveryStarted(aanvraag, today))
  );
}

export function isDeliveryStepVisible(
  stepIndex: number,
  aanvraag: ZorgnedAanvraagTransformed,
  today: Date
) {
  return (
    hasDecision(aanvraag) &&
    aanvraag.resultaat !== 'afgewezen' &&
    (isServiceDeliveryStarted(aanvraag, today) ||
      // Not yet delivered and not ended yet.
      (!isServiceDeliveryStarted(aanvraag, today) &&
        !isBeforeToday(aanvraag.datumEindeGeldigheid, today)))
  );
}
